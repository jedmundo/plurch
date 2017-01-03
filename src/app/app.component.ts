import { Component, OnInit, NgZone } from '@angular/core';

const { remote, ipcRenderer, shell } = electron;

const videoAllowedExtensions: string[] = ['mp4', 'm4v', 'mkv'];
const allAllowedExtensions: string[] = videoAllowedExtensions.concat(['.png', 'jpg', 'jpeg','pptx', '']);

enum FILE_TYPE {
    VIDEO,
    DEFAULT
}

export class File {
    constructor(
        public path: string,
        public type: FILE_TYPE = FILE_TYPE.DEFAULT,
        public thumbnailPath?: string
    ) {}

    public getName(): string {
        return this.path.split('/')[this.path.split('/').length-1].split('.')[0]
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

    public title = 'Plurch';
    public files: File[] = [];
    public FILE_TYPE = FILE_TYPE;

    constructor(private zone: NgZone) {
    }

    public ngOnInit(): void {
        this.loadItems('files', this.files);
    }

    public newW(): void {
        ipcRenderer.on('asynchronous-reply', (event, arg) => {
            console.log(arg);
        });
        ipcRenderer.send('asynchronous-message', location.href);
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

    public openFile(path: string) {
        shell.openItem(path);
    }

    public deleteFile(path: string) {
        const file = this.files.find((file) => file.path === path);
        this.files.splice(this.files.indexOf(file) , 1);
        localStorage.setItem('files', JSON.stringify(this.files));
    }

    private addVideosFromFolderOrFile(itemPaths: string[]): void {
        if (itemPaths) {
            itemPaths.forEach((itemPath) => {
                const isDirectory = fs.lstatSync(itemPath).isDirectory();
                if (isDirectory) {
                    fs.readdir(itemPath, (err, files) => {
                        this.zone.run(() => {
                            files.forEach(file => {
                                if (this.isAllowedVideo(file)) {
                                    this.addFile(itemPath + '/' + file, FILE_TYPE.VIDEO);
                                } else {
                                    this.addFile(itemPath, FILE_TYPE.DEFAULT);
                                }
                            });
                        });
                    })
                } else {
                    if (this.isAllowedVideo(itemPath)) {
                        this.addFile(itemPath, FILE_TYPE.VIDEO);
                    } else {
                        this.addFile(itemPath, FILE_TYPE.DEFAULT);
                    }
                }
            });
        }
    }

    private isAllowedVideo(itemPath: string): boolean {
        if (videoAllowedExtensions.find((extension) => path.extname(itemPath).indexOf('.' + extension) > -1)) {
            return true;
        } else {
            console.log('Item with extension not allowed: ', itemPath);
        }
    }

    private addFile(path: string, type: FILE_TYPE): void {
        console.log('ADD File:', path);

        if (type === FILE_TYPE.VIDEO) {
            this.storeFile(path, type);
        } else {
            ipcRenderer.on('save-preview-reply', (event, thumbnailPath) => {
                this.zone.run(() => {
                    if (thumbnailPath) {
                        this.storeFile(path, type, thumbnailPath);
                    } else {
                        this.storeFile(path, type);
                    }
                });
            });
            ipcRenderer.send('save-preview', path);

        }
    }

    private storeFile(path: string, type: FILE_TYPE, thumbnailPath?: string): void {
        this.files.push(new File(path, type, thumbnailPath));
        localStorage.setItem('files', JSON.stringify(this.files));
    }

    private loadItems(key: string, list: File[]): void {
        const fileList: File[] = JSON.parse(localStorage.getItem(key));
        if (fileList) {
            fileList.forEach((file: File) => {
                list.push(new File(file.path, file.type, file.thumbnailPath));
            });
        }
    }
}
