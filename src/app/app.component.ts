import { Component, OnInit, NgZone } from '@angular/core';

const { remote } = electron;

const allowedExtensions: string[] = ['.mp4', '.m4v'];

export class Video {
    constructor(
        public path: string
    ) {}
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

    public title = 'Plurch';
    public videos: Video[] = [];

    constructor(private zone: NgZone) {
    }

    public ngOnInit(): void {
        const videoList: Video[] = JSON.parse(localStorage.getItem('videos'));
        if (videoList) {
            videoList.forEach((video: Video) => {
                this.videos.push(new Video(video.path))
            });
        }
    }

    public openChooseItemDialog() {
        remote.dialog.showOpenDialog({
            title:"Select files or a folder",
            properties: ["openDirectory","openFile","multiSelections"]
        }, (itemPaths) => {
            this.zone.run(() => {
                this.addVideosFromFolderOrFile(itemPaths);
            });
        });
    }

    private addVideosFromFolderOrFile(itemPaths: string[]): void {
        if (itemPaths) {
            itemPaths.forEach((itemPath) => {
                const isDirectory = fs.lstatSync(itemPath).isDirectory();
                if (isDirectory) {
                    fs.readdir(itemPath, (err, files) => {
                        this.zone.run(() => {
                            files.forEach(file => {
                                if (this.isFileAllowed(file)) {
                                    this.addVideoToGallery(itemPath + '/' + file);
                                }
                            });
                        });
                    })
                } else {
                    if (this.isFileAllowed(itemPath)) {
                        this.addVideoToGallery(itemPath);
                    }
                }
            });
        }
    }

    private addVideoToGallery(path: string) {
        console.log('ADD Video:', path);
        this.videos.push(new Video(path));
        localStorage.setItem('videos', JSON.stringify(this.videos));
    }

    private isFileAllowed(itemPath: string): boolean {
        return !!allowedExtensions.find((extension) => path.extname(itemPath).indexOf(extension) > -1);
    }
}
