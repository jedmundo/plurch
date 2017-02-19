import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
    YouTubeVideo, YoutubeManagementService
} from '../../shared/services/youtube-management.service';
import * as moment from 'moment';

@Component({
  selector: 'app-search-youtube',
  templateUrl: 'search-youtube.component.html',
  styleUrls: ['search-youtube.component.scss']
})
export class SearchYoutubeComponent implements OnInit, AfterViewInit {

    @ViewChild('searchInput') private searchInputRef: ElementRef;

    public results$: Observable<YouTubeVideo>;

    constructor(
        private youtubeManagementService: YoutubeManagementService
    ) { }

    public ngOnInit() {
    }

    public ngAfterViewInit(): void {
        this.results$ = Observable.fromEvent<HTMLInputElement>(this.searchInputRef.nativeElement, 'keyup')
            .debounceTime(500)
            .map((ev: any) => ev.target.value)
            .distinctUntilChanged()
            // .do(termDebug => console.log(termDebug))
            .switchMap(term => Observable.fromPromise(this.youtubeManagementService.searchVideo(term)))
            .map((results) => results.map((video) => this.youtubeManagementService.parseVideo(video)))
            .map((results) => results.filter((video) => !!video))
            .do(parsedVideos => console.log('PARSED: ', parsedVideos));
    }

    public downloadVideo(youtubeVideo: YouTubeVideo): void {
        this.youtubeManagementService.downloadYoutubeVideo(youtubeVideo);
    }

    public formatDate(ISO_8601_date: string): string {
        return new Date(ISO_8601_date).toDateString();
    }

}
