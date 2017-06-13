import { Component, OnDestroy, OnInit } from '@angular/core';
import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';
import { FileTag, FileTagManagementService } from '../../shared/services/files-tag-management.service';
import { Observable } from 'rxjs/Observable';
import { MdDialog } from '@angular/material';
import { CreateTagComponent } from './create-tag/create-tag.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {

    public downloadedVideos: YouTubeVideo[];
    public tagList: FileTag[];

    public selectedTag: FileTag;

    private tagListSubscription: Subscription;

    constructor(
        private youtubeManagementService: YoutubeManagementService,
        private fileTagManagementService: FileTagManagementService,
        public dialog: MdDialog
    ) { }

    public ngOnInit() {
        const defaultTag: FileTag = { name: 'Unarchived', files: [] };
        this.selectedTag = defaultTag;
        this.tagListSubscription = this.fileTagManagementService.fileTag$.subscribe((tags) => {
            this.tagList = [ defaultTag, ...tags];
        });

        this.downloadedVideos = this.youtubeManagementService.filterDownloadedVideosList(this.selectedTag);
    }

    public ngOnDestroy(): void {
        this.tagListSubscription.unsubscribe();
    }

    public selectTag(tag: FileTag): void {
        this.selectedTag = tag;
        this.downloadedVideos = this.youtubeManagementService.filterDownloadedVideosList(this.selectedTag);
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

    public deleteVideo(video: YouTubeVideo): void {
        this.youtubeManagementService.deleteVideo(video.id);
    }

}
