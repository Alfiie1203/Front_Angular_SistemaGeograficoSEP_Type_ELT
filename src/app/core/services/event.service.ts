import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  loadEvent = new EventEmitter();
  loadTableEvent = new EventEmitter();
  loadLanguage = new EventEmitter();
  loadData = new EventEmitter();

  constructor() { }
}
