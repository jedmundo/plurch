import { Injectable, NgZone } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { scan, publishReplay, refCount, find, map } from 'rxjs/operators';
import * as youtubeSearch from 'youtube-search';
import { without } from 'lodash';

import { FileTag } from './files-tag-management.service';
import { ElectronService } from './electron.service';

export const LOCAL_STORAGE_YOUTUBE_VIDEOS_FOLDER = 'youtube-videos-folder';
export const LOCAL_STORAGE_YOUTUBE_VIDEOS = 'youtube-videos';

export interface YouTubeVideo {
  id: string;
  title?: string;
  description?: string;
  link: string;
  embeddedLink?: SafeUrl;
  thumbnailUrl?: string;
  isDownloaded?: boolean;
  duration$?: Observable<YoutubeVideoDetails>;

  percentage?: number;
  selected?: boolean;
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

export interface ChangeYoutubeVideoStatusAction {
  add: boolean;
  object: YouTubeVideoWithStream;
}

const opts: youtubeSearch.YouTubeSearchOptions = {
  maxResults: 10,
  key: 'AIzaSyDAhY2VvWaspwC17roUkmksYDSdRF_GVIY'
};

const YOUTUBE_API_KEY = 'AIzaSyDAhY2VvWaspwC17roUkmksYDSdRF_GVIY';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

@Injectable()
export class YoutubeManagementService {

  public youtubeVideosFolder: string;

  private downloadedVideos: YouTubeVideo[] = [];

  private downloadChangesSubject = new Subject<ChangeYoutubeVideoStatusAction>();
  private _downloadingVideo$: Observable<YouTubeVideoWithStream[]>;

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private electronService: ElectronService,
    private sanitizer: DomSanitizer) {

    this.youtubeVideosFolder = localStorage.getItem(LOCAL_STORAGE_YOUTUBE_VIDEOS_FOLDER);
    if (this.youtubeVideosFolder) {
      this.loadItems();
    }

    // TODO: fix any used in this scan
    this._downloadingVideo$ = this.downloadChangesSubject
      .pipe(
        scan((acc: YouTubeVideoWithStream[], { add, object }) => {
          return add ? [...acc, object] : without(acc, object);
        }, <any>[]),
        publishReplay(1),
        refCount()
      );
  }

  private storeVideo(youtubeVideo: YouTubeVideo): void {
    this.downloadedVideos.push(youtubeVideo);
    localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
  }

  public deleteVideo(id: string) {
    const youtubeVideo = this.downloadedVideos.find((file) => file.id === id);
    this.downloadedVideos.splice(this.downloadedVideos.indexOf(youtubeVideo), 1);
    this.electronService.fs.unlinkSync(this.youtubeVideosFolder + '/' + youtubeVideo.id + '.mp4');
    localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS, JSON.stringify(this.downloadedVideos));
  }

  public set videosFolder(folder: string) {
    this.youtubeVideosFolder = folder;
    localStorage.setItem(LOCAL_STORAGE_YOUTUBE_VIDEOS_FOLDER, folder);
  }

  public get downloadingVideo$(): Observable<YouTubeVideoWithStream[]> {
    return this._downloadingVideo$;
  }

  public get downloadChanges$(): Observable<ChangeYoutubeVideoStatusAction> {
    return this.downloadChangesSubject;
  }

  public isDownloading(video: YouTubeVideo): Observable<boolean> {
    return this._downloadingVideo$
      .pipe(
        find((ysList: YouTubeVideoWithStream[]) => !!ysList.find(item => item.video.id === video.id)),
        map((item) => !!item)
      );
  }

  private loadItems(): void {
    const videoList = <YouTubeVideo[]>JSON.parse(localStorage.getItem(LOCAL_STORAGE_YOUTUBE_VIDEOS));
    if (videoList) {
      this.downloadedVideos = videoList;
    }
  }

  public downloadYoutubeVideo(youtubeVideo: YouTubeVideo, finished?: () => void): void {
    const videoStream = this.electronService.ytdl(youtubeVideo.link);
    videoStream.pipe(this.electronService.fs.createWriteStream(this.youtubeVideosFolder + '/' + youtubeVideo.id + '.mp4'));
    const videoWithStream = { video: youtubeVideo, stream: videoStream };
    this.addDownloadingVideo(videoWithStream);
    videoStream.on('response', (res) => {
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
          // console.log('Download Finished');
          this.removeDownloadingVideo(videoWithStream);
          youtubeVideo.isDownloaded = true;
          this.storeVideo(youtubeVideo);
          if (finished) {
            finished();
          }
        });
      });
    });
  }

  public stopVideoDownload(youTubeVideoWithStream: YouTubeVideoWithStream): void {
    this.removeDownloadingVideo(youTubeVideoWithStream);
  }

  public searchVideo(input: string): Promise<any> {
    return new Promise((resolve, reject) => {
      youtubeSearch(input, opts, (err, results) => {
        if (err) {
          return console.log(err);
        }

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

  // public parseVideoFromUrl(url: string): Observable<YouTubeVideo> {
  //   const videoId = url.split('?v=')[1];

  //   console.log('video with id = ', videoId);
  //   if (!url || !videoId) {
  //     return of();
  //   }

  //   return this.http.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${opts.key}`).pipe(
  //     tap(console.log),
  //     map((videoInfo) => ({
  //       id: videoId,
  //       link: url,
  //       thumbnails: {
  //         high: 'https://via.placeholder.com/150'
  //       }
  //     }))
  //   );
  // }

  public get downloadedVideosList(): YouTubeVideo[] {
    return this.downloadedVideos;
  }

  public filterDownloadedVideosList(tag: FileTag): YouTubeVideo[] {
    if (tag.name === 'Unarchived') {
      return this.downloadedVideos;
    } else {
      return this.downloadedVideos.filter((dlVideo) => !!tag.files.find((tagFile) => tagFile === dlVideo.id));
    }
  }

  public getSuggestions(query: string): Observable<YoutubeAutoSuggestion[]> {
    const params: string = [
      `q=${query}`,
      `key=${YOUTUBE_API_KEY}`,
      `part=snippet`,
      `type=video`,
      `maxResults=10`
    ].join('&');

    const queryUrl = `${YOUTUBE_API_URL}?${params}`;

    return this.http.get(queryUrl)
      .pipe(
        map((response) => {
          return response['items'].map((item) => ({ name: item.snippet.title }));
        })
      );
  }

  private getVideoInformation(id: string): Observable<YoutubeVideoDetails> {
    return this.http
      .get(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=contentDetails&key=${opts.key}`)
      .pipe(
        map((response) => {
          const firstItem = (<any>response).items[0];
          if (firstItem) {
            return firstItem.contentDetails;
          } else {
            return { duration: 'Unknown' };
          }
        })
      );
  }

  private addDownloadingVideo(youTubeVideoWithStream: YouTubeVideoWithStream): void {
    this.downloadChangesSubject.next({ add: true, object: youTubeVideoWithStream });
  }

  private removeDownloadingVideo(video: YouTubeVideoWithStream): void {
    this.downloadChangesSubject.next({ add: false, object: video });
  }
}
