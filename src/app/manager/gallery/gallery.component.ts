import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';

@Component({
    selector: 'app-gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.scss']
})
export class GalleryComponent implements OnInit {

    public downloadedVideos: YouTubeVideo[];

    constructor(
        private youtubeManagementService: YoutubeManagementService
    ) { }

    public ngOnInit() {
        this.downloadedVideos = this.youtubeManagementService.downloadedVideosList;
    }

    public deleteVideo(video: YouTubeVideo): void {
        this.youtubeManagementService.deleteVideo(video.id);
    }

}
