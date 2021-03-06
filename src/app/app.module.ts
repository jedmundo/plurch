import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule, HttpClient } from '@angular/common/http';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './shared/services/electron.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import {
  MatButtonModule,
  MatDialogModule,
  MatProgressBarModule,
  MatSliderModule,
  MatCardModule,
  MatSnackBarModule,
  MatInputModule,
  MatTabsModule,
  MatFormFieldModule
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
import { SearchedItemsPipe } from './manager/day-schedule/edit/filter-video-title.pipe';
import { SearchYoutubeInputComponent } from './manager/search-youtube/search-input/search-input.component';
import { CreateTagComponent } from './manager/gallery/create-tag/create-tag.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FullScreenVideoComponent } from './full-screen/full-screen-video/full-screen-video.component';
import { MonitorDisplaysComponent } from './manager/monitor-displays/monitor-displays.component';
import { DayScheduleComponent } from './manager/day-schedule/day-schedule.component';
import { SharedModule } from './shared/shared.module';
import { VideoItemComponent } from './manager/day-schedule/video-item/video-item.component';
import { EmptyWindowComponent } from './full-screen/empty-window/empty-window.component';
import { AppRoutingModule } from './app-routing.module';
import { DownloadFromYoutubeUrlComponent } from './manager/day-schedule/edit/download-from-url/download-from-url.component'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    SharedModule,
    MatDialogModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSliderModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatInputModule,
    MatTabsModule,
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
    DownloadFromYoutubeUrlComponent,
    SearchYoutubeComponent,
    TimeFormatPipe,
    SearchedItemsPipe,
    ProgramComponent,
    CreateTagComponent,
    SearchYoutubeInputComponent
  ],
  entryComponents: [
    ProgramComponent,
    CreateTagComponent
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
