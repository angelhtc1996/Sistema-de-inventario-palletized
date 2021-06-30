import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ThemeService {
  public isDarkTheme: boolean;
  public themeChanged = new EventEmitter<boolean>();

  public getDarkTheme(): boolean {
    return this.isDarkTheme;
  }

  public setDarkTheme(isDarkTheme: boolean): void {
    this.isDarkTheme = isDarkTheme;
    this.themeChanged.emit(this.isDarkTheme);
  }
}
