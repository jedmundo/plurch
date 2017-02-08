import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Renderer } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map';
import { VIDEO_COMMAND_TYPE, VideoCommand } from '../../manager/day-schedule/video-item/video-item.component';

const { ipcRenderer } = electron;

@Component({
    templateUrl: 'full-screen-video.component.html',
    styleUrls: ['full-screen-video.component.scss']
})
export class FullScreenVideoComponent implements OnInit, AfterViewInit {

    @ViewChild('videoPlayer') private videoPlayerRef: ElementRef;

    public videoPath: string;

    constructor(
        private route: ActivatedRoute,
        private renderer: Renderer) {
    }

    public ngOnInit(): void {
        this.route.params
            .subscribe((params: Params) => {
                this.videoPath = params['id'].replace(/___/g, '/');
            });

        ipcRenderer.on('send-video-type', (event, command: VideoCommand) => {
            const video = this.videoPlayerRef.nativeElement;
            switch (command.type) {
                case VIDEO_COMMAND_TYPE.PLAY:
                    return this.renderer.invokeElementMethod(video, 'play');
                case VIDEO_COMMAND_TYPE.PAUSE:
                    return this.renderer.invokeElementMethod(video, 'pause');
                case VIDEO_COMMAND_TYPE.MUTE:
                    return this.renderer.setElementProperty(video, 'muted', true);
                case VIDEO_COMMAND_TYPE.UNMUTE:
                    return this.renderer.setElementProperty(video, 'muted', false);
                case VIDEO_COMMAND_TYPE.VOLUME:
                    return this.renderer.setElementProperty(video, 'volume', command.value);
                case VIDEO_COMMAND_TYPE.RESTART:
                    return this.renderer.invokeElementMethod(video, 'load');
                case VIDEO_COMMAND_TYPE.SYNC_TIME:
                    this.renderer.setElementProperty(video, 'currentTime', command.value);
                    break;
            }
        });
    }

    public ngAfterViewInit(): void {
    }

}
