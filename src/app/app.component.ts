import { Component, OnInit } from '@angular/core';

export const IS_DEBUG = false;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

    constructor() {
    }

    public ngOnInit(): void {

    }

}
