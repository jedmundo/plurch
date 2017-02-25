import { Component, OnInit, NgZone } from '@angular/core';
import { MdDialogRef } from '@angular/material';
const { remote } = electron;

export const LOCAL_STORAGE_PROGRAM_KEY_PREFIX = 'PROGRAM-';

@Component({
    selector: 'plurch-day-program',
    templateUrl: 'program.component.html',
    styleUrls: ['program.component.scss']
})
export class ProgramComponent implements OnInit {

    public selectedDayName: string;
    public imgPath: string;

    constructor(
        private zone: NgZone,
        public dialogRef: MdDialogRef<ProgramComponent>
    ) { }

    public ngOnInit(): void {
        this.selectedDayName = this.dialogRef.config.data.name;
        this.imgPath = this.loadProgramFilePath(this.selectedDayName);
    }

    public openChooseFileDialog() {
        remote.dialog.showOpenDialog({
            title:"Select image of program file",
            properties: [ "openFile" ]
        }, (imagePath) => {
            this.zone.run(() => {
                this.imgPath = imagePath;
                this.storeProgramFile(imagePath);
            });
        });
    }

    public close(): void {
        this.dialogRef.close();
    }

    private loadProgramFilePath(dayName: string): string {
        return localStorage.getItem(LOCAL_STORAGE_PROGRAM_KEY_PREFIX + this.selectedDayName);
    }

    private storeProgramFile(programFilePath: string): void {
        localStorage.setItem(LOCAL_STORAGE_PROGRAM_KEY_PREFIX + this.selectedDayName, programFilePath);
    }

}
