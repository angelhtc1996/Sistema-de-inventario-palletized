import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IndicatorModel } from 'src/app/shared/models/indicator.model';
import { IndicatorService } from 'src/app/core/services/indicator.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { translations } from '../../../../assets/langs/translations.js';

@Component({
  selector: 'app-indicator-toggle',
  templateUrl: './indicator-toggle.component.html',
  styleUrls: ['./indicator-toggle.component.scss']
})
export class IndicatorToggleComponent implements OnInit {
  public indicatorList: IndicatorModel[] = [];
  public isDarkTheme: boolean;
  public translations: any = translations;

  constructor(
    private overlayContainer: OverlayContainer,
    private themeService: ThemeService,
    private toastrService: ToastrService,
    private indicatorService: IndicatorService) {}

  ngOnInit(): void {
    // Obteniendo el tema actual
    this.checkCurrentTheme();
    this.themeService.themeChanged.subscribe(() => this.checkCurrentTheme());
    this.indicatorService.indicatorsSettingChanged.subscribe(() => this.checkIndicatorsSetting());

    // Verificar la configuración de los indicadores
    this.checkIndicatorsSetting();
  }

  public checkIndicatorsSetting(): void {
    // Consulta de la configuracion del localStorage
    const isFromLocal = this.indicatorService.getIndicatorsSettingFromLocal();

    // Verifico si hay una configuracion en local, sino la busco del servidor
    this.indicatorList = (isFromLocal === null) ? this.indicatorService.getIndicatorsSettingFromServer() : isFromLocal;
  }

  public checkCurrentTheme(): void {
    // Obteniendo el tema actual
    const darkTheme = this.overlayContainer.getContainerElement().classList.contains('dark-theme');
    const lightTheme = this.overlayContainer.getContainerElement().classList.contains('light-theme');

    // Verificando el tema actual
    this.isDarkTheme = true;
    if (!darkTheme && !lightTheme) {
      this.isDarkTheme = true;
    } else if (darkTheme) {
      this.isDarkTheme = true;
    } else if (lightTheme) {
      this.isDarkTheme = false;
    }
  }

  public toggleIndicator(indicatorId: number, event: any): void {
    // Buscando los indicadores activos
    const indicatorsActive = this.indicatorList.filter(x => x.active);

    if (!event.checked) { // Va a false | Valores por defecto
      this.indicatorList.map(e => {
        if (e.id === indicatorId) {
          e.active = false;
          e.customerId = 0;
          e.time = '';
        }
      });
    } else if (indicatorsActive.length === 5) { // Verificando los indicadores activos
      this.toastrService.warning('', translations.LANG.EN.DASHBOARD.SETTINGS.ONLY_FIVE);
      event.source.checked = false;
    } else { // Va a true
      this.indicatorList.map(e => {
        if (e.id === indicatorId) {
          e.active = true;
        }
      });
    }
  }

  public saveChanges(): void {
    this.indicatorService.saveChanges(this.indicatorList);
  }

  public resetSetting(): void {
    this.indicatorList = this.indicatorService.getIndicatorsSettingByDefault();
    this.indicatorService.saveChanges(this.indicatorList);
  }
}
