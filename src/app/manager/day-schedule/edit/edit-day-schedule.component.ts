import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
    YoutubeManagementService, YouTubeVideo,
    YOUTUBE_VIDEOS_FOLDER
} from '../../../shared/services/youtube-management.service';
import {
    PlayableItem, DayFilesManagementService,
    PLAYABLE_FILE_TYPE
} from '../../../shared/services/day-files-management.service';

@Component({
    selector: 'app-edit-day-schedule',
    templateUrl: 'edit-day-schedule.component.html',
    styleUrls: ['edit-day-schedule.component.scss']
})
export class EditDayScheduleComponent implements OnInit {

    public selectedDayName: string;
    public availableVideos: YouTubeVideo[];
    public playableItems: PlayableItem[] = [];
    public PLAYABLE_FILE_TYPE = PLAYABLE_FILE_TYPE;

    constructor(
        private activatedRoute: ActivatedRoute,
        private youtubeManagementService: YoutubeManagementService,
        private dayFilesManagementService: DayFilesManagementService
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = params['dayName'];
            this.dayFilesManagementService.loadItems(this.selectedDayName, this.playableItems);
        });

        this.availableVideos = this.youtubeManagementService.downloadedVideosList;
    }

    public addVideoToDay(video: YouTubeVideo): void {
        this.dayFilesManagementService.addFile(this.selectedDayName, this.playableItems,
            YOUTUBE_VIDEOS_FOLDER + '/' + video.id + '.mp4', PLAYABLE_FILE_TYPE.VIDEO, video.id);
    }

    public openFile(path: string) {
        this.dayFilesManagementService.openFile(path);
    }

    public deleteFile(path: string) {
        this.dayFilesManagementService.deleteFile(this.selectedDayName, path, this.playableItems);
    }

}
