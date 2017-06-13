import { Component, OnInit } from '@angular/core';
import { YouTubeVideo, YoutubeManagementService } from '../../shared/services/youtube-management.service';
import { FileTag, FileTagManagementService } from '../../shared/services/files-tag-management.service';
import { Observable } from 'rxjs/Observable';
import { MdDialog } from '@angular/material';
import { CreateTagComponent } from './create-tag/create-tag.component';

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

    public tags$: Observable<FileTag[]>;

    constructor(
        private youtubeManagementService: YoutubeManagementService,
        private fileTagManagementService: FileTagManagementService,
        public dialog: MdDialog
    ) { }

    public ngOnInit() {
        this.tags$ = this.fileTagManagementService.fileTag$;

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

    public addTag(name: string): void {
        // const config: MdDialogConfig = {
        //     data: { name: this.selectedDayName }
        // };
        this.dialog.open(CreateTagComponent);
    }

    public removeTag(tag: FileTag): void {
        this.fileTagManagementService.deleteTag(tag);
    }

    private refreshFolderList(): void {
        if (this.isFolderSet) {
            const srcPath = this.youtubeManagementService.youtubeVideosFolder;
            this.folderList = fs.readdirSync(srcPath)
                .filter(file => fs.lstatSync(path.join(srcPath, file)).isDirectory());
        }
    }

}
