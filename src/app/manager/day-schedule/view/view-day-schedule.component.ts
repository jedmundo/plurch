import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import Display = Electron.Display;
import Event = Electron.Event;
import BrowserWindow = Electron.BrowserWindow;
import {
    WindowManagementService, WINDOW_COMMAND_TYPE,
    PlurchWindow
} from '../../../shared/services/window-management.service';
import { PlurchDisplay, DisplayManagementService } from '../../../shared/services/display-management.service';
import { ActivatedRoute, Params } from '@angular/router';
import {
    PlayableItem, DayFilesManagementService,
    PLAYABLE_FILE_TYPE
} from '../../../shared/services/day-files-management.service';
import { ItemsPlayingManagementService } from '../../../shared/services/items-playing-management.service';
import { Subscription, Observable } from 'rxjs';
import { MdSliderChange } from '@angular/material';
import { AppSettingsService } from '../../../shared/services/app-settings.service';
const { ipcRenderer } = electron;

@Component({
    selector: 'app-view-day-schedule',
    templateUrl: 'view-day-schedule.component.html',
    styleUrls: ['view-day-schedule.component.scss']
})
export class ViewDayScheduleComponent implements OnInit, OnDestroy {

    public files: PlayableItem[] = [];
    public FILE_TYPE = PLAYABLE_FILE_TYPE;
    public WINDOW_COMMAND_TYPE = WINDOW_COMMAND_TYPE;
    public isSendingItem: boolean = false;
    public volumeBarValue: number = 0;

    private selectedDayName: string;
    private displays: PlurchDisplay[];
    private pWindows: Observable<PlurchWindow[]>;
    private newFileAddedToWindow = new EventEmitter<void>();
    private syncVideo = new EventEmitter<any>();

    private itemsPlayingSubscription: Subscription;

    constructor(
        private itemsPlayingManagementService: ItemsPlayingManagementService,
        private windowManagementService: WindowManagementService,
        private displayManagementService: DisplayManagementService,
        private dayFilesManagementService: DayFilesManagementService,
        private appSettingsService: AppSettingsService,
        private activatedRoute: ActivatedRoute
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = params['dayName'];
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.files);

            this.pWindows = this.windowManagementService.availableWindows;

            this.itemsPlayingSubscription = this.itemsPlayingManagementService.itemsPlaying.subscribe((itemsPlaying) => {
                // console.log('NOVOS ITEMS PLAYING', itemsPlaying);
                this.isSendingItem = false;
                this.files.forEach((file) => {
                    file.itemsPlaying = itemsPlaying.filter((itemPlaying) => itemPlaying.id === file.id);
                });
            });
        });
        this.displayManagementService.display$.subscribe((displays) => this.displays = displays);

        ipcRenderer.on('respond-video-time', (event, response) => {
            this.syncVideo.emit(response);
        });

        this.volumeBarValue = this.appSettingsService.overallVolume;
    }

    public ngOnDestroy(): void {
        this.itemsPlayingSubscription.unsubscribe();
    }

    public openNewScreen(): void {
        let externalDisplay = this.displays.find((display) => display.external);
        if (!externalDisplay) {
            externalDisplay = this.displays[0];
        }

        this.windowManagementService.openWindow('#/fs/empty-window', externalDisplay.electronDisplay, 'Plurch Video Preview');

        if (!externalDisplay) {
            return;
        }
    }

    public sendCommandToWindow(pWindow: PlurchWindow, command: WINDOW_COMMAND_TYPE) {
        this.windowManagementService.sendCommandToWindow(pWindow.id, command);
    }

    public addToWindow(file: PlayableItem, pWindow: PlurchWindow): void {
        this.isSendingItem = true;
        this.windowManagementService.addToWindow(pWindow.id, file);
        this.newFileAddedToWindow.emit();
    }

    public removeFromWindow(file: PlayableItem, pWindow: PlurchWindow): void {
        this.windowManagementService
            .getPlurchWindow(pWindow.id)
            .electronWindow.webContents.send('remove-item', { itemId: file.id, windowId: pWindow.id })
    }

    public closeAllWindows(): void {
        this.windowManagementService.closeAllWindows();
    }

    public openFile(path: string) {
        this.dayFilesManagementService.openFile(path);
    }

    public fileIsPlayingOnWindow(file: PlayableItem, pWindow: PlurchWindow): boolean {
        return !!file.itemsPlaying.find((itemPlaying) => itemPlaying.windowId === pWindow.id);
    }

    public syncWithWindow(file: PlayableItem, pWindow: PlurchWindow): void {
        this.windowManagementService
            .getPlurchWindow(pWindow.id)
            .electronWindow.webContents.send('retrieve-video-time', { itemId: file.id, windowId: pWindow.id })
    }

    public volumeChanged(event: MdSliderChange): void {
        const volume = event.value;
        this.appSettingsService.overallVolume = volume;
    }

}
