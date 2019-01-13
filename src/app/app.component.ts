import { Component } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { AppConfig } from './app.config';
import { ElectronService } from './shared/services/electron.service';

export const IS_DEBUG = false;
export const USE_LOUDNESS = true;

@Component({
  selector: 'pl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    electronService: ElectronService,
    translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }
}
