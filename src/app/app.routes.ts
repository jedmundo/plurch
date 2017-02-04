import { Routes, RouterModule }  from '@angular/router';
import { FullScreenComponent } from './full-screen/full-screen.component';
import { DayScheduleComponent } from './day-schedule/day-schedule.component';

const routes: Routes = [
    { path: '', component: DayScheduleComponent },
    { path: 'fs/:id', component: FullScreenComponent }
];

export const ROUTER_MODULE = RouterModule.forRoot(routes, { useHash: true });
