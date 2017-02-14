import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagementService } from './services/window-management.service';
import { DisplayManagementService } from './services/display-management.service';
import { YoutubeManagementService } from './services/youtube-management.service';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [

    ],
    providers: [
        WindowManagementService,
        DisplayManagementService,
        YoutubeManagementService
    ],
    exports: [
        CommonModule,
    ]
})
export class SharedModule { }
