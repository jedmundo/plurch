import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { MdSliderChange, MdDialog, MdDialogConfig } from '@angular/material';
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { ActivatedRoute, Params } from '@angular/router';
import {
    DayFilesManagementService, PlayableItem,
    PLAYABLE_FILE_TYPE
} from '../../shared/services/day-files-management.service';
import { ItemsPlayingManagementService } from '../../shared/services/items-playing-management.service';
import { Subscription } from 'rxjs';
import { ProgramComponent } from '../day-schedule/program/program.component';
import { PlurchWindow, WindowManagementService } from '../../shared/services/window-management.service';

@Component({
    selector: 'app-window-playlist',
    templateUrl: 'window-playlist.component.html',
    styleUrls: ['window-playlist.component.scss']
})
export class WindowPlaylistComponent implements OnInit, OnDestroy {

    public selectedDayName: string;
    public windowId: string;
    public volumeBarValue: number = 0;
    public files: PlayableItem[] = [];
    public FILE_TYPE = PLAYABLE_FILE_TYPE;
    public newFileAddedToWindow = new EventEmitter<void>();
    public syncVideo = new EventEmitter<any>();

    private itemsPlayingSubscription: Subscription;

    constructor(
        private appSettingsService: AppSettingsService,
        private activatedRoute: ActivatedRoute,
        private dayFilesManagementService: DayFilesManagementService,
        private windowManagementService: WindowManagementService,
        private itemsPlayingManagementService: ItemsPlayingManagementService,
        public dialog: MdDialog
    ) { }

    public ngOnInit() {
        this.volumeBarValue = this.appSettingsService.overallVolume;

        this.activatedRoute.params.subscribe((params: Params) => {
            this.selectedDayName = params['dayName'];
            this.windowId = params['windowId'];
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.files);

            this.itemsPlayingSubscription = this.itemsPlayingManagementService.itemsPlaying.subscribe((itemsPlaying) => {
                // console.log('NOVOS ITEMS PLAYING', itemsPlaying);
                // this.isSendingItem = false;
                // this.isRemovingItem = false;
                this.files.forEach((file) => {
                    file.itemsPlaying = itemsPlaying.filter((itemPlaying) => itemPlaying.id === file.id);
                });
            });
        });
    }

    public ngOnDestroy(): void {
        this.itemsPlayingSubscription.unsubscribe();
    }

    public volumeChanged(event: MdSliderChange): void {
        this.appSettingsService.overallVolume = event.value;
    }

    public addToWindow(file: PlayableItem): void {
        // this.isSendingItem = true;
        // this.windowManagementService
        //     .getPlurchWindow(pWindow.id)
        //     .electronWindow.webContents.send('remove-item', { itemId: file.id });
        this.windowManagementService.addToWindow(this.windowId, file);
        this.newFileAddedToWindow.emit();
    }

    public removeFromWindow(file: PlayableItem, pWindow: PlurchWindow): void {
        // this.isRemovingItem = true;
        this.windowManagementService
            .getPlurchWindow(pWindow.id)
            .electronWindow.webContents.send('remove-item', { itemId: file.id });
    }

    public syncWithWindow(file: PlayableItem): void {
        this.windowManagementService
            .getPlurchWindow(this.windowId)
            .electronWindow.webContents.send('retrieve-video-time', { itemId: file.id, windowId: this.windowId })
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

    public fileIsPlayingOnWindow(file: PlayableItem): boolean {
        return !!file.itemsPlaying.find((itemPlaying) => itemPlaying.windowId === this.windowId);
    }

}
