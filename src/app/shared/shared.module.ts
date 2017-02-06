import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagementService } from './services/window-management.service';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [

    ],
    providers: [
        WindowManagementService
    ],
    exports: [
        CommonModule,
    ]
})
export class SharedModule { }
