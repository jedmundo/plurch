import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { PlayableItem, VIDEO_COMMAND_TYPE } from '../day-schedule.component';
import { WindowManagementService } from '../../shared/services/window-management.service';

@Component({
    selector: 'plurch-video-item',
    templateUrl: 'video-item.component.html',
    styleUrls: ['video-item.component.scss']
})
export class VideoItemComponent implements OnInit {

    @ViewChild('videoPlayer') videoplayer: any;

    public isVideoPaused: boolean = true;
    public VIDEO_COMMAND_TYPE = VIDEO_COMMAND_TYPE;

    @Input() public file: PlayableItem;

    constructor(private windowManagementService: WindowManagementService) { }

    public ngOnInit() {
        this.videoLoaded();
    }

    public sendVideoControls(command: VIDEO_COMMAND_TYPE): void {
        this.isVideoPaused = !this.isVideoPaused;

        switch (command) {
            case VIDEO_COMMAND_TYPE.PLAY:
                this.videoplayer.nativeElement.play();
                break;
            case VIDEO_COMMAND_TYPE.PAUSE:
                this.videoplayer.nativeElement.pause();
                break;
            case VIDEO_COMMAND_TYPE.RESTART:
                this.isVideoPaused = true;
                this.videoplayer.nativeElement.load();
                break;
        }

        this.windowManagementService.sendMessageToWindow(123, 'send-video-type', { type: command });
    }

    private videoLoaded(): void {
        console.log('LISTENERS ADDED');
        this.videoplayer.nativeElement.addEventListener("seeking", () => {
            this.windowManagementService.sendMessageToWindow(123, 'send-video-type',
                { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: this.videoplayer.nativeElement.currentTime });
        });

        this.videoplayer.nativeElement.addEventListener("seeked", () => {
            this.windowManagementService.sendMessageToWindow(123, 'send-video-type',
                { type: VIDEO_COMMAND_TYPE.SYNC_TIME, value: this.videoplayer.nativeElement.currentTime });
        });

        this.videoplayer.nativeElement.addEventListener("timeupdate", () => {
            // Calculate the slider value
            const value = (100 / this.videoplayer.nativeElement.duration) * this.videoplayer.nativeElement.currentTime;
            const seekBar: HTMLInputElement = <HTMLInputElement> document.getElementById("seek-bar");
            // Update the slider value
            seekBar.value = <any> value;
        });

        // this.videoplayer.nativeElement.addEventListener('loadedmetadata', function() {
        //     console.log(this.videoplayer.nativeElement.duration);
        // });
    }

    public muteVideo(): void {
        this.videoplayer.nativeElement.muted = !this.videoplayer.nativeElement.muted;
    }

    public videoSeekChange(): void {
        const seekBar: HTMLInputElement = <HTMLInputElement> document.getElementById("seek-bar");
        const time = this.videoplayer.nativeElement.duration * (<any> seekBar.value / 100);
        // Update the video time
        this.videoplayer.nativeElement.currentTime = time;
    }

    public volumeChange(): void {
        const volumeBar: HTMLInputElement = <HTMLInputElement> document.getElementById('volume-bar');
        this.videoplayer.nativeElement.volume = <any> volumeBar.value;
    }

}
