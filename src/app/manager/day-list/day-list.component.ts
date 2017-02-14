import { Component, OnInit } from '@angular/core';
import { LOCAL_STORAGE_FILE_LIST_PREFIX } from '../day-schedule/view/view-day-schedule.component';

const LOCAL_STORAGE_DAYS_KEY = 'days';

export class PlurchDay {

    constructor(
        public name: string,
        // public date: Date,
        public description?: string) {
    }
}

@Component({
    selector: 'app-day-list',
    templateUrl: 'day-list.component.html',
    styleUrls: ['day-list.component.scss']
})
export class DayListComponent implements OnInit {

    public dayList: PlurchDay[] = [];
    public newDay: PlurchDay = new PlurchDay('');

    constructor() { }

    public ngOnInit(): void {
        this.loadItems(this.dayList);
    }

    public addDay(name: string, description: string): void {
        if (name === '') {
            return;
        }

        this.dayList.push(new PlurchDay(name, description));
        localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify(this.dayList));
        this.newDay = new PlurchDay('');
    }

    public deleteDay(name: string) {
        const file = this.dayList.find((file) => file.name === name);
        this.dayList.splice(this.dayList.indexOf(file) , 1);
        localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify(this.dayList));
        localStorage.removeItem(LOCAL_STORAGE_FILE_LIST_PREFIX + name);
    }

    private loadItems(list: PlurchDay[]): void {
        const dayList: PlurchDay[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DAYS_KEY));
        if (dayList) {
            dayList.forEach((pDay: PlurchDay) => {
                list.push(new PlurchDay(pDay.name, pDay.description));
            });
        }
    }

}
