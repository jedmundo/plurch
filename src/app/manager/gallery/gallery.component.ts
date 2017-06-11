import { Component, OnInit } from '@angular/core';
import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';

@Component({
    selector: 'app-gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.scss']
})
export class GalleryComponent implements OnInit {

    public downloadedVideos: YouTubeVideo[];
    public folderName: string;
    public isFolderSet: boolean = false;
    public folderList: string[] = [];

    constructor(
        private youtubeManagementService: YoutubeManagementService
    ) { }

    public ngOnInit() {
        this.downloadedVideos = this.youtubeManagementService.downloadedVideosList;
        this.isFolderSet = !!this.youtubeManagementService.youtubeVideosFolder;
        this.refreshFolderList();
    }

    public deleteVideo(video: YouTubeVideo): void {
        this.youtubeManagementService.deleteVideo(video.id);
    }

    public createFolder(): void {
        fs.mkdirSync(this.youtubeManagementService.youtubeVideosFolder + '/' + this.folderName);
        this.folderName = null;
        this.refreshFolderList();
    }

    public removeFolder(name: string): void {
        fs.rmdirSync(this.youtubeManagementService.youtubeVideosFolder + '/' + name);
        this.refreshFolderList();
    }

    private refreshFolderList(): void {
        if (this.isFolderSet) {
            const srcPath = this.youtubeManagementService.youtubeVideosFolder;
            this.folderList = fs.readdirSync(srcPath)
                .filter(file => fs.lstatSync(path.join(srcPath, file)).isDirectory());
        }
    }

}
