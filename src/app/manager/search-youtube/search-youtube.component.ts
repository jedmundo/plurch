import { Component } from '@angular/core';
import {
    YouTubeVideo, YoutubeManagementService
} from '../../shared/services/youtube-management.service';

@Component({
    selector: 'app-search-youtube',
    templateUrl: 'search-youtube.component.html',
    styleUrls: ['search-youtube.component.scss']
})
export class SearchYoutubeComponent {

    public searchResults: YouTubeVideo[];

    constructor(
        private youtubeManagementService: YoutubeManagementService) {
    }

    public downloadVideo(youtubeVideo: YouTubeVideo): void {
        this.youtubeManagementService.downloadYoutubeVideo(youtubeVideo);
    }

    public getSearchResults(videos: YouTubeVideo[]): void {
        this.searchResults = videos;
    }

}
