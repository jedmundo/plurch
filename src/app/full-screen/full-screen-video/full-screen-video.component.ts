import { Component, OnInit, ViewChild, ElementRef, Renderer, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { VIDEO_COMMAND_TYPE, VideoCommand } from '../../manager/day-schedule/video-item/video-item.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const { ipcRenderer } = electron;

@Component({
    templateUrl: 'full-screen-video.component.html',
    styleUrls: ['full-screen-video.component.scss']
})
export class FullScreenVideoComponent implements OnInit, OnDestroy {

    @ViewChild('videoPlayer') private videoPlayerRef: ElementRef;

    public videoPath: SafeUrl;

    private itemId: string;
    private windowId: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private renderer: Renderer) {
    }

    public ngOnInit(): void {
        this.route.params
            .subscribe((params: Params) => {
                this.videoPath = this.sanitizer.bypassSecurityTrustResourceUrl(params['path'].replace(/___/g, '/'));
                this.itemId = params['id'];
                this.windowId = params['windowId'];
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

        ipcRenderer.on('retrieve-video-time', (event, parameters) => {
            if (parameters.itemId === this.itemId && parameters.windowId === this.windowId) {
                ipcRenderer.send('respond-video-time', { id: this.itemId, isPaused: video.paused, isMuted: video.muted, time: video.currentTime });
            }
        });

        ipcRenderer.on('remove-item', (event, parameters) => {
            if (parameters.itemId === this.itemId) {
                ipcRenderer.send('removed-item-playing', { id: this.itemId, windowId: this.windowId });
                this.router.navigate(['/fs/empty-window']);
            }
        });

        const video: HTMLMediaElement = this.videoPlayerRef.nativeElement;
        ipcRenderer.send('new-item-playing', { id: this.itemId, windowId: this.windowId, videoElement: video });

        this.renderer.listen(video, 'ended', () => {
            this.router.navigate(['/fs/empty-window']);
        });
    }

    public ngOnDestroy(): void {
        ipcRenderer.send('removed-item-playing', { id: this.itemId, windowId: this.windowId });
    }

}
