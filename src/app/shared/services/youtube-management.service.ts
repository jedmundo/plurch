import { Injectable, NgZone } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import * as youtubeSearch from "youtube-search";

export const LOCAL_STORAGE_YOUTUBE_VIDEOS = 'youtube-videos';
export const YOUTUBE_VIDEOS_FOLDER = './youtube-videos';

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

@Injectable()
export class YoutubeManagementService {

    private downloadedVideos: YouTubeVideo[] = [];

    constructor(
        private zone: NgZone,
        private sanitizer: DomSanitizer
    ) {
        if (!fs.existsSync(YOUTUBE_VIDEOS_FOLDER)){
            fs.mkdirSync(YOUTUBE_VIDEOS_FOLDER);
        }
        this.loadItems();
    }

    private storeVideo(youtubeVideo: YouTubeVideo): void {
        this.downloadedVideos.push(youtubeVideo);
        localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
    }

    private deleteVideo(id: string) {
        const youtubeVideo = this.downloadedVideos.find((file) => file.id === id);
        this.downloadedVideos.splice(this.downloadedVideos.indexOf(youtubeVideo) , 1);
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

    public get downloadedVideosList(): YouTubeVideo[] {
        return this.downloadedVideos;
    }
}
