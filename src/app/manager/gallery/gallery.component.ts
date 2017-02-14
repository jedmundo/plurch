import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';

@Component({
    selector: 'app-gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.scss']
})
export class GalleryComponent implements OnInit, AfterViewInit {

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
            .do(parsedVideos => console.log('PARSED: ', parsedVideos));
    }

    public downloadVideo(youtubeVideo: YouTubeVideo): void {
        this.youtubeManagementService.downloadYoutubeVideo(youtubeVideo);
    }

}
