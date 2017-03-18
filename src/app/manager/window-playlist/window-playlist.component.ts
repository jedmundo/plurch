import {
    Component, OnInit, OnDestroy, EventEmitter, ViewChildren, QueryList, ViewChild,
    ElementRef, AfterViewInit
} from '@angular/core';
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
import { WindowManagementService, PlurchWindow } from '../../shared/services/window-management.service';
const { ipcRenderer } = electron;

@Component({
    selector: 'app-window-playlist',
    templateUrl: 'window-playlist.component.html',
    styleUrls: ['window-playlist.component.scss']
})
export class WindowPlaylistComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('historyList') historyList: ElementRef;

    public selectedDayName: string;
    public windowId: string;
    public volumeBarValue: number = 0;
    public files: PlayableItem[] = [];
    public FILE_TYPE = PLAYABLE_FILE_TYPE;
    public itemPlaying: PlayableItem;

    public newFileAddedToWindow = new EventEmitter<void>();
    public syncVideo = new EventEmitter<any>();
    public muteVideo = new EventEmitter<any>();

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
            this.selectedDayName = decodeURIComponent(params['dayName']);
            this.windowId = params['windowId'];
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
        });

        ipcRenderer.on('respond-video-time', (event, response) => {
            this.syncVideo.emit(response);
        });
    }

    public ngAfterViewInit(): void {
        // On init scroll and sync already playing item
        this.files.forEach((file) => {
            if (this.fileIsPlayingOnWindow(file)) {
                // console.log(this.historyList.nativeElement.get);
                this.itemPlaying = file;
                document.getElementById('historyItem-' + file.id).scrollIntoView();
                this.syncWithWindow(file);
            }
        });
    }

    public ngOnDestroy(): void {
        this.itemsPlayingSubscription.unsubscribe();
    }

    public volumeChanged(event: MdSliderChange): void {
        this.appSettingsService.overallVolume = event.value;
    }

    public addToWindow(file: PlayableItem): void {
        file.isSendingToWindow = true;
        // this.files.forEach((file) => {
        //     file.itemsPlaying = [];
        // });
        this.windowManagementService.addToWindow(this.windowId, file);
        this.newFileAddedToWindow.emit();
    }

    public removeFromWindow(file: PlayableItem): void {
        file.isRemovingFromWindow = true;
        this.windowManagementService
            .getPlurchWindow(this.windowId)
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

    public selectItem(file: PlayableItem): void {
        this.files.map((file) => file.isPlaying = false);
        file.isPlaying = true;
        this.itemPlaying = file;
    }

    public openFile(path: string) {
        this.dayFilesManagementService.openFile(path);
    }

}
