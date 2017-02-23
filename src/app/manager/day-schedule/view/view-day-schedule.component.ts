import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
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
import { guid } from '../../../util/util-functions';
import { ItemsPlayingManagementService } from '../../../shared/services/items-playing-management.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-view-day-schedule',
    templateUrl: 'view-day-schedule.component.html',
    styleUrls: ['view-day-schedule.component.scss']
})
export class ViewDayScheduleComponent implements OnInit, OnDestroy {

    public files: PlayableItem[] = [];
    public FILE_TYPE = PLAYABLE_FILE_TYPE;
    public WINDOW_COMMAND_TYPE = WINDOW_COMMAND_TYPE;

    private selectedDayName: string;
    private displays: PlurchDisplay[];
    private pWindowIds: string[] = [];
    private newFileAddedToWindow = new EventEmitter<void>();
    private itemsPlayingSubscription: Subscription;

    constructor(
        private itemsPlayingManagementService: ItemsPlayingManagementService,
        private windowManagementService: WindowManagementService,
        private displayManagementService: DisplayManagementService,
        private dayFilesManagementService: DayFilesManagementService,
        private activatedRoute: ActivatedRoute
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = params['dayName'];
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.files);

            this.pWindowIds = this.windowManagementService.getAvailableWindows().map((pWindow) => pWindow.id);

            this.itemsPlayingSubscription = this.itemsPlayingManagementService.itemsPlaying.subscribe((itemsPlaying) => {
                // console.log('NOVOS ITEMS PLAYING', itemsPlaying);
                this.files.forEach((file) => {
                    file.itemsPlaying = itemsPlaying.filter((itemPlaying) => itemPlaying.id === file.id);
                });
            });
        });
        this.displayManagementService.display$.subscribe((displays) => this.displays = displays);
    }

    public ngOnDestroy(): void {
        this.itemsPlayingSubscription.unsubscribe();
    }

    public openNewScreen(): void {
        let externalDisplay = this.displays.find((display) => display.external);
        if (!externalDisplay) {
            externalDisplay = this.displays[0];
        }

        const windowID = guid();
        this.pWindowIds.push(windowID);
        this.windowManagementService.openWindow(windowID, '#/fs/empty-window', externalDisplay.electronDisplay, 'Plurch Video Preview');

        if (!externalDisplay) {
            return;
        }
    }

    public sendCommandToWindow(id: string, command: WINDOW_COMMAND_TYPE) {
        if (command === WINDOW_COMMAND_TYPE.CLOSE) {
            this.pWindowIds.splice(this.pWindowIds.indexOf(id), 1);
        }
        this.windowManagementService.sendCommandToWindow(id, command);
    }

    public addToWindow(file: PlayableItem, windowId: string): void {
        this.windowManagementService.addToWindow(windowId, file);
        this.newFileAddedToWindow.emit();
    }

    public closeAllWindows(): void {
        // TODO: Improve
        // for (let i = 0; i < this.pWindowIds.length; i++) {
        //     this.windowManagementService.closeWindow(this.pWindowIds[i]);
        // }
        // for (let j = 0; j < this.files.length; j++) {
        //     this.files[j].windowIDs = [];
        // }
        this.pWindowIds = [];
    }

    public openFile(path: string) {
        this.dayFilesManagementService.openFile(path);
    }

    public fileIsPlayingOnWindow(file: PlayableItem, windowId: string): boolean {
        return !!file.itemsPlaying.find((itemPlaying) => itemPlaying.windowId === windowId);
    }

}
