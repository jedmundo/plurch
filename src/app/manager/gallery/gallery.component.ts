import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import * as youtubeSearch from "youtube-search";
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export const LOCAL_STORAGE_YOUTUBE_VIDEOS = 'youtube-videos';
export const YOUTUBE_VIDEOS_FOLDER = 'youtube-videos';

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    link: string;
    embeddedLink: SafeUrl;
    thumbnailUrl: string;
    isDownloaded: boolean;
    downloading: boolean;
    percentage?: number;
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
    private downloadedVideos: YouTubeVideo[] = [];

    constructor(
        private sanitizer: DomSanitizer,
        private zone: NgZone
    ) { }

    public ngOnInit() {
        this.loadItems();

        if (!fs.existsSync(YOUTUBE_VIDEOS_FOLDER)){
            fs.mkdirSync(YOUTUBE_VIDEOS_FOLDER);
        }
    }

    public ngAfterViewInit(): void {
        this.results$ = Observable.fromEvent<HTMLInputElement>(this.searchInputRef.nativeElement, 'keyup')
            .debounceTime(500)
            .map((ev: any) => ev.target.value)
            .distinctUntilChanged()
            // .do(termDebug => console.log(termDebug))
            .switchMap(term => Observable.fromPromise(this.searchVideo(term)))
            .map((results) => results.map((video) => this.parseVideo(video)))
            .do(parsedVideos => console.log('PARSED: ', parsedVideos));
    }

    public downloadVideo(youtubeVideo: YouTubeVideo): void {
        const video = ytdl(youtubeVideo.link);
        video.pipe(fs.createWriteStream(YOUTUBE_VIDEOS_FOLDER + '/' + youtubeVideo.id + '.mp4'));
        video.on('response', (res) => {
            const totalSize = res.headers['content-length'];
            let dataRead = 0;
            res.on('data', (data) => {
                this.zone.run(() => {
                    dataRead += data.length;
                    const percent = dataRead / totalSize;
                    // console.log((percent * 100).toFixed(2) + '% ');
                    youtubeVideo.percentage = Math.floor(+(percent * 100).toFixed(2));
                    youtubeVideo.downloading = true;
                });
            });
            res.on('end', () => {
                this.zone.run(() => {
                    console.log('donwload Finished');
                    youtubeVideo.downloading = false;
                    youtubeVideo.isDownloaded = true;
                    this.storeVideo(youtubeVideo);
                });
            });
        });
    }

    private storeVideo(youtubeVideo: YouTubeVideo): void {
        this.downloadedVideos.push(youtubeVideo);
        localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
    }

    // private deleteDay(name: string) {
    //     const file = this.dayList.find((file) => file.name === name);
    //     this.dayList.splice(this.dayList.indexOf(file) , 1);
    //     localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify(this.dayList));
    //     localStorage.removeItem(LOCAL_STORAGE_FILE_LIST_PREFIX + name);
    // }

    private loadItems(): void {
        const videoList = <YouTubeVideo[]> JSON.parse(localStorage.getItem(LOCAL_STORAGE_YOUTUBE_VIDEOS));
        if (videoList) {
            this.downloadedVideos = videoList;
        }
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
            isDownloaded: !!this.downloadedVideos.find((currVideo) => currVideo.id === video.id),
            downloading: false
        };
    }

}
