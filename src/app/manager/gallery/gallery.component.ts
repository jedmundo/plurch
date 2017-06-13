import { Component, OnInit } from '@angular/core';
import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';
import { FileTag, FileTagManagementService } from '../../shared/services/files-tag-management.service';
import { Observable } from 'rxjs/Observable';
import { MdDialog } from '@angular/material';
import { CreateTagComponent } from './create-tag/create-tag.component';

@Component({
    selector: 'app-gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.scss']
})
export class GalleryComponent implements OnInit {

    public downloadedVideos: YouTubeVideo[];
    public tags$: Observable<FileTag[]>;

    constructor(
        private youtubeManagementService: YoutubeManagementService,
        private fileTagManagementService: FileTagManagementService,
        public dialog: MdDialog
    ) { }

    public ngOnInit() {
        this.tags$ = this.fileTagManagementService.fileTag$;

        this.downloadedVideos = this.youtubeManagementService.downloadedVideosList;
    }

    public deleteVideo(video: YouTubeVideo): void {
        this.youtubeManagementService.deleteVideo(video.id);
    }


    public addTag(): void {
        this.dialog.open(CreateTagComponent);
    }

    public deleteTag(tag: FileTag): void {
        this.fileTagManagementService.deleteTag(tag);
    }

    public removeTag(tag: FileTag): void {
        this.fileTagManagementService.deleteTag(tag);
    }

}
