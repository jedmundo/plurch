import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
    YoutubeManagementService, YouTubeVideo
} from '../../../shared/services/youtube-management.service';
import {
    PlayableItem, DayFilesManagementService,
    PLAYABLE_FILE_TYPE
} from '../../../shared/services/day-files-management.service';
import { guid } from '../../../util/util-functions';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
const { remote, ipcRenderer } = electron;

const videoAllowedExtensions: string[] = ['mp4', 'm4v', 'mkv'];
const allAllowedExtensions: string[] = videoAllowedExtensions.concat(['.png', 'jpg', 'jpeg','pptx', '']);

@Component({
    selector: 'app-edit-day-schedule',
    templateUrl: 'edit-day-schedule.component.html',
    styleUrls: ['edit-day-schedule.component.scss']
})
export class EditDayScheduleComponent implements OnInit, OnDestroy {

    public selectedDayName: string;
    public availableVideos: YouTubeVideo[];
    public playableItems: PlayableItem[] = [];
    public PLAYABLE_FILE_TYPE = PLAYABLE_FILE_TYPE;

    private dragulaDropSubscription: Subscription;

    constructor(
        private zone: NgZone,
        private activatedRoute: ActivatedRoute,
        private youtubeManagementService: YoutubeManagementService,
        private dayFilesManagementService: DayFilesManagementService,
        private dragulaService: DragulaService
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = decodeURIComponent(params['dayName']);
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.playableItems);
        });

        this.availableVideos = this.youtubeManagementService.downloadedVideosList
            .filter((video) => !this.playableItems.find((item) => item.id === video.id));

        this.dragulaDropSubscription = this.dragulaService.drop.subscribe((value) => {
            // console.log(`drop: ${value[0]}`);
            // console.log(this.playableItems);
            this.dayFilesManagementService.storeReorderedItems(this.selectedDayName, this.playableItems);
        });
    }

    public ngOnDestroy(): void {
        this.dragulaService.destroy('items-bag');
        this.dragulaDropSubscription.unsubscribe();
    }

    public openChooseItemDialog() {
        remote.dialog.showOpenDialog({
            title:"Select files or a folder",
            properties: ["openDirectory","openFile","multiSelections"]
        }, (itemPaths) => {
            this.zone.run(() => {
                this.addVideosFromFolderOrFile(itemPaths);
            });
        });
    }

    public addVideoToDay(video: YouTubeVideo): void {
        this.dayFilesManagementService.addFile(
            this.selectedDayName,
            this.playableItems,
            video.id,
            this.youtubeManagementService.youtubeVideosFolder + '/' + video.id + '.mp4',
            PLAYABLE_FILE_TYPE.VIDEO,
            video.title,
            video.description,
            video.thumbnailUrl);
        this.availableVideos.splice(this.availableVideos.indexOf(video), 1);
    }

    public openFile(path: string) {
        this.dayFilesManagementService.openFile(path);
    }

    public deleteFile(file: PlayableItem) {
        this.dayFilesManagementService.deleteFile(this.selectedDayName, file.path, this.playableItems);
        this.availableVideos = this.youtubeManagementService.downloadedVideosList
            .filter((video) => !this.playableItems.find((item) => item.id === video.id));
    }

    private addVideosFromFolderOrFile(itemPaths: string[]): void {
        if (itemPaths) {
            itemPaths.forEach((itemPath) => {
                const isDirectory = fs.lstatSync(itemPath).isDirectory();
                if (isDirectory) {
                    fs.readdir(itemPath, (err, files) => {
                        this.zone.run(() => {
                            files.forEach(file => {
                                if (this.isAllowedVideo(file)) {
                                    this.dayFilesManagementService.addFile(this.selectedDayName,
                                        this.playableItems, guid(), itemPath + '/' + file, PLAYABLE_FILE_TYPE.VIDEO);
                                } else {
                                    this.dayFilesManagementService.addFile(this.selectedDayName,
                                        this.playableItems, guid(), itemPath, PLAYABLE_FILE_TYPE.DEFAULT);
                                }
                            });
                        });
                    })
                } else {
                    if (this.isAllowedVideo(itemPath)) {
                        this.dayFilesManagementService.addFile(this.selectedDayName,
                            this.playableItems, guid(), itemPath, PLAYABLE_FILE_TYPE.VIDEO);
                    } else {
                        this.dayFilesManagementService.addFile(this.selectedDayName,
                            this.playableItems, guid(), itemPath, PLAYABLE_FILE_TYPE.DEFAULT);
                    }
                }
            });
        }
    }

    private isAllowedVideo(itemPath: string): boolean {
        if (videoAllowedExtensions.find((extension) => path.extname(itemPath).indexOf('.' + extension) > -1)) {
            return true;
        } else {
            console.log('Item with extension not allowed: ', itemPath);
        }
    }

}
