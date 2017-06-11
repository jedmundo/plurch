import { Component, OnDestroy, OnInit } from '@angular/core';
import Display = Electron.Display;
import { DisplayManagementService, PlurchDisplay } from '../../shared/services/display-management.service';
import { Observable } from 'rxjs';
import {
    PlurchWindow, WINDOW_COMMAND_TYPE,
    WindowManagementService
} from '../../shared/services/window-management.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-monitor-displays',
    templateUrl: 'monitor-displays.component.html',
    styleUrls: ['monitor-displays.component.scss']
})
export class MonitorDisplaysComponent implements OnInit, OnDestroy {

    public displayList: PlurchDisplay[];
    public pWindows$: Observable<PlurchWindow[]>;
    public WINDOW_COMMAND_TYPE = WINDOW_COMMAND_TYPE;

    private displaysSubscription: Subscription;

    constructor(
        private displayManagementService: DisplayManagementService,
        private windowManagementService: WindowManagementService) {
    }

    public ngOnInit() {
        this.displaysSubscription = this.displayManagementService.display$
            .subscribe((displays) => this.displayList = displays);

        this.pWindows$ = this.windowManagementService.availableWindows$;
    }

    public ngOnDestroy(): void {
        this.displaysSubscription.unsubscribe();
    }

    public sendCommandToWindow(pWindow: PlurchWindow, command: WINDOW_COMMAND_TYPE) {
        this.windowManagementService.sendCommandToWindow(pWindow.id, command);
    }

    public openNewScreen(): void {
        let externalDisplay = this.displayList.find((display) => display.external);
        if (!externalDisplay) {
            externalDisplay = this.displayList[0];
        }

        this.windowManagementService.openWindow('#/fs/empty-window', externalDisplay.electronDisplay, 'Plurch Video Preview');

        if (!externalDisplay) {
            return;
        }
    }

    public closeAllWindows(): void {
        this.windowManagementService.closeAllWindows();
    }

}


