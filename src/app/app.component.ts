import { Component, OnInit, NgZone } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'app works!';

    public videoUrl: string;

    constructor(private zone: NgZone) {
    }

    public ngOnInit(): void {

    }

    public addToGallery() {
        const { remote } = electron;

        remote.dialog.showOpenDialog((fileNames) => {
            this.zone.run(() => {
                if (fileNames === undefined){
                    console.log("You didn't save the file");
                    return;
                }
                this.videoUrl = fileNames[0];

                console.log(fileNames);
                // fileName is a string that contains the path and filename created in the save file dialog.
                // fs.writeFile(fileNames[0] + '.txt', 'sdadasda', function (err) {
                //     if(err){
                //         alert("An error ocurred creating the file "+ err.message)
                //     }
                //
                //     alert("The file has been succesfully saved");
                // });
            });
        });
    }
}
