import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule, MatProgressBarModule } from '@angular/material';

import { WindowManagementService } from './services/window-management.service';
import { DisplayManagementService } from './services/display-management.service';
import { YoutubeManagementService } from './services/youtube-management.service';
import { DayFilesManagementService } from './services/day-files-management.service';
import { ItemsPlayingManagementService } from './services/items-playing-management.service';
import { AppSettingsService } from './services/app-settings.service';
import { DownloadListComponent } from './components/download-list/download-list.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { FileTagManagementService } from './services/files-tag-management.service';
import { ElectronService } from './services/electron.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatProgressBarModule,
    MatButtonModule
  ],
  declarations: [
    DownloadListComponent,
    NavigationComponent
  ],
  providers: [
    WindowManagementService,
    DisplayManagementService,
    YoutubeManagementService,
    DayFilesManagementService,
    ItemsPlayingManagementService,
    AppSettingsService,
    FileTagManagementService,
    ElectronService
  ],
  exports: [
    CommonModule,
    DownloadListComponent,
    NavigationComponent
  ]
})
export class SharedModule { }
