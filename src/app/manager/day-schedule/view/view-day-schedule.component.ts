import { Component, OnInit, EventEmitter } from '@angular/core';
import Display = Electron.Display;
import Event = Electron.Event;
import BrowserWindow = Electron.BrowserWindow;
import { WindowManagementService, WINDOW_COMMAND_TYPE } from '../../../shared/services/window-management.service';
import { PlurchDisplay, DisplayManagementService } from '../../../shared/services/display-management.service';
import { ActivatedRoute, Params } from '@angular/router';
import {
    PlayableItem, DayFilesManagementService,
    PLAYABLE_FILE_TYPE
} from '../../../shared/services/day-files-management.service';
import {SafeUrl, DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-view-day-schedule',
    templateUrl: 'view-day-schedule.component.html',
    styleUrls: ['view-day-schedule.component.scss']
})
export class ViewDayScheduleComponent implements OnInit {

    public files: PlayableItem[] = [];
    public FILE_TYPE = PLAYABLE_FILE_TYPE;
    public WINDOW_COMMAND_TYPE = WINDOW_COMMAND_TYPE;

    private selectedDayName: string;
    private displays: PlurchDisplay[];
    private pWindowIds: string[] = [];
    private newFileAddedToWindow = new EventEmitter<void>();

    constructor(
        private windowManagementService: WindowManagementService,
        private displayManagementService: DisplayManagementService,
        private dayFilesManagementService: DayFilesManagementService,
        private activatedRoute: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = params['dayName'];
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.files);
        });
        this.displayManagementService.display$.subscribe((displays) => this.displays = displays);
    }

    public openNewScreen(): void {
        let externalDisplay = this.displays.find((display) => display.external);
        if (!externalDisplay) {
            externalDisplay = this.displays[0];
        }

        const windowID = this.guid();
        this.pWindowIds.push(windowID);
        this.windowManagementService.openWindow(windowID, '#/fs/empty-window', externalDisplay.electronDisplay, 'Plurch Video Preview');

        if (!externalDisplay) {
            return;
        }
    }

    public sendCommandToWindow(id: string, command: WINDOW_COMMAND_TYPE) {
        // TODO: Improve this
        if (command === WINDOW_COMMAND_TYPE.CLOSE) {
            this.pWindowIds.splice(this.pWindowIds.indexOf(id), 1);
            for (let j = 0; j < this.files.length; j++) {
                if (this.files[j].windowIDs.indexOf(id) > -1)
                    this.files[j].windowIDs.splice(this.files[j].windowIDs.indexOf(id), 1);
            }
        }
        this.windowManagementService.sendCommandToWindow(id, command);
    }

    public addToWindow(file: PlayableItem, windowId: string): void {
        this.files.forEach((file) => {
            if (file.windowIDs.find((windowIdArg) => windowIdArg === windowId)) {
                file.windowIDs.splice(file.windowIDs.findIndex((windowIdArg) => windowIdArg === windowId), 1)
            }
        });
        file.windowIDs.push(windowId);
        if (file.type === PLAYABLE_FILE_TYPE.VIDEO) {
            const url = '#/fs/video/' + file.path.replace(/\//g, '___');
            this.windowManagementService.addToWindow(windowId, url);
        }
        this.newFileAddedToWindow.emit();
    }

    public closeAllWindows(): void {
        // TODO: Improve
        for (let i = 0; i < this.pWindowIds.length; i++) {
            this.windowManagementService.closeWindow(this.pWindowIds[i]);
        }
        for (let j = 0; j < this.files.length; j++) {
            this.files[j].windowIDs = [];
        }
        this.pWindowIds = [];
    }

    public openFile(path: string) {
        this.dayFilesManagementService.openFile(path);
    }

    private guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

}
