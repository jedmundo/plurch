import { Routes, RouterModule }  from '@angular/router';
import { FullScreenComponent } from './full-screen/full-screen.component';
import { AppComponent } from './app.component';

const routes: Routes = [
    { path: 'fs', component: FullScreenComponent }
];

export const ROUTER_MODULE = RouterModule.forRoot(routes, { useHash: true });
