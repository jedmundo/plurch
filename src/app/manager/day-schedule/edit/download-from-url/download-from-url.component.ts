import { Component, Output, EventEmitter } from '@angular/core';
import { YoutubeManagementService, YouTubeVideo } from '../../../../shared/services/youtube-management.service'

@Component({
  selector: 'pl-youtube-download-from-url',
  templateUrl: 'download-from-url.component.html',
  styleUrls: ['download-from-url.component.scss']
})

export class DownloadFromYoutubeUrlComponent {

  @Output() public downloadFile = new EventEmitter<YouTubeVideo>();

  public title: string;
  public url: string;

  constructor(
    private readonly youtubeManagementService: YoutubeManagementService
  ) { }

  public inputChange(inputChangeEvent: any): void {
    this.url = inputChangeEvent.target.value.replace(/\s\r\n/g, '');
  }

  public clickDownloadFile(): void {
    const videoId = this.url.split('?v=')[1];
    const video = this.youtubeManagementService.parseVideo({
      id: videoId,
      link: this.url,
      title: this.title,
      thumbnails: {
        high: {
          url: 'https://via.placeholder.com/150'
        }
      }
    });

    this.downloadFile.emit(video);
  }

}
