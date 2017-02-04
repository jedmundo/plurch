import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FullScreenComponent } from './full-screen/full-screen.component';
import { ROUTER_MODULE } from './app.routes';
import { MonitorDisplaysComponent } from './monitor-displays/monitor-displays.component';
import { DayScheduleComponent } from './day-schedule/day-schedule.component';

@NgModule({
    declarations: [
        AppComponent,
        FullScreenComponent,
        MonitorDisplaysComponent,
        DayScheduleComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ROUTER_MODULE
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
