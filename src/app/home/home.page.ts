import {Component} from '@angular/core';
import {WeatherService} from '../../services/weather.service';

import {LoadingController, NavController} from '@ionic/angular';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
    providers: [WeatherService]
})
export class HomePage {

    public degrees = 0;
    public showInfo = false;
    public weatherStatus = '-';
    public town = 28079;
    public weatherVideo = '../../assets/videos/intro.mp4';

    private maxDegrees = 32;
    private interval = null;
    private weather: any = {};
    private weekWeather: any = {};
    private loader = null;
    private fullInfo = false;

    constructor(private WeatherSrv: WeatherService,
                private storage: Storage,
                private navCtrl: NavController,
                private LoaderCtr: LoadingController) {
        this.storage.get('weather').then((weather) => {
            if (weather && JSON.parse(weather).value) {
                this.onGetWeather(JSON.parse(weather).value);
                this.WeatherSrv
                    .getHourTownWeather(this.town)
                    .then(response => this.weekWeather = response[0]!.prediccion!.dia);
            } else {
                this.getInformation();
            }
        });
    }

    public getFooterClasses(): any {
        return {
            'fixed bottom-0 left-0 right-0 bg-white w-100 pt4 z-2 relative animated fadeInUp weather-info': true,
            'deployed': this.fullInfo
        };
    }

    public getInformation(): void {
        this.showLoader();
        this.WeatherSrv
            .getDailyTownWeather(this.town)
            .then(response => this.onGetWeather(response[0]!.prediccion))
            .finally(this.hideLoader.bind(this));
        this.WeatherSrv
            .getHourTownWeather(this.town)
            .then(response => this.weekWeather = response[0]!.prediccion!.dia);
    }
    private getTodayFullDate(): string {
        const props = {year: 'numeric', month: '2-digit', day: 'numeric'};
        return new Date()
            .toLocaleDateString('es-ES', props)
            .split('/')
            .reverse()
            .join('-');
    }

    public displayFullInfo(): void {
        this.fullInfo = !this.fullInfo;
    }

    private getTodayDay(): any {
        return this.weather
            && this.weather.dia
            && this.weather.dia
                .find((day: any) => day.fecha === this.getTodayFullDate()) || {};
    }
    private getAttribute(attribute: string): any[] {
        return this.getTodayDay()[attribute]
                .flat() || [];
    }

    public navigateToAddLocations(): void {
        this.navCtrl.navigateRoot('/diary');
    }

    private getTemperature(): number {
        const temperature = this.getAttribute('temperatura')
            .find((t) => Number(t.periodo) === new Date().getHours());
        return temperature && temperature.value || 0;
    }

    public getDateDay(date: string): any {
        return this.getTodayFullDate() === date ? 'Hoy' : date && new Date(date).getDate() || 0;
    }

    public getFullDate(date: string): any {
        return date && new Date(date).toLocaleDateString();
    }

    public getAllHours(): any {
        return this.weather
            && this.weather.dia
            && (this.weather.dia
                .map((day: any) => [day.estadoCielo
                    .map((e: any) => Object.assign(e, {
                        fecha: day.fecha,
                        value: day.temperatura
                            .find((t: any) => t.periodo === e.periodo).value
                    }))]
                    .flat()) as any)
                .flat();
    }

    private getNightVideoStatus(descripcion): string {
        const switcher = {
            'Despejado': 'night',
            'Poco nuboso': 'night',
            'Intervalos nubosos': 'night_nuboso',
            'Nuboso': 'night_nuboso',
            'Muy nuboso': 'night_nuboso',
            'Cubierto': 'night_nuboso',
            'Nubes altas': 'night_nuboso'
        };
        return switcher[descripcion];
    }

