import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';

import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';
import { FileTag, FileTagManagementService } from '../../shared/services/files-tag-management.service';
import { CreateTagComponent } from './create-tag/create-tag.component';

@Component({
  selector: 'pl-gallery',
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
    private dialog: MatDialog) {
  }

  public ngOnInit() {
    const defaultTag: FileTag = { name: 'Unarchived', files: [] };
    this.selectedTag = defaultTag;
    this.tagListSubscription = this.fileTagManagementService.fileTag$.subscribe((tags) => {
      this.tagList = [defaultTag, ...tags];
    });

    this.downloadedVideos = this.youtubeManagementService.filterDownloadedVideosList(this.selectedTag);

    // dragula([document.querySelector('.videos-list .list'), document.querySelector('.tag-details')], {
    //     direction: 'vertical',             // Y axis is considered when determining where an element would be dropped
    //     copy: false,                       // elements are moved by default, not copied
    //     copySortSource: false,             // elements in copy-source containers can be reordered
    //     revertOnSpill: true,              // spilling will put the element back where it was dragged from, if this is true
    //     removeOnSpill: false,              // spilling will `.remove` the element, if this is true
    //     mirrorContainer: document.body,    // set the element that gets mirror elements appended
    //     ignoreInputTextSelection: true     // allows users to select input text, see details below
    // });
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
