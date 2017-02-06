import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
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

    @ViewChild('videoPlayer') private videoplayer: any;
    @ViewChild('seekBar') private seekBar: any;
    @ViewChild('volumeBar') private volumeBar: any;
    public videoPlayerElement;
    public currentVideoTime;

    public isVideoPaused: boolean = true;
    public VIDEO_COMMAND_TYPE = VIDEO_COMMAND_TYPE;

    @Input() public file: PlayableItem;

    constructor(private windowManagementService: WindowManagementService) { }

    public ngOnInit() {

    }

    public ngAfterViewInit(): void {
        this.videoPlayerElement = this.videoplayer.nativeElement;
        this.videoLoaded();
    }

    public sendVideoControls(command: VIDEO_COMMAND_TYPE): void {
        this.isVideoPaused = !this.isVideoPaused;

        switch (command) {
            case VIDEO_COMMAND_TYPE.PLAY:
                this.videoPlayerElement.play();
                break;
            case VIDEO_COMMAND_TYPE.PAUSE:
                this.videoPlayerElement.pause();
                break;
            case VIDEO_COMMAND_TYPE.MUTE:
                this.videoPlayerElement.muted = true;
                break;
            case VIDEO_COMMAND_TYPE.UNMUTE:
                this.videoPlayerElement.muted = false;
                break;
            case VIDEO_COMMAND_TYPE.RESTART:
                this.isVideoPaused = true;
                this.videoPlayerElement.load();
                break;
        }

        this.windowManagementService.sendMessageToWindow(123, 'send-video-type', { type: command });
    }

    private videoLoaded(): void {
        console.log('LISTENERS ADDED');
        this.videoPlayerElement.addEventListener("seeking", () => {
            this.windowManagementService.sendMessageToWindow(123, 'send-video-type',
                { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: this.videoPlayerElement.currentTime });
        });

        this.videoPlayerElement.addEventListener("seeked", () => {
            this.windowManagementService.sendMessageToWindow(123, 'send-video-type',
                { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: this.videoPlayerElement.currentTime });
        });

        this.videoPlayerElement.addEventListener("timeupdate", () => {
            const value = (100 / this.videoPlayerElement.duration) * this.videoPlayerElement.currentTime;
            this.currentVideoTime = this.videoPlayerElement.currentTime;
            this.seekBar.nativeElement.value = <any> value;
        });
    }

    public videoSeekChange(): void {
        const time = this.videoPlayerElement.duration * (<any> this.seekBar.nativeElement.value / 100);
        this.videoPlayerElement.currentTime = time;
    }

    public volumeChange(): void {
        this.videoPlayerElement.volume = <any> this.volumeBar.nativeElement.value;
    }

}
