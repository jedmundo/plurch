import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { FileTagManagementService } from '../../../shared/services/files-tag-management.service';

@Component({
    selector: 'create-tag-dialog',
    templateUrl: 'create-tag.component.html',
    styleUrls: ['create-tag.component.scss']
})
export class CreateTagComponent implements OnInit {

    public tagName: string;

    constructor(
        private fileTagManagementService: FileTagManagementService,
        public dialogRef: MdDialogRef<CreateTagComponent>) {
    }

    public ngOnInit(): void {
    }

    public create(name: string) {
        this.fileTagManagementService.createTag(name);
        this.tagName = null;
    }

    public close(): void {
        this.dialogRef.close();
    }

}
