import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class CityosService {

  public mappingspaces: Observable<any[]>;
  public mappers: Observable<any[]>;
  public locations: Observable<any[]>;
  public tracking: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase
  ) {
    this.mappingspaces = db.list('mappingspaces').valueChanges();
    this.mappers = db.list('mappers').valueChanges();
    this.locations = db.list('locations').valueChanges();
    this.tracking = db.list('tracking').valueChanges();
  }

  getMappingSpace(space: string): Observable<any> {
    return this.db.object('mappingspaces/' + space).valueChanges();
  }

  getLocations(space: number): Observable<any[]> {
    return this.db.list('locations', ref => ref.orderByChild('mapping_space').equalTo(space)).valueChanges();
  }

  getLocation(locationId: number): Observable<any[]> {
    return this.db.list('locations', ref => ref.orderByChild('id').equalTo(locationId)).valueChanges();
  }

  getMapper(name: string): Observable<any[]> {
    return this.db.list('mappers', ref => ref.orderByChild('user').equalTo(name)).valueChanges();
  }

  getTrackingSession(space: number, session: number, user?: string): Observable<any> {
    return this.db.object('tracking/' + session + '/' + space + (user != null ? '/' + user : '')).valueChanges();
  }

  getStats() {

  }
}
