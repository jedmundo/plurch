import { Component, OnInit, NgZone } from '@angular/core';

const { remote, ipcRenderer, shell } = electron;

const videoAllowedExtensions: string[] = ['mp4', 'm4v', 'mkv'];

export class File {
    constructor(
        public path: string,
        public previewPath: string,
        public type: string = 'file'
    ) {}
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

    public title = 'Plurch';
    public files: File[] = [];

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
                                    this.addFileToGallery(itemPath + '/' + file, 'video');
                                } else {
                                    this.addFileToGallery(itemPath);
                                }
                            });
                        });
                    })
                } else {
                    if (this.isAllowedVideo(itemPath)) {
                        this.addFileToGallery(itemPath, 'video');
                    } else {
                        this.addFileToGallery(itemPath);
                    }
                }
            });
        }
    }

    private addFileToGallery(path: string, type: string = 'file') {
        this.addFile(path, 'files', type, this.files);
    }

    private isAllowedVideo(itemPath: string): boolean {
        if (videoAllowedExtensions.find((extension) => path.extname(itemPath).indexOf('.' + extension) > -1)) {
            return true;
        } else {
            console.log('Item with extension not allowed: ', itemPath);
        }
    }

    private addFile(path: string, key: string, type: string, list: File[]): void {
        console.log('ADD File:', path);
        // ipcRenderer.on('save-preview-reply', (event, previewPath) => {
        //     console.log(previewPath);
        //     list.push(new File(path, previewPath));
        //     localStorage.setItem(key, JSON.stringify(list));
        // });
        // ipcRenderer.send('save-preview', path);
        const pathList = path.split('/');
        const targetPath = '/Users/jedmundo/Desktop/plurch/thumbnails/preview_'
            + pathList[pathList.length-1].split('.')[0] + '.gif';

        if (!filepreview.generateSync(path, targetPath)) {
            console.log('Oops, something went wrong.');
        } else {
            list.push(new File(path, targetPath, type));
            localStorage.setItem(key, JSON.stringify(list));
        }
    }

    private loadItems(key: string, list: File[]): void {
        const fileList: File[] = JSON.parse(localStorage.getItem(key));
        if (fileList) {
            fileList.forEach((file: File) => {
                list.push(new File(file.path, file.previewPath, file.type));
            });
        }
    }
}
