import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatSliderChange } from '@angular/material';

import { AppSettingsService } from '../../shared/services/app-settings.service';
import { USE_LOUDNESS } from '../../app.component';

@Component({
  selector: 'pl-day-schedule',
  templateUrl: 'day-schedule.component.html',
  styleUrls: ['day-schedule.component.scss']
})
export class DayScheduleComponent implements OnInit {

  public selectedDayName: string;
  public isEditMode = false;
  public volumeBarValue = 0;

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

  public volumeChanged(event: MatSliderChange): void {
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
