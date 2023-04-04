import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

var CryptoJSAesJson = {
  stringify: function (cipherParams:any) {
      let j:any = {ciphertext: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
      if (cipherParams.iv) j.iv = cipherParams.iv.toString();
      if (cipherParams.salt) j.salt = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(256));
      return JSON.stringify(j);
  },
  parse: function (jsonStr:any) {
      let j = JSON.parse(jsonStr);
      let cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ciphertext)});
      if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
      if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
      return cipherParams;
  }
}
const PASSPHRASE = "E7Q5gvP8Khx3@X93@vwc";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private key: any;
  private iv: any;

  constructor() { 
    this.key = CryptoJS.enc.Hex.parse("5ae1b8a17bad4da4fdac796f64c16ecd");
    this.iv  = CryptoJS.enc.Hex.parse("34643738323135393534316333336664");
  }

  encrypt(plaintext:any){
    let passphrase = PASSPHRASE;
    var salt = CryptoJS.lib.WordArray.random(256);
    var iv = CryptoJS.lib.WordArray.random(16);
    //for more random entropy can use : https://github.com/wwwtyro/cryptico/blob/master/random.js instead CryptoJS random() or another js PRNG
    var key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64/8, iterations: 999 });
    var encrypted = CryptoJS.AES.encrypt(plaintext, key, {iv: iv});
    var data = {
        ciphertext : CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
        salt : CryptoJS.enc.Hex.stringify(salt),
        iv : CryptoJS.enc.Hex.stringify(iv)    
    }
    return JSON.stringify(data);
  }
  decrypt(encrypt:string){
    let obj_json:any = (JSON.parse(encrypt));
    let passphrase = PASSPHRASE;
    let encrypted = obj_json.ciphertext;
    let salt = CryptoJS.enc.Hex.parse(obj_json.salt);
    let iv = CryptoJS.enc.Hex.parse(obj_json.iv);   

    let key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64/8, iterations: 999});


    let decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv});

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
