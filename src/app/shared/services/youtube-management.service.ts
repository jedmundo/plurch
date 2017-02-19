import { Injectable, NgZone } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import * as youtubeSearch from "youtube-search";
import { Observable } from 'rxjs';
import { Http } from '@angular/http';

export const LOCAL_STORAGE_YOUTUBE_VIDEOS = 'youtube-videos';

const { ipcRenderer } = electron;

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
    duration: Observable<YoutubeVideoDetails>
}

export interface YoutubeVideoDetails {
    duration: string;
    dimension: string;
    definition: string;
}

const opts: youtubeSearch.YouTubeSearchOptions = {
    maxResults: 10,
    key: "AIzaSyDYHdxUDhQMryYfo19S3QHdXMk_Q2iWAnM"
};

@Injectable()
export class YoutubeManagementService {

    public youtubeVideosFolder: string;

    private downloadedVideos: YouTubeVideo[] = [];

    constructor(
        private http: Http,
        private zone: NgZone,
        private sanitizer: DomSanitizer
    ) {
        ipcRenderer.send('get-youtube-videos-folder');

        ipcRenderer.on('get-youtube-videos-folder-reply', (event, arg) => {
            if (!fs.existsSync(arg)){
                fs.mkdirSync(arg);
            }
            this.youtubeVideosFolder = arg;
            this.loadItems();
        });
    }

    private storeVideo(youtubeVideo: YouTubeVideo): void {
        this.downloadedVideos.push(youtubeVideo);
        localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
    }

    public deleteVideo(id: string) {
        const youtubeVideo = this.downloadedVideos.find((file) => file.id === id);
        this.downloadedVideos.splice(this.downloadedVideos.indexOf(youtubeVideo) , 1);
        fs.unlinkSync(this.youtubeVideosFolder + '/' + youtubeVideo.id + '.mp4');
        localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
    }

    private loadItems(): void {
        const videoList = <YouTubeVideo[]> JSON.parse(localStorage.getItem(LOCAL_STORAGE_YOUTUBE_VIDEOS));
        if (videoList) {
            this.downloadedVideos = videoList;
        }
    }

    public downloadYoutubeVideo(youtubeVideo: YouTubeVideo): void {
        const video = ytdl(youtubeVideo.link);
        video.pipe(fs.createWriteStream(this.youtubeVideosFolder + '/' + youtubeVideo.id + '.mp4'));
        youtubeVideo.downloading = true;
        video.on('response', (res) => {
            const totalSize = res.headers['content-length'];
            let dataRead = 0;
            res.on('data', (data) => {
                this.zone.run(() => {
                    dataRead += data.length;
                    const percent = dataRead / totalSize;
                    // console.log((percent * 100).toFixed(2) + '% ');
                    youtubeVideo.percentage = Math.floor(+(percent * 100).toFixed(2));
                });
            });
            res.on('end', () => {
                this.zone.run(() => {
                    console.log('Download Finished');
                    youtubeVideo.downloading = false;
                    youtubeVideo.isDownloaded = true;
                    this.storeVideo(youtubeVideo);
                });
            });
        });
    }

    public searchVideo(input: string): Promise<any> {
        return new Promise((resolve, reject) => {
            youtubeSearch(input, opts, (err, results) => {
                if(err) return console.log(err);

                console.dir(results);
                resolve(results);
            });
        });
    }

    public parseVideo(video: any): YouTubeVideo {
        if (!video || (video && video.link.indexOf('playlist') > -1)) {
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
            downloading: false,
            duration: this.getVideoInformation(video.id)
        };
    }

    public get downloadedVideosList(): YouTubeVideo[] {
        return this.downloadedVideos;
    }

    private getVideoInformation(id: string): Observable<YoutubeVideoDetails> {
        return this.http
            .get(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=contentDetails&key=${opts.key}`)
            .map((response) => {
            const firstItem = (<any> response.json()).items[0];
                if (firstItem) {
                    return firstItem.contentDetails;
                } else {
                    return { duration: 'Unknown' };
                }
            });
    }
}
