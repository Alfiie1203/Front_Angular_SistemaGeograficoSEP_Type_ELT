import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private api: ApiService, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return  this.getActive();
  }

  getActive() {
    const gaurdActive = localStorage.getItem('dataInfoKey');
    if(gaurdActive == null || gaurdActive == undefined){
      this.router.navigate(['/home-public']);
      return false;
    }else{
      return true;
    }
  }
  
}
