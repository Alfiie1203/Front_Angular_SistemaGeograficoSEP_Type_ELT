import { Injectable } from '@angular/core';
import { decodeBase64, encodeBase64 } from '../helper/convert';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private encryption:EncryptionService
  ) { }
  async storage(storageKey:string, value: any){
    const encryptedValue = encodeBase64(encodeURI(this.encryption.encrypt(JSON.stringify(value))));
    localStorage.setItem(storageKey,encryptedValue);
  }
  async get(storageKey: string){
    const res = await localStorage.getItem(storageKey);
    if(res){
      return JSON.parse(this.encryption.decrypt(decodeURI(decodeBase64(res))));
    } else {
      return false;
    }
  }
}
