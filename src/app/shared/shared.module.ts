import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagementService } from './services/window-management.service';
import { DisplayManagementService } from './services/display-management.service';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [

    ],
    providers: [
        WindowManagementService,
        DisplayManagementService
    ],
    exports: [
        CommonModule,
    ]
})
export class SharedModule { }
