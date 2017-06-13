import { Injectable, NgZone } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import * as youtubeSearch from "youtube-search";
import { Observable } from 'rxjs';
import { Http } from '@angular/http';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Stream } from 'stream';

export const LOCAL_STORAGE_YOUTUBE_VIDEOS_FOLDER = 'youtube-videos-folder';
export const LOCAL_STORAGE_YOUTUBE_VIDEOS = 'youtube-videos';

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    link: string;
    embeddedLink: SafeUrl;
    thumbnailUrl: string;
    isDownloaded: boolean;
    percentage?: number;
    duration$: Observable<YoutubeVideoDetails>
}

export interface YoutubeVideoDetails {
    duration: string;
    dimension: string;
    definition: string;
}

export interface YoutubeAutoSuggestion {
    name: string;
}

export interface YouTubeVideoWithStream {
    video: YouTubeVideo;
    stream: any;
}

const opts: youtubeSearch.YouTubeSearchOptions = {
    maxResults: 10,
    key: "AIzaSyDYHdxUDhQMryYfo19S3QHdXMk_Q2iWAnM"
};

@Injectable()
export class YoutubeManagementService {

    public youtubeVideosFolder: string;

    private downloadedVideos: YouTubeVideo[] = [];

    private downloadingVideoSubject = new ReplaySubject<YouTubeVideoWithStream[]>(1);
    private _downloadingVideo$ = this.downloadingVideoSubject.asObservable();
    private downloadingVideosList: YouTubeVideoWithStream[] = [];

    constructor(
        private http: Http,
        private zone: NgZone,
        private sanitizer: DomSanitizer) {
        // ipcRenderer.send('get-youtube-videos-folder');
        //
        // ipcRenderer.on('get-youtube-videos-folder-reply', (event, arg) => {
        //     if (!fs.existsSync(arg)){
        //         fs.mkdirSync(arg);
        //     }
        //     this.youtubeVideosFolder = arg;
        //     this.loadItems();
        // });
        this.youtubeVideosFolder = localStorage.getItem(LOCAL_STORAGE_YOUTUBE_VIDEOS_FOLDER);
        if (this.youtubeVideosFolder) {
            this.loadItems();
        }
    }

    private storeVideo(youtubeVideo: YouTubeVideo): void {
        this.downloadedVideos.push(youtubeVideo);
        localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
    }

    public deleteVideo(id: string) {
        const youtubeVideo = this.downloadedVideos.find((file) => file.id === id);
        this.downloadedVideos.splice(this.downloadedVideos.indexOf(youtubeVideo), 1);
        fs.unlinkSync(this.youtubeVideosFolder + '/' + youtubeVideo.id + '.mp4');
        localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
    }

    public set videosFolder(folder: string) {
        this.youtubeVideosFolder = folder;
        localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS_FOLDER, folder);
    }

    public get downloadingVideo$(): Observable<YouTubeVideoWithStream[]> {
        return this._downloadingVideo$;
    }

    public isDownloading(video: YouTubeVideo): boolean {
        return !!this.downloadingVideosList.find(item => item.video.id === video.id);
    }

    private loadItems(): void {
        const videoList = <YouTubeVideo[]> JSON.parse(localStorage.getItem(LOCAL_STORAGE_YOUTUBE_VIDEOS));
        if (videoList) {
            this.downloadedVideos = videoList;
        }
    }

    public downloadYoutubeVideo(youtubeVideo: YouTubeVideo, finished?: () => void): void {
        const videoStream = ytdl(youtubeVideo.link);
        videoStream.pipe(fs.createWriteStream(this.youtubeVideosFolder + '/' + youtubeVideo.id + '.mp4'));

        this.addDownloadingVideo({ video: youtubeVideo, stream: videoStream });
        videoStream.on('response', (res) => {
            const totalSize = res.headers['content-length'];
            let dataRead = 0;
            res.on('data', (data) => {
                this.zone.run(() => {
                    dataRead += data.length;
                    const percent = dataRead / totalSize;
                    console.log((percent * 100).toFixed(2) + '% ');
                    youtubeVideo.percentage = Math.floor(+(percent * 100).toFixed(2));
                });
            });
            res.on('end', () => {
                this.zone.run(() => {
                    // console.log('Download Finished');
                    this.removeDownloadingVideo(youtubeVideo);
                    youtubeVideo.isDownloaded = true;
                    this.storeVideo(youtubeVideo);
                    if (finished) {
                        finished();
                    }
                });
            });
        });
    }

    public stopVideoDownload(video: YouTubeVideo): void {
        // TODO
        // this.removeDownloadingVideo(video);
        const videoWithStream = this.downloadingVideosList.find(item => item.video.id === video.id);
        videoWithStream.stream.destroy();
    }

    public searchVideo(input: string): Promise<any> {
        return new Promise((resolve, reject) => {
            youtubeSearch(input, opts, (err, results) => {
                if (err) return console.log(err);

                console.dir(results);
                resolve(results);
            });
        });
    }

    public parseVideo(video: any): YouTubeVideo {
        if (!video || (video && video.link && video.link.indexOf('playlist') > -1)) {
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
            duration$: this.getVideoInformation(video.id)
        };
    }

    public get downloadedVideosList(): YouTubeVideo[] {
        return this.downloadedVideos;
    }

    public getSuggestions(text: string): Observable<YoutubeAutoSuggestion[]> {
        return this.http
            .get(`http://suggestqueries.google.com/complete/search?client=youtube&hjson=t&cp=1&q=${text}&format=5&alt=json&callback=?`)
            .map((response) => {
                const resultsArray: { name: string, index: number }[] = (<any> response.json())[1];
                if (resultsArray.length > 0) {
                    return resultsArray.map((result) => ({ name: result[0] }));
                } else {
                    return [];
                }
            })
            .catch((error) => []);
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

    private addDownloadingVideo(youTubeVideoWithStream: YouTubeVideoWithStream): void {
        this.downloadingVideosList.push(youTubeVideoWithStream);
        this.downloadingVideoSubject.next(this.downloadingVideosList);
    }

    private removeDownloadingVideo(video: YouTubeVideo): void {
        this.downloadingVideosList.splice(this.downloadingVideosList.findIndex(item => item.video.id === video.id), 1);
        this.downloadingVideoSubject.next(this.downloadingVideosList);
    }
}
