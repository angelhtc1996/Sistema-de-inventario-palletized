import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  // For erase the console.log showed in console of browser
  if(window) window.console.log=function(){};
}

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
