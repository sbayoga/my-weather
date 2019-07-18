import {Component} from '@angular/core';
import {WeatherService} from '../../services/weather.service';

import {LoadingController} from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
    providers: [WeatherService]
})
export class HomePage {

    public degrees = 0;
    public weatherStatus = '';
    public weatherVideo = '../../assets/videos/ocaso.mp4';

    private maxDegrees = 32;
    private interval = null;
    private weather = {};
    private loader = null;

    constructor(private WeatherSrv: WeatherService,
                private LoaderCtr: LoadingController) {
        this.showLoader();
        this.WeatherSrv
            .getDailyTownWeather(28079)
            .then(response => this.onGetWeather(response));
    }

    private getTodayFullDate(): string {
        const props = {year: 'numeric', month: '2-digit', day: 'numeric'};
        return new Date()
            .toLocaleDateString('es-ES', props)
            .split('/')
            .reverse()
            .join('-');
    }

    private getAttribute(attribute: string): any[] {
        return this.weather
            && this.weather.dia
            && this.weather.dia
                .find((day: any) => day.fecha === this.getTodayFullDate())[attribute]
                .flat() || [];
    }

    private getTemperature(): number {
        const temperature = this.getAttribute('temperatura')
            .find((t) => Number(t.periodo) === new Date().getHours());
        return temperature && temperature.value || 0;
    }

    private setWeatherVideo(): string {
        const switcher = {
            'Despejado': 'soleado',
            'Poco Nuboso': 'nuboso',
            'Cubierto': 'cubierto'
        };

        return `../../assets/videos/${switcher[this.getWeatherStatus()]}.mp4`;
    }

    private getWeatherStatus(): string {
        const status = this.getAttribute('estadoCielo')
            .find((t) => Number(t.periodo) === new Date().getHours());
        return status && status.descripcion || '';
    }

    private onGetWeather(response: any): void {
        this.hideLoader();
        this.weather = response[0].prediccion;
        this.maxDegrees = this.getTemperature();
        this.weatherStatus = this.getWeatherStatus();
        this.weatherVideo = this.setWeatherVideo();
        this.interval = setInterval(this.setDegrees.bind(this), 80);
    }

    private hideLoader(): void {
        this.loader.dismiss();
    }

    private async showLoader(): void {
        this.loader = await this.LoaderCtr.create({
            message: 'Reuniendo información del tiempo'
        });
        await this.loader.present();
    }

    private setDegrees(): void {
        this.degreesHasReachedMax() ? this.incrementDegrees() : clearInterval(this.interval);
    }

    private degreesHasReachedMax(): boolean {
        return this.degrees < this.maxDegrees;
    }

    private incrementDegrees(): void {
        this.degrees = this.degrees + 1;
    }
}
