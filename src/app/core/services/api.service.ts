import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { ShowMessageService } from './show-message.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  pathRoute = environment.path;
  lang:any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
  ) {

   }

  private getHeader(){
    const exist = localStorage.getItem('dataInfo');
    return new Promise(async (resolve, reject) =>{
      this.getLang();
      let getToken:any;
      await this.storageService.get('dataInfoKey').then(key => getToken = key);
      if(getToken){
        const accessToken = getToken.access;
        if(this.lang){
          const headers: HttpHeaders = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`
          })
            .set('Content-Language', this.lang.code)
          resolve(headers);
        }
      }
      resolve(null);
    })
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }


  handleError ( error : any ) {
   // console.log('err', error)
    let errorMessage: any ;
    if ( error.error instanceof ErrorEvent ) {
      errorMessage = `Error : ${ error.error.message }`;
    } else {
      if(error.status == 400){
        errorMessage = [];
        if(error.error!=undefined){
          for(let posErr in error.error.errors){
            errorMessage.push(`${this.translate.instant(error.error.errors[posErr].detail)}`)
          }
        }
      }
      if(error.status == 401){
        if(error.error.errors[0]!=undefined && error.error.errors[0].code!=undefined && error.error.errors[0].code.includes('token_not_valid')){
          this.storageService.get('dataInfoKey').then( (info) =>{
            const tempInfo = info;
            this.refreshToken(info.refresh).then( (refresh) =>{
              tempInfo.access = refresh.access;
              this.storageService.storage('dataInfoKey', tempInfo).then(()=>{
                location.reload();
                return null;
              })
            });
          });
        }else{
          errorMessage = [];
        if(error.error!=undefined){
          for(let posErr in error.error.errors){
            errorMessage.push(`${this.translate.instant(error.error.errors[posErr].detail)}`)
          }
        }
        }
      }
      if(error.status == 403){
        errorMessage = [];
        if(error.error!=undefined){
          for(let posErr in error.error.errors){
            if(error.error.errors[0].code.includes('permission_denied')){
              errorMessage.push(`${this.translate.instant(error.error.errors[posErr].detail)}`);
              this.router.navigate(['/home'])
              // return;
            }
            else
              errorMessage.push(`${this.translate.instant(error.error.errors[posErr].detail)}`)
          }
        }
      }
      if(error.status == 404){
        errorMessage = [];
        if(error.error!=undefined){
          for(let posErr in error.error.errors){
            errorMessage.push(`${this.translate.instant(error.error.errors[posErr].detail)}`)
          }
        }
      }
      if(error.status == 405){
        errorMessage = [];
        if(error.error!=undefined){
          for(let posErr in error.error.errors){
            errorMessage.push(`${this.translate.instant(error.error.errors[posErr].detail)}`)
          }
        }
      }
      if(error.status == 0){
        errorMessage = [];
        errorMessage.push(`${this.translate.instant('not_network')}`)
        // if(error.error!=undefined){
        //   for(let posErr in error.error.errors){
          // }
        // }
      }
      

    }
    // return throwError (() => {
      if(!errorMessage){
        errorMessage = [];
        if(error.statusText)
        errorMessage.push(error.statusText);
        else
        errorMessage.push(this.translate.instant('ocurrió un problema'));
      }
      return errorMessage ;
    // });
  }


  getResponse(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', route:string, data: any = {}):Promise<any>{
    return new Promise((resolve, reject) =>{
      this.getHeader().then((headers) =>{
        const option: any = {
          body: data,
          headers
        };
        this.http.request(method, this.pathRoute+route, option).subscribe({
          next: resp =>{
            resolve(resp); 
          },
          error: error =>{
            reject(this.handleError(error));
          }
        })
      })
    })
  }

  refreshToken(info:any):Promise<any>{
    const data = {
      refresh: info
    }
    return new Promise((resolve, reject) =>{
      this.getHeader().then((headers) =>{
        const option: any = {
          body: data,
          headers,
        };
        this.http.request('POST', `${this.pathRoute}token/refresh/`, option).subscribe({
          next: resp =>{
            resolve(resp); 
          },
          error: error =>{
            reject();
            if(error.error.errors[0]!=undefined && error.error.errors[0].code!=undefined && error.error.errors[0].code.includes('token_not_valid')){
              this.logout();
              this.showMessage.show('error', this.translate.instant('attention'),this.translate.instant('sesion_out'), 'pi pi-exclamation-triangle');
              return;
            }
          }
        })
      })
    })
  }

  logout() {
    // localStorage.removeItem('time_sesion');
    localStorage.clear();
    this.router.navigate(['/home-public'])
    // window.location.reload();
  }


}
