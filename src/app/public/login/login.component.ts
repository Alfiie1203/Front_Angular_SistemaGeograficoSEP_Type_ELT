import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';
import { Router } from '@angular/router';
import { ShowMessageService } from '../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../core/interfaces/user';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() forgotPassword = new EventEmitter(); 

  form: FormGroup = <FormGroup>{};
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private eventService: EventService
  ) {
    this.createForm();
  }
  
  ngOnInit(): void {
  }

  login(){
    this.validateForm();
    if(this.form.valid){
      // localStorage.removeItem('time_sesion');
      // localStorage.setItem('lang', JSON.stringify({name:'assets/images/esp.png', code: 'es'}))
      this.loading = true;
      this.apiService.getResponse('POST', 'token/', this.form.value)
      .then( resp =>{
          this.storageService.storage('dataInfoKey', resp).then((save) =>{
            // setTimeout(() => {
              this.router.navigate(['/home']);
              this.loading = false;
            // }, 5000);
            // this.getUserDetail();
          });
        }, error =>{
          this.loading = false;
            if(Array.isArray(error)){
              error.forEach((element:any) => {
                this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
              });
            }
        })
    }else{
      this.validateForm();
    }
  }
  
  forgot(){
    this.forgotPassword.emit(2);
  }


  createForm(){
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required]]
    })
  }

  validateForm(){
    return Object.values( this.form.controls ).forEach( control => { 
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsTouched() );
      } else {
        control.markAsTouched();
      }
    });
  }

  get f(){
    return this.form.controls;
  }

  getUserDetail(){
    this.apiService.getResponse('GET', 'users/me/')
    .then((resp:User)=>{
      this.storageService.storage('keyData', resp);
      this.loading = false;
      this.eventService.loadData.emit();
      // localStorage.setItem('time_sesion', '0');
    }, error =>{
      this.loading = false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }


}
