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

    public volumeBarValue: number = 0;

    public syncVideo = new EventEmitter<any>();
    public muteVideo = new EventEmitter<any>();
    public newFileAddedToWindow = new EventEmitter<void>();

    public selectedDayName: string;
    public isEditMode: boolean = false;
    public isAddedToMenu: boolean = false;

    public loudnessAvailable = USE_LOUDNESS;

    private firstWindowId: string;
    private firstWindowSubscription: Subscription;
    private itemsPlayingSubscription: Subscription;

    constructor(
        private itemsPlayingManagementService: ItemsPlayingManagementService,
        private windowManagementService: WindowManagementService,
        private dayFilesManagementService: DayFilesManagementService,
        private appSettingsService: AppSettingsService,
        private activatedRoute: ActivatedRoute,
        public dialog: MdDialog,
        public snackBar: MdSnackBar) {
    }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = decodeURIComponent(params['dayName']);
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.files);

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

            this.firstWindowSubscription = this.windowManagementService.availableWindows$
                .subscribe(windows => {
                    if (windows.length > 0) {
                        this.firstWindowId = windows[0].id;
                    } else {
                        this.firstWindowId = null;
                    }
                });
        });

        ipcRenderer.on('respond-video-time', (event, response) => {
            this.syncVideo.emit(response);
        });

        this.volumeBarValue = this.appSettingsService.overallVolume;
    }

    public ngOnDestroy(): void {
        this.itemsPlayingSubscription.unsubscribe();
        this.firstWindowSubscription.unsubscribe();
    }

    public addToWindow(file: PlayableItem): void {
        if (!this.firstWindowId) {
            this.snackBar.open('No windows available. Please add a window first in the "Displays" menu.', 'Ok', {
                duration: 4000
            });
        } else {
            file.isSendingToWindow = true;
            this.windowManagementService.addToWindow(this.firstWindowId, file);
            this.newFileAddedToWindow.emit();
        }
    }

    public removeFromWindow(file: PlayableItem): void {
        file.isRemovingFromWindow = true;
        this.windowManagementService
            .getPlurchWindow(this.firstWindowId)
            .electronWindow.webContents.send('remove-item', { itemId: file.id });
    }

    public openFile(path: string) {
        this.dayFilesManagementService.openFile(path);
    }

    public fileIsPlayingOnWindow(file: PlayableItem): boolean {
        return !!file.itemsPlaying.find((itemPlaying) => itemPlaying.windowId === this.firstWindowId);
    }

    public syncWithWindow(file: PlayableItem): void {
        this.windowManagementService
            .getPlurchWindow(this.firstWindowId)
            .electronWindow.webContents.send('retrieve-video-time', { itemId: file.id, windowId: this.firstWindowId })
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

    public addToMenu(): void {
        this.isAddedToMenu = true
    }

}
