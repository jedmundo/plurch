import { Component, OnInit } from '@angular/core';
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { ActivatedRoute, Params } from '@angular/router';
import { USE_LOUDNESS } from '../../app.component';
import { MdSliderChange } from '@angular/material';

@Component({
    selector: 'app-day-schedule',
    templateUrl: 'day-schedule.component.html',
    styleUrls: ['day-schedule.component.scss']
})
export class DayScheduleComponent implements OnInit {

    public selectedDayName: string;
    public isEditMode: boolean = false;
    public volumeBarValue: number = 0;

    public loudnessAvailable = USE_LOUDNESS;

    constructor(
        private appSettingsService: AppSettingsService,
        private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this.activatedRoute.params.subscribe((params: Params) => {
            this.selectedDayName = decodeURIComponent(params['dayName']);
        });

        this.volumeBarValue = this.appSettingsService.overallVolume;
    }

    public toggleEdit(): void {
        this.isEditMode = !this.isEditMode;
    }

    public volumeChanged(event: MdSliderChange): void {
        const volume = event.value;
        this.appSettingsService.overallVolume = volume;
    }

    public get isItemAlreadyAddedToMenu(): boolean {
        return this.appSettingsService.isItemAlreadyAddedToMenu(this.selectedDayName);
    }

    public addToMenu(): void {
        this.appSettingsService.addMenuItem(this.selectedDayName)
    }

    public removeFromMenu(): void {
        this.appSettingsService.removeMenuItem(this.selectedDayName)
    }

}
