import { Routes, RouterModule }  from '@angular/router';
import { FullScreenVideoComponent } from './full-screen/full-screen-video.component';
import { DayScheduleComponent } from './day-schedule/day-schedule.component';
import { EmptyWindowComponent } from './empty-window/empty-window.component';
import { MonitorDisplaysComponent } from './monitor-displays/monitor-displays.component';

const routes: Routes = [
    { path: '', component: DayScheduleComponent },
    { path: 'displays', component: MonitorDisplaysComponent },
    { path: 'empty-window', component: EmptyWindowComponent },
    { path: 'fs-video/:id', component: FullScreenVideoComponent }
];

export const ROUTER_MODULE = RouterModule.forRoot(routes, { useHash: true });
