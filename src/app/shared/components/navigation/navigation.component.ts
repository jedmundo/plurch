import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { AppSettingsService } from '../../services/app-settings.service';

@Component({
  selector: 'pl-navigation',
  templateUrl: 'navigation.component.html',
  styleUrls: ['navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  public menuItems$: Observable<string[]>;

  constructor(
    private appSettingsService: AppSettingsService
  ) { }

  public ngOnInit(): void {
    this.menuItems$ = this.appSettingsService.menuItems$;
  }

  public encodeURIComponent(url: string): string {
    return encodeURIComponent(url);
  }
}
