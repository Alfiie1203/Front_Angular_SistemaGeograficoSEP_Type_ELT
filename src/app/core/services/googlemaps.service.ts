import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, Observable } from 'rxjs';
import { GeocoderResponse } from '../interfaces/maps';
import { GeocoderAddress, Goecode } from '../interfaces/cities';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GooglemapsService {

  status!: string;
  error_message!: string;
  results!: google.maps.GeocoderResult[];
  keyMaps = environment.keyMap

  constructor(
    private httpClient: HttpClient
  ) {
    
   }


  geocodeLatLng(location: google.maps.LatLngLiteral): Promise<GeocoderResponse> {
    let geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ 'location': location }, (results, status) => {
        const response = new GeocoderResponse(status, results!);
        resolve(response);
      });
    });
  }

  getLocation(position: any): Observable<Goecode> {
    const url = `https://maps.google.com/maps/api/geocode/json?latlng=${position.lat},${position.lng}&key=${this.keyMaps}`;
    return this.httpClient.get<Goecode>(url);
  }

  getLocationAddress(term: string): Observable<GeocoderAddress> {
    const url = `https://maps.google.com/maps/api/geocode/json?address=${term}&sensor=false&key=${this.keyMaps}`;
    return this.httpClient.get<GeocoderAddress>(url);
  }

}