    private getIconForStatus(descripcion: string, hour: string = ''): string {
        const switcher = (night) => {
            return {
                'Despejado': `fas fa-${night && 'moon yellow' || 'sun gold'} `,
                'Poco nuboso': `fas fa-cloud-${night && 'moon' || 'sun'} silver`,
                'Intervalos nubosos': `fas fa-cloud-${night && 'moon' || 'sun'} silver`,
                'Nuboso': `fas fa-cloud mid-gray`,
                'Muy nuboso': `fas fa-cloud dark-gray`,
                'Cubierto': `fas fa-cloud mid-gray`,
                'Nubes altas': `fas fa-cloud mid-gray`,
                'Intervalos nubosos con lluvia escasa': `fas fa-cloud-${night && 'moon' || 'sun'}-rain mid-gray`
            };
        };
        return switcher(this.isNight(hour))[descripcion];
    }

    private getIconForPeriod(interval: { [key: string]: any }[]): string {
        const periodFound = interval.find(period => period.periodo.split('-').some(hour => hour > new Date().getHours()));
        return periodFound && periodFound.descripcion ? this.getIconForStatus(periodFound.descripcion) : 'fas fa-question-circle';
    }

    public doRefresh(): void {
        this.showLoader();
        this.WeatherSrv
            .getDailyTownWeather(28079)
            .then(response => this.onGetWeather(response));
    }

    public getIconForDayStatusWeather(day: any): string {
        return this.getTodayFullDate() === day.fecha
            ? this.getIconForStatus(this.weatherStatus)
            : day.estadoCielo && day.estadoCielo.length > 1
                ? this.getIconForPeriod(day.estadoCielo)
                : this.getIconForStatus(day.estadoCielo[0].descripcion);
    }

    public getMinTemperature(): number {
        let min = 100;
        this.getAttribute('temperatura')
            .map((t) => min = Number(t.value) < min ? Number(t.value) : min);
        return min;
    }

    public getMaxTemperature(): number {
        let max = 0;
        this.getAttribute('temperatura')
            .map((t) => max = Number(t.value) > max ? Number(t.value) : max);
        return max;
    }

    public getDate(): any {
        return ('0' + new Date().getHours()).slice(-2) + ':' + ('0' + new Date().getMinutes()).slice(-2);
    }
    private setWeatherVideo(): string {
        const switcher = {
            'Despejado': 'despejado',
            'Poco nuboso': 'nuboso',
            'Nuboso': 'nuboso',
            'Muy nuboso': 'muy_nuboso',
            'Cubierto': 'cubierto',
            'Nubes altas': 'altas'
        };

        return `../../assets/videos/${this.isNight() ? this.getNightVideoStatus(this.getWeatherStatus()) : switcher[this.getWeatherStatus()]}.mp4`;
    }

    private isNight(hour: string = ''): boolean {
        return this.weather
            && (hour || new Date().getHours()) > this.getTodayDay().ocaso.split(':')[0]
            || (hour || new Date().getHours()) < this.getTodayDay().orto.split(':')[0];
    }
    private getWeatherStatus(): string {
        const status = this.getAttribute('estadoCielo')
            .find((t) => Number(t.periodo) === new Date().getHours());
        return status && status.descripcion || '';
    }

    private onGetWeather(weather) {
        this.storage.clear().then(() => {
            this.storage.set('weather', JSON.stringify({
                value: weather,
                timestamp: new Date().getMilliseconds()
            })).then(() => {
                this.maxDegrees = this.degrees = 0;
                this.showInfo = true;
                this.weather = weather;
                this.maxDegrees = this.getTemperature();
                this.weatherStatus = this.getWeatherStatus();
                this.weatherVideo = this.setWeatherVideo();
                this.interval = setInterval(this.setDegrees.bind(this), 80);
            });
        });
    }

    private hideLoader(): void {
        this.loader.dismiss();
    }

    private async showLoader() {
        this.loader = await this.LoaderCtr.create({
            message: 'Reuniendo información del tiempo'
        });
        this.loader.present();
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
