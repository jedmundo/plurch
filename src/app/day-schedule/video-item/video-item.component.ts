import { Component, OnInit, Input, ViewChild, AfterViewInit, ElementRef, Renderer } from '@angular/core';
import { PlayableItem } from '../day-schedule.component';
import { WindowManagementService } from '../../shared/services/window-management.service';

export interface VideoCommand {
    type: VIDEO_COMMAND_TYPE;
    value?: number
}

export enum VIDEO_COMMAND_TYPE {
    PLAY,
    PAUSE,
    RESTART,
    SYNC_TIME,
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

    public currentVideoTime;
    public currentVideoDuration;

    public VIDEO_COMMAND_TYPE = VIDEO_COMMAND_TYPE;

    @Input() public file: PlayableItem;

    constructor(
        private renderer: Renderer,
        private windowManagementService: WindowManagementService) {
    }

    public ngOnInit() {

    }

    public ngAfterViewInit(): void {
        this.videoLoaded();
    }

    public sendVideoControls(command: VIDEO_COMMAND_TYPE): void {
        const video = this.videoPlayerRef.nativeElement;
        switch (command) {
            case VIDEO_COMMAND_TYPE.PLAY:
                return this.renderer.invokeElementMethod(video, 'play');
            case VIDEO_COMMAND_TYPE.PAUSE:
                return this.renderer.invokeElementMethod(video, 'pause');
            case VIDEO_COMMAND_TYPE.MUTE:
                return this.renderer.setElementProperty(video, 'mute', true);
            case VIDEO_COMMAND_TYPE.UNMUTE:
                return this.renderer.setElementProperty(video, 'mute', false);
            case VIDEO_COMMAND_TYPE.RESTART:
                return this.renderer.invokeElementMethod(video, 'load');
        }

        this.windowManagementService.sendMessageToWindow(123, 'send-video-type', { type: command });
    }

    private videoLoaded(): void {
        console.log('LISTENERS ADDED TO VIDEO');
        const video = this.videoPlayerRef.nativeElement;
        this.renderer.listen(video, 'seeking', () => {
            this.windowManagementService.sendMessageToWindow(123, 'send-video-type',
                { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
        });

        this.renderer.listen(video, 'seeked', () => {
            this.windowManagementService.sendMessageToWindow(123, 'send-video-type',
                { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: video.currentTime });
        });

        this.renderer.listen(video, 'timeupdate', () => {
            const value = (100 / video.duration) * video.currentTime;
            this.currentVideoTime = video.currentTime;
            this.currentVideoDuration = video.duration;
            this.seekBar.nativeElement.value = <any> value;
        });
    }

    public videoSeekChange(): void {
        const video = this.videoPlayerRef.nativeElement;
        this.renderer.setElementProperty(video, 'currentTime', video.duration * (<any> this.seekBar.nativeElement.value / 100));
    }

    public volumeChange(): void {
        this.renderer.setElementProperty(this.videoPlayerRef.nativeElement, 'volume', this.volumeBar.nativeElement.value);
    }

    public get isPaused(): boolean {
        return this.videoPlayerRef.nativeElement.paused;
    }

    public get isMuted(): boolean {
        return this.videoPlayerRef.nativeElement.muted;
    }

}
