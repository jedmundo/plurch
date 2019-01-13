import { Component, OnInit } from '@angular/core';

import { LOCAL_STORAGE_FILE_LIST_PREFIX } from '../../shared/services/day-files-management.service';
import { LOCAL_STORAGE_PROGRAM_KEY_PREFIX } from '../day-schedule/program/program.component';

export const LOCAL_STORAGE_DAYS_KEY = 'days';

export class PlurchDay {

  constructor(
    public name: string,
    public description?: string) {
  }
}

@Component({
  selector: 'pl-day-list',
  templateUrl: 'day-list.component.html',
  styleUrls: ['day-list.component.scss']
})
export class DayListComponent implements OnInit {

  public dayList: PlurchDay[] = [];
  public newDay: PlurchDay = new PlurchDay('');

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
    const file = this.dayList.find((plurchDay) => plurchDay.name === name);
    this.dayList.splice(this.dayList.indexOf(file), 1);
    localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify(this.dayList));
    localStorage.removeItem(LOCAL_STORAGE_FILE_LIST_PREFIX + name);
    localStorage.removeItem(LOCAL_STORAGE_PROGRAM_KEY_PREFIX + name);
  }

  public encodeURIComponent(url: string): string {
    return encodeURIComponent(url);
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
