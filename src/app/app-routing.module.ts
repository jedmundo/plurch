import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FullScreenVideoComponent } from './full-screen/full-screen-video/full-screen-video.component';
import { EmptyWindowComponent } from './full-screen/empty-window/empty-window.component';
import { ManagerComponent } from './manager/manager.component';
import { GalleryComponent } from './manager/gallery/gallery.component';
import { SearchYoutubeComponent } from './manager/search-youtube/search-youtube.component';
import { MonitorDisplaysComponent } from './manager/monitor-displays/monitor-displays.component';
import { DayListComponent } from './manager/day-list/day-list.component';
import { DayScheduleComponent } from './manager/day-schedule/day-schedule.component';
import { ViewDayScheduleComponent } from './manager/day-schedule/view/view-day-schedule.component';
import { EditDayScheduleComponent } from './manager/day-schedule/edit/edit-day-schedule.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'manager',
    pathMatch: 'full'
  },
  {
    path: 'manager', component: ManagerComponent,
    children: [
      {
        path: '',
        redirectTo: 'day-list',
        pathMatch: 'full'
      },
      { path: 'gallery', component: GalleryComponent },
      { path: 'search', component: SearchYoutubeComponent },
      { path: 'displays', component: MonitorDisplaysComponent },
      { path: 'day-list', component: DayListComponent },
      {
        path: 'day-schedule/:dayName',
        component: DayScheduleComponent,
        children: [
          {
            path: '',
            redirectTo: 'view',
            pathMatch: 'full'
          },
          { path: 'view', component: ViewDayScheduleComponent },
          { path: 'edit', component: EditDayScheduleComponent }
        ]
      }
    ]
  },
  { path: 'fs/empty-window', component: EmptyWindowComponent },
  { path: 'fs/video/:path/:id/:windowId', component: FullScreenVideoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
