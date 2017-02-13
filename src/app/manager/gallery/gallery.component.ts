import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as youtubeSearch from "youtube-search";
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export const YOUTUBE_VIDEOS_FOLDER = 'youtube-videos';

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    link: string;
    embeddedLink: SafeUrl;
    thumbnailUrl: string
}

const opts: youtubeSearch.YouTubeSearchOptions = {
    maxResults: 10,
    key: "AIzaSyDYHdxUDhQMryYfo19S3QHdXMk_Q2iWAnM"
};

@Component({
    selector: 'app-gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.scss']
})
export class GalleryComponent implements OnInit, AfterViewInit {

    @ViewChild('searchInput') private searchInputRef: ElementRef;

    public results$: Observable<YouTubeVideo>;

    constructor(private sanitizer: DomSanitizer) { }

    public ngOnInit() {
        if (!fs.existsSync(YOUTUBE_VIDEOS_FOLDER)){
            fs.mkdirSync(YOUTUBE_VIDEOS_FOLDER);
        }
    }

    public ngAfterViewInit(): void {
        this.results$ = Observable.fromEvent<HTMLInputElement>(this.searchInputRef.nativeElement, 'keyup')
            .debounceTime(500)
            .map((ev: any) => ev.target.value)
            .distinctUntilChanged()
            .do(termDebug => console.log(termDebug))
            .switchMap(term => Observable.fromPromise(this.searchVideo(term)))
            .map((results) => results.map((video) => this.parseVideo(video)))
            .do(parsedVideos => console.log('PARSED: ', parsedVideos));
    }

    public downloadVideo(link: string): void {
        ytdl(link)
            .pipe(fs.createWriteStream(YOUTUBE_VIDEOS_FOLDER + '/video.flv'));
    }

    private searchVideo(input: string): Promise<any> {
        return new Promise((resolve, reject) => {
            youtubeSearch(input, opts, (err, results) => {
                if(err) return console.log(err);

                console.dir(results);
                resolve(results);
            });
        });
    }

    private parseVideo(video: any): YouTubeVideo {
        if (!video) {
            return null;
        }

        return {
            id: video.id,
            title: video.title,
            description: video.description,
            link: video.link,
            embeddedLink: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + video.id),
            thumbnailUrl: video.thumbnails.high.url,
        };
    }

}
