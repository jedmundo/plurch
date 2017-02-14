import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-edit-day-schedule',
    templateUrl: 'edit-day-schedule.component.html',
    styleUrls: ['edit-day-schedule.component.scss']
})
export class EditDayScheduleComponent implements OnInit {

    public selectedDayName: string;

    constructor(
        private activatedRoute: ActivatedRoute
    ) { }

    public ngOnInit() {
        this.activatedRoute.parent.params.subscribe((params: Params) => {
            this.selectedDayName = params['dayName'];
        });
    }

}
