import {
    Component, OnInit, Input, ViewChild, AfterViewInit, ElementRef, Renderer,
    EventEmitter
} from '@angular/core';
import { WindowManagementService } from '../../../shared/services/window-management.service';
import { PlayableItem } from '../../../shared/services/day-files-management.service';

export interface VideoCommand {
    type: VIDEO_COMMAND_TYPE;
    value?: number
}

export enum VIDEO_COMMAND_TYPE {
    PLAY,
    PAUSE,
    RESTART,
    SYNC_TIME,
    VOLUME,
    MUTE,
    UNMUTE
}

@Component({
    selector: 'plurch-video-item',
    templateUrl: 'video-item.component.html',
    styleUrls: ['video-item.component.scss']
})
export class VideoItemComponent implements OnInit, AfterViewInit {

    @ViewChild('videoPlayer') private videoPlayerRef: ElementRef;
    @ViewChild('seekBar') private seekBar: ElementRef;
    @ViewChild('volumeBar') private volumeBar: ElementRef;

    public currentVideoTime: number = 0;
    public currentVideoDuration: number = 0;
    public isMuted: boolean = false;

    public VIDEO_COMMAND_TYPE = VIDEO_COMMAND_TYPE;

    @Input() public file: PlayableItem;
    @Input() public newFileAddedToWindow?: EventEmitter<void>;
    @Input() public syncVideo?: EventEmitter<number>;

    // TODO: Ugly fix
    private isSyncing: boolean = false;

    constructor(
        private renderer: Renderer,
        private windowManagementService: WindowManagementService
    ) {
    }

    public ngOnInit() {
        if (this.newFileAddedToWindow) {
            this.newFileAddedToWindow.subscribe(() => {
                if (this.isPlayedOnExternalWindow) {
                    console.log('FILE IS ON EXTERNAL WINDOW');
                    const video = this.videoPlayerRef.nativeElement;
                    this.renderer.setElementProperty(video, 'muted', true);
                    setTimeout(() => {
                        if (!this.isPaused) {
                            this.windowManagementService.sendMessageToWindows(this.file, 'send-video-type', { type: VIDEO_COMMAND_TYPE.PLAY });
                        }
                        this.windowManagementService.sendMessageToWindows(this.file, 'send-video-type',
                            { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
                    }, 2000);
                }
            });
        }

        this.syncVideo.subscribe((response) => {
            if (response.id == this.file.id) {
                this.isSyncing = true;
                const video: HTMLMediaElement = this.videoPlayerRef.nativeElement;
                this.renderer.setElementProperty(video, 'currentTime', response.time);
                const value = (100 / video.duration) * response.time;
                this.currentVideoTime = response.time;
                this.seekBar.nativeElement.value = value;
                this.isMuted = response.isMuted;
                this.renderer.setElementProperty(video, 'muted', true);
                if (!response.isPaused) {
                    this.renderer.invokeElementMethod(video, 'play');
                }

                setTimeout(() => {
                    this.isSyncing = false;
                }, 500);
            }
        });
    }

    public ngAfterViewInit(): void {
        this.videoLoaded();
    }

    public sendVideoControls(command: VIDEO_COMMAND_TYPE): void {
        const video = this.videoPlayerRef.nativeElement;
        switch (command) {
            case VIDEO_COMMAND_TYPE.PLAY:
                this.renderer.invokeElementMethod(video, 'play');
                break;
            case VIDEO_COMMAND_TYPE.PAUSE:
                this.renderer.invokeElementMethod(video, 'pause');
                break;
            case VIDEO_COMMAND_TYPE.MUTE:
                this.isMuted = true;
                this.renderer.setElementProperty(video, 'muted', true);
                break;
            case VIDEO_COMMAND_TYPE.UNMUTE:
                this.isMuted = false;
                if (!this.isPlayedOnExternalWindow) {
                    this.renderer.setElementProperty(video, 'muted', false);
                }
                break;
            case VIDEO_COMMAND_TYPE.RESTART:
                this.renderer.invokeElementMethod(video, 'load');
                break;
        }

        this.windowManagementService.sendMessageToWindows(this.file, 'send-video-type', { type: command });
    }

    public playOrPause(): void {
        const video = this.videoPlayerRef.nativeElement;
        const isPaused: boolean = (<HTMLVideoElement> video).paused;
        if (isPaused) {
            this.sendVideoControls(VIDEO_COMMAND_TYPE.PLAY);
        } else {
            this.sendVideoControls(VIDEO_COMMAND_TYPE.PAUSE);
        }
    }

    private videoLoaded(): void {
        const video = this.videoPlayerRef.nativeElement;

        this.renderer.listen(video, 'seeking', () => {
            // console.log('seeking', this.isSyncing);
            if (!this.isSyncing) {
                this.windowManagementService.sendMessageToWindows(this.file, 'send-video-type',
                    { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
            }
        });

        this.renderer.listen(video, 'seeked', () => {
            // console.log('seeked', this.isSyncing);
            if (!this.isSyncing) {
                this.windowManagementService.sendMessageToWindows(this.file, 'send-video-type',
                    {type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime});
            }
        });

        this.renderer.listen(video, 'timeupdate', () => {
            const value = (100 / video.duration) * video.currentTime;
            this.currentVideoTime = video.currentTime;
            this.currentVideoDuration = video.duration;
        });
    }

    public videoSeekChange(event): void {
        const video = this.videoPlayerRef.nativeElement;
        this.renderer.setElementProperty(video, 'currentTime', video.duration * (<any> this.seekBar.nativeElement.value / 100));
    }

    public volumeChange(): void {
        const volumeValue = this.volumeBar.nativeElement.value;
        this.renderer.setElementProperty(this.videoPlayerRef.nativeElement, 'volume', volumeValue);
        this.windowManagementService.sendMessageToWindows(this.file, 'send-video-type', { type: VIDEO_COMMAND_TYPE.VOLUME, value: volumeValue });
    }

    public get isPaused(): boolean {
        return this.videoPlayerRef.nativeElement.paused;
    }

    public get isPlayedOnExternalWindow(): boolean {
        return true;
        // return this.file.windowIDs.length > 0;
    }

}
