import {Component} from '@angular/core';
import {WeatherService} from '../../services/weather.service';

import {LoadingController} from '@ionic/angular';


@Component({
    selector: 'app-diary',
    templateUrl: 'diary.page.html',
    styleUrls: ['diary.page.scss'],
    providers: [WeatherService]
})
export class DiaryPage {

    public degrees = 0;
    public weatherStatus = '';
    public weatherVideo = '../../assets/videos/intro.mp4';

    private maxDegrees = 32;
    private interval = null;
    private weather: any = {};
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

    private getAttribute(attribute: string): any {
        return this.weather
            && this.weather.dia
            && this.weather.dia
                .find((day: any) => day.fecha === this.getTodayFullDate())[attribute]
                .flat() || [];
    }


    public getAllHours(): any {
        // return this.weather
        //             && this.weather.dia
        //             && (this.weather.dia
        //                 .map((day: any) => [day.estadoCielo
        //                     .map((e: any) => Object.assign(e, {
        //                         value: day.temperatura
        //                             .find((t: any) => t.periodo === e.periodo).value
        //                     }))]
        //                     .flat()) as any)
        //                 .flat();
        return []
    }

    private onGetWeather(response: any) {
        this.hideLoader();
        this.weather = response[0].prediccion;
    }

    private hideLoader(): void {
        this.loader.dismiss();
    }

    private async showLoader() {
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
