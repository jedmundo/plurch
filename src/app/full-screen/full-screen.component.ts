import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map';
import { PlayableItem, FILE_TYPE, VideoCommand, VIDEO_COMMAND_TYPE } from '../day-schedule/day-schedule.component';

const { remote, ipcRenderer, shell } = electron;

@Component({
    selector: 'app-full-screen',
    templateUrl: './full-screen.component.html',
    styleUrls: ['./full-screen.component.scss']
})
export class FullScreenComponent implements OnInit, AfterViewChecked {

    public FILE_TYPE = FILE_TYPE;
    public paramItem: PlayableItem;

    constructor(private route: ActivatedRoute) { }

    public ngOnInit(): void {
        this.route.params
            .subscribe((params: Params) => {
                const path = params['id'].split('____')[0].replace(/___/g, '/');
                const type: number = +params['id'].split('____')[1];
                this.paramItem = new PlayableItem(path, type === FILE_TYPE.DEFAULT ? FILE_TYPE.DEFAULT : FILE_TYPE.VIDEO);
            });

        ipcRenderer.on('send-video-type', (event, command: VIDEO_COMMAND_TYPE) => {
            const video: HTMLVideoElement = <HTMLVideoElement> document.getElementById('video_playback');
            switch (command) {
                case VIDEO_COMMAND_TYPE.PLAY:
                    return video.play();
                case VIDEO_COMMAND_TYPE.PAUSE:
                    return video.pause();
                case VIDEO_COMMAND_TYPE.RESTART:
                    return video.load();
            }
        });
    }

    public ngAfterViewChecked(): void {
        // const video: HTMLVideoElement = <HTMLVideoElement> document.getElementById('video_playback');
        // video.play();
    }

}
