import { Routes, RouterModule }  from '@angular/router';
import { FullScreenVideoComponent } from './full-screen/full-screen-video.component';
import { DayScheduleComponent } from './day-schedule/day-schedule.component';

const routes: Routes = [
    { path: '', component: DayScheduleComponent },
    { path: 'fs-video/:id', component: FullScreenVideoComponent }
];

export const ROUTER_MODULE = RouterModule.forRoot(routes, { useHash: true });
