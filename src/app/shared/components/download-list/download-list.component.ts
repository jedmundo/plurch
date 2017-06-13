import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { YoutubeManagementService, YouTubeVideo } from '../../services/youtube-management.service';

@Component({
    selector: 'pl-download-list',
    templateUrl: 'download-list.component.html',
    styleUrls: ['download-list.component.scss']
})
export class DownloadListComponent implements OnInit {

    public dlVideosExists: Observable<boolean>;
    public dlVideos$: Observable<YouTubeVideo[]>;

    constructor(
        private youtubeManagementService: YoutubeManagementService) {
    }

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
        this.dlVideos$ = this.youtubeManagementService.downloadingVideo$
            .map((videoWithStreams) => videoWithStreams.map(videoWithStream => videoWithStream.video));

        this.dlVideosExists = this.dlVideos$
            .map(videos => !!videos && videos.length > 0);
    }

    public stopDownload(video: YouTubeVideo): void {
        this.youtubeManagementService.stopVideoDownload(video);
    }

}
