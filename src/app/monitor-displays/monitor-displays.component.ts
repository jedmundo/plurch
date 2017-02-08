import { Component, OnInit, NgZone, Input, Output, EventEmitter } from '@angular/core';
import Display = Electron.Display;
import { DisplayManagementService, PlurchDisplay } from '../shared/services/display-management.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-monitor-displays',
    templateUrl: './monitor-displays.component.html',
    styleUrls: ['./monitor-displays.component.scss']
})
export class MonitorDisplaysComponent implements OnInit {

    public display$ : Observable<PlurchDisplay[]>;

    constructor(private displayManagementService: DisplayManagementService) { }

    public ngOnInit() {
        this.display$ = this.displayManagementService.display$;
    }

}


