import { Component, OnInit, AfterViewChecked, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map';
import { PlayableItem, FILE_TYPE } from '../day-schedule/day-schedule.component';
import { VIDEO_COMMAND_TYPE, VideoCommand } from '../day-schedule/video-item/video-item.component';

const { ipcRenderer } = electron;

@Component({
    templateUrl: 'full-screen-video.component.html',
    styleUrls: ['full-screen-video.component.scss']
})
export class FullScreenVideoComponent implements OnInit, AfterViewInit {

    @ViewChild('videoPlayer') private videoplayer: any;

    public videoPath: string;

    private videoPlayerElement;

    constructor(private route: ActivatedRoute) { }

    public ngOnInit(): void {
        this.route.params
            .subscribe((params: Params) => {
                const path = params['id'].replace(/___/g, '/');
                // const type: number = +params['id'].split('____')[1];
                this.videoPath = path;
            });

        ipcRenderer.on('send-video-type', (event, command: VideoCommand) => {
            const video = this.videoPlayerElement;
            switch (command.type) {
                case VIDEO_COMMAND_TYPE.PLAY:
                    return video.play();
                case VIDEO_COMMAND_TYPE.PAUSE:
                    return video.pause();
                case VIDEO_COMMAND_TYPE.MUTE:
                    return (<any> video).mute = true;
                case VIDEO_COMMAND_TYPE.UNMUTE:
                    return (<any> video).mute = false;
                case VIDEO_COMMAND_TYPE.RESTART:
                    return video.load();
                case VIDEO_COMMAND_TYPE.SYNC_TIME:
                    video.currentTime = command.value;
                    break;
            }
        });
    }

    public ngAfterViewInit(): void {
        this.videoPlayerElement = this.videoplayer.nativeElement;
    }

}
