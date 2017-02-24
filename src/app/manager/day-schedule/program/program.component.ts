import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'plurch-day-program',
    templateUrl: 'program.component.html',
    styleUrls: ['program.component.scss']
})
export class ProgramComponent implements OnInit {

    @Input() selectedDayName: string;

    constructor() { }

    ngOnInit() {
    }

}
