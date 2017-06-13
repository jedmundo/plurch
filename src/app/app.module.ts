import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FullScreenVideoComponent } from './full-screen/full-screen-video/full-screen-video.component';
import { ROUTER_MODULE } from './app.routes';
import { MonitorDisplaysComponent } from './manager/monitor-displays/monitor-displays.component';
import { DayScheduleComponent } from './manager/day-schedule/day-schedule.component';
import { SharedModule } from './shared/shared.module';
import { VideoItemComponent } from './manager/day-schedule/video-item/video-item.component';
import { EmptyWindowComponent } from './full-screen/empty-window/empty-window.component';
import {
    MdButtonModule, MdCardModule, MdDialogModule, MdInputModule,
    MdProgressBarModule, MdSliderModule,
    MdSnackBarModule, MdTabsModule
} from '@angular/material';
import { ManagerComponent } from './manager/manager.component';
import { DayListComponent } from './manager/day-list/day-list.component';
import { GalleryComponent } from './manager/gallery/gallery.component';
import { EditDayScheduleComponent } from './manager/day-schedule/edit/edit-day-schedule.component';
import { ViewDayScheduleComponent } from './manager/day-schedule/view/view-day-schedule.component';
import { SearchYoutubeComponent } from './manager/search-youtube/search-youtube.component';
import { TimeFormatPipe } from './shared/pipes/time-format.pipe';
import { ProgramComponent } from './manager/day-schedule/program/program.component';
import { DragulaModule } from 'ng2-dragula';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchedItemsPipe } from './manager/day-schedule/edit/filter-video-title.pipe';
import { SearchYoutubeInputComponent } from './manager/search-youtube/search-input/search-input.component';
import { CreateTagComponent } from './manager/gallery/create-tag/create-tag.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        ROUTER_MODULE,
        SharedModule,
        MdDialogModule,
        MdProgressBarModule,
        MdSliderModule,
        MdButtonModule,
        MdCardModule,
        MdSnackBarModule,
        MdInputModule,
        MdTabsModule,
        BrowserAnimationsModule,
        DragulaModule
    ],
    declarations: [
        AppComponent,
        FullScreenVideoComponent,
        MonitorDisplaysComponent,
        DayScheduleComponent,
        VideoItemComponent,
        EmptyWindowComponent,
        ManagerComponent,
        DayListComponent,
        GalleryComponent,
        ViewDayScheduleComponent,
        EditDayScheduleComponent,
        SearchYoutubeComponent,
        TimeFormatPipe,
        SearchedItemsPipe,
        ProgramComponent,
        CreateTagComponent,
        SearchYoutubeInputComponent
    ],
    providers: [],
    entryComponents: [
        ProgramComponent,
        CreateTagComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
