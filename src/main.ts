import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/';
import { IS_DEBUG } from './app/app.component';

// if (environment.production) {
//   enableProdMode();
// }

if (!IS_DEBUG) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
