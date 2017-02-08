import { Routes, RouterModule }  from '@angular/router';
import { FullScreenVideoComponent } from './full-screen/full-screen-video/full-screen-video.component';
import { DayScheduleComponent } from './manager/day-schedule/day-schedule.component';
import { EmptyWindowComponent } from './full-screen/empty-window/empty-window.component';
import { MonitorDisplaysComponent } from './manager/monitor-displays/monitor-displays.component';
import { ManagerComponent } from './manager/manager.component';
import { DayListComponent } from './manager/day-list/day-list.component';

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
            { path: 'displays', component: MonitorDisplaysComponent},
            { path: 'day-list', component: DayListComponent},
            { path: 'day-schedule/:dayName', component: DayScheduleComponent}
        ]
    },
    { path: 'fs/empty-window', component: EmptyWindowComponent },
    { path: 'fs/video/:id', component: FullScreenVideoComponent }
];

export const ROUTER_MODULE = RouterModule.forRoot(routes, { useHash: true });
