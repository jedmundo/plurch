import { Component, OnInit } from '@angular/core';
import { MdSliderChange } from '@angular/material';
import { AppSettingsService } from '../../shared/services/app-settings.service';

@Component({
    selector: 'app-window-playlist',
    templateUrl: 'window-playlist.component.html',
    styleUrls: ['window-playlist.component.scss']
})
export class WindowPlaylistComponent implements OnInit {

    public selectedDayName: string;
    public volumeBarValue: number = 0;

    constructor(
        private appSettingsService: AppSettingsService
    ) { }

    public ngOnInit() {
        this.volumeBarValue = this.appSettingsService.overallVolume;
    }

    public volumeChanged(event: MdSliderChange): void {
        this.appSettingsService.overallVolume = event.value;
    }

}
