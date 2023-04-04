import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {
  constructor(private router: Router) {
    
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    

    return this.getActive();
  }

  getActive() {
    const gaurdActive = localStorage.getItem('dataInfoKey');
    if(gaurdActive == null || gaurdActive == undefined){
      return true;
    }else{
      this.router.navigate(['/home']);
      return false;
    }
  }
  
}
