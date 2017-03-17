import { Component, OnInit } from '@angular/core';
import { PlurchWindow, WindowManagementService } from '../../services/window-management.service';
import { Observable } from 'rxjs';
import { PlurchDay, LOCAL_STORAGE_DAYS_KEY } from '../../../manager/day-list/day-list.component';

@Component({
    selector: 'app-navigation',
    templateUrl: 'navigation.component.html',
    styleUrls: ['navigation.component.scss']
})
export class NavigationComponent implements OnInit {

    public pWindows: Observable<PlurchWindow[]>;

    constructor(
        private windowManagementService: WindowManagementService
    ) { }

    public ngOnInit(): void {
        this.pWindows = this.windowManagementService.availableWindows;
    }

    public get lastCultDayName(): string {
        const results = this.loadDayItems();
        return encodeURIComponent(results[results.length-1].name);
    }

    private loadDayItems(): PlurchDay[] {
        let result = [];
        const dayList: PlurchDay[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DAYS_KEY));
        if (dayList) {
            dayList.forEach((pDay: PlurchDay) => {
                result.push(new PlurchDay(pDay.name, pDay.description));
            });
        }
        return result;
    }

}
