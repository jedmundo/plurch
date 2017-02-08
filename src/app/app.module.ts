import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FullScreenVideoComponent } from './full-screen/full-screen-video/full-screen-video.component';
import { ROUTER_MODULE } from './app.routes';
import { MonitorDisplaysComponent } from './manager/monitor-displays/monitor-displays.component';
import { DayScheduleComponent } from './manager/day-schedule/day-schedule.component';
import { SharedModule } from './shared/shared.module';
import { VideoItemComponent } from './manager/day-schedule/video-item/video-item.component';
import { EmptyWindowComponent } from './full-screen/empty-window/empty-window.component';
import { MaterialModule } from '@angular/material';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { ManagerComponent } from './manager/manager.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ROUTER_MODULE,
        SharedModule,
        MaterialModule.forRoot()
    ],
    declarations: [
        AppComponent,
        FullScreenVideoComponent,
        MonitorDisplaysComponent,
        DayScheduleComponent,
        VideoItemComponent,
        EmptyWindowComponent,
        NavigationComponent,
        ManagerComponent
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
