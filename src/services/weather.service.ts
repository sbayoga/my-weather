import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZWJhc3RpYW5iYXlvZ2FzcGFyQGdtYWlsLmNvbSIsImp0aSI6ImY1YzZlNjVjLWNlMDQtNGUxMi1hMjU0LTIxY2FjMDllMmFlNiIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNTYzMzU5NTM1LCJ1c2VySWQiOiJmNWM2ZTY1Yy1jZTA0LTRlMTItYTI1NC0yMWNhYzA5ZTJhZTYiLCJyb2xlIjoiIn0.zPb0ddC8slq-047KCDXlXc72L4j5gA_DndzS4sW7aEQ';

@Injectable({
    providedIn: 'root'
})

export class WeatherService {
    private apiURL: string = 'https://opendata.aemet.es/opendata/api/';

    constructor(private httpClient: HttpClient) {
    }

    public async getDailyTownWeather(town: number): Promise<any> {
        const weather: any = await this.httpClient
            .get(`${this.apiURL}prediccion/especifica/municipio/horaria/${town}`, {params: {'api_key': API_KEY}})
            .toPromise()
            .catch(error => Promise.reject(error));
        if (weather.datos) {
            const datos = await this.httpClient.get(weather.datos).toPromise();
            return datos;
        } else {
            Promise.reject('No data');
        }
    }
}