import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { YoutubeManagementService, YouTubeVideoWithStream } from '../../services/youtube-management.service';

@Component({
  selector: 'pl-download-list',
  templateUrl: 'download-list.component.html',
  styleUrls: ['download-list.component.scss']
})
export class DownloadListComponent implements OnInit, OnDestroy {

  public dlVideosExists: Observable<boolean>;
  public dlVideos$: Observable<YouTubeVideoWithStream[]>;

  private dlChangeVideoStatusSubscription: Subscription;

  constructor(
    private youtubeManagementService: YoutubeManagementService
  ) { }

  public ngOnInit(): void {
    // this.dlVideos$ = Observable.of([
    //     {
    //         id: '342523523',
    //         title: 'teste cenas',
    //         description: '4tgfgdhdfhfdhd',
    //         link: '',
    //         embeddedLink: null,
    //         thumbnailUrl: '',
    //         isDownloaded: false,
    //         percentage: 34,
    //         duration$: Observable.of({
    //             duration: '3',
    //             dimension: '4',
    //             definition: '5'
    //         })
    //     },
    //     {
    //         id: '3425235243563463',
    //         title: 'teste cenas regeherhe erher eherhehe',
    //         description: '4tgfgdhdfhfdhd',
    //         link: '',
    //         embeddedLink: null,
    //         thumbnailUrl: '',
    //         isDownloaded: false,
    //         percentage: 67,
    //         duration$: Observable.of({
    //             duration: '3',
    //             dimension: '4',
    //             definition: '5'
    //         })
    //     }
    // ]);
    this.dlVideos$ = this.youtubeManagementService.downloadingVideo$;

    this.dlVideosExists = this.dlVideos$.pipe(map(videos => !!videos && videos.length > 0));

    this.dlChangeVideoStatusSubscription = this.youtubeManagementService.downloadChanges$
      .subscribe((videoStatus) => {
        if (!videoStatus.add) {
          videoStatus.object.stream.destroy();
        }
      });
  }

  public ngOnDestroy(): void {
    this.dlChangeVideoStatusSubscription.unsubscribe();
  }

  public stopDownload(video: YouTubeVideoWithStream): void {
    this.youtubeManagementService.stopVideoDownload(video);
  }

}
