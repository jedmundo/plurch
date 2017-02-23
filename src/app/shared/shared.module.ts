import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagementService } from './services/window-management.service';
import { DisplayManagementService } from './services/display-management.service';
import { YoutubeManagementService } from './services/youtube-management.service';
import { DayFilesManagementService } from './services/day-files-management.service';
import { ItemsPlayingManagementService } from './services/items-playing-management.service';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [

    ],
    providers: [
        WindowManagementService,
        DisplayManagementService,
        YoutubeManagementService,
        DayFilesManagementService,
        ItemsPlayingManagementService
    ],
    exports: [
        CommonModule,
    ]
})
export class SharedModule { }
