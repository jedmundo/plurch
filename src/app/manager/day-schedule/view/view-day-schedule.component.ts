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
import { MdSliderChange, MdDialog, MdDialogConfig, MdSnackBar } from '@angular/material';
import { AppSettingsService } from '../../../shared/services/app-settings.service';
import { ProgramComponent } from '../program/program.component';
import { USE_LOUDNESS } from '../../../app.component';
const { ipcRenderer } = electron;

@Component({
    selector: 'app-view-day-schedule',
    templateUrl: 'view-day-schedule.component.html',
    styleUrls: ['view-day-schedule.component.scss']
})
export class ViewDayScheduleComponent implements OnInit, OnDestroy {

    public files: PlayableItem[] = [];
    public FILE_TYPE = PLAYABLE_FILE_TYPE;
    public itemPlaying: PlayableItem;

    public WINDOW_COMMAND_TYPE = WINDOW_COMMAND_TYPE;
    public volumeBarValue: number = 0;

    public syncVideo = new EventEmitter<any>();
    public muteVideo = new EventEmitter<any>();
    public newFileAddedToWindow = new EventEmitter<void>();
    public pWindows: Observable<PlurchWindow[]>;
    public selectedDayName: string;

    public loudnessAvailable = USE_LOUDNESS;

    private displays: PlurchDisplay[];
    private itemsPlayingSubscription: Subscription;

    constructor(
        private itemsPlayingManagementService: ItemsPlayingManagementService,
        private windowManagementService: WindowManagementService,
        private displayManagementService: DisplayManagementService,
        private dayFilesManagementService: DayFilesManagementService,
        private appSettingsService: AppSettingsService,
        private activatedRoute: ActivatedRoute,
        public dialog: MdDialog,
        public snackBar: MdSnackBar
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = decodeURIComponent(params['dayName']);
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.files);

            this.pWindows = this.windowManagementService.availableWindows$;

            this.itemPlaying = this.files.length > 0 ? this.files[0] : null;

            this.itemsPlayingSubscription = this.itemsPlayingManagementService.itemsPlaying.subscribe((itemsPlaying) => {
                // console.log('NOVOS ITEMS PLAYING', itemsPlaying);
                this.files.forEach((file) => {
                    file.itemsPlaying = itemsPlaying.filter((itemPlaying) => itemPlaying.id === file.id);
                    if (file.itemsPlaying.length > 0) {
                        this.muteVideo.emit({ id: file.id, mute: true });
                        file.isSendingToWindow = false;
                    }

                    if (file.itemsPlaying.length === 0) {
                        file.isRemovingFromWindow = false;
                    }
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

    public addToWindow(file: PlayableItem): void {
        file.isSendingToWindow = true;
        // this.windowManagementService
        //     .getPlurchWindow(pWindow.id)
        //     .electronWindow.webContents.send('remove-item', { itemId: file.id });

        if (this.windowManagementService.windowList.length <= 0) {
            this.snackBar.open('No windows available. Please add a window first.', '', {
                duration: 1000
            });
        } else {
            this.windowManagementService.addToWindow(this.windowManagementService.windowList[0].id, file);
            this.newFileAddedToWindow.emit();
        }
    }

    public removeFromWindow(file: PlayableItem): void {
        file.isRemovingFromWindow = true;
        this.windowManagementService
            .getPlurchWindow(this.windowManagementService.windowList[0].id)
            .electronWindow.webContents.send('remove-item', { itemId: file.id });
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

    public syncWithWindow(file: PlayableItem): void {
        const firstWindow = this.windowManagementService.windowList[0];
        this.windowManagementService
            .getPlurchWindow(firstWindow.id)
            .electronWindow.webContents.send('retrieve-video-time', { itemId: file.id, windowId: firstWindow.id })
    }

    public selectItem(file: PlayableItem): void {
        this.files.map((file) => file.isPlaying = false);
        file.isPlaying = true;
        this.itemPlaying = file;
    }

    public volumeChanged(event: MdSliderChange): void {
        const volume = event.value;
        this.appSettingsService.overallVolume = volume;
    }

    public openDialog(): void {
        const config: MdDialogConfig = {
            data: { name: this.selectedDayName }
        };
        this.dialog.open(ProgramComponent, config);
        // dialogRef.afterClosed().subscribe(result => {
        //     // this.selectedOption = result;
        // });
    }

    public encodeURIComponent(url: string): string {
        return encodeURIComponent(url);
    }

}
