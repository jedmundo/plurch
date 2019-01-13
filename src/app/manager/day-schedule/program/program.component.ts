import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ElectronService } from '../../../shared/services/electron.service';

export const LOCAL_STORAGE_PROGRAM_KEY_PREFIX = 'PROGRAM-';

@Component({
  selector: 'pl-day-program',
  templateUrl: 'program.component.html',
  styleUrls: ['program.component.scss']
})
export class ProgramComponent implements OnInit {

  public selectedDayName: string;
  public imgPath: SafeUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    private electronService: ElectronService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<ProgramComponent>) {
  }

  public ngOnInit(): void {
    this.selectedDayName = this.data.name;
    this.imgPath = this.loadProgramFilePath(this.selectedDayName);
  }

  public openChooseFileDialog() {
    this.electronService.remote.dialog.showOpenDialog({
      title: 'Select image of program file',
      properties: ['openFile']
    }, (imagePath) => {
      this.zone.run(() => {
        this.imgPath = imagePath;
        this.storeProgramFile(imagePath[0]);
      });
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

  private loadProgramFilePath(dayName: string): SafeUrl {
    const programPath: string = localStorage.getItem(LOCAL_STORAGE_PROGRAM_KEY_PREFIX + this.selectedDayName);
    return this.sanitizer.bypassSecurityTrustResourceUrl(programPath);
  }

  private storeProgramFile(programFilePath: string): void {
    localStorage.setItem(LOCAL_STORAGE_PROGRAM_KEY_PREFIX + this.selectedDayName, programFilePath);
  }

}
