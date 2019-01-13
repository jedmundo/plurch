import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';

@Component({
  selector: 'pl-search-youtube',
  templateUrl: 'search-youtube.component.html',
  styleUrls: ['search-youtube.component.scss']
})
export class SearchYoutubeComponent {

  public searchResults: YouTubeVideo[];

  constructor(
    private youtubeManagementService: YoutubeManagementService
  ) { }

  public downloadVideo(youtubeVideo: YouTubeVideo): void {
    this.youtubeManagementService.downloadYoutubeVideo(youtubeVideo);
  }

  public getSearchResults(videos: YouTubeVideo[]): void {
    this.searchResults = videos;
  }

  public isDownloading(video: YouTubeVideo): Observable<boolean> {
    return this.youtubeManagementService.isDownloading(video);
  }

}
