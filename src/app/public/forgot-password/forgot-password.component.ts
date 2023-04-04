import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidatorsService } from '../../core/services/custom-validators.service';
import { Router } from '@angular/router';
import { ShowMessageService } from '../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  @Output() login = new EventEmitter();
  @Input() request:any;

  op=0;
  reset=false; 
  form: FormGroup =<FormGroup>{};
  formReset: FormGroup =<FormGroup>{};
  loading=false;

  resolveReCapcha = false;
  siteKey:string = environment.recaptcha.siteKey;
  

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private validator: CustomValidatorsService,
    private router: Router,
    private showMessage: ShowMessageService,
    private translate: TranslateService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.reset = this.request.reset;
    
  }

  forgot(){
    if(!this.initReCapcha){
      this.showMessage.show('error', this.translate.instant('attention'),  this.translate.instant('debe_verificar_la_captcha'), 'pi pi-exclamation-triangle');
      return;
    }else if(!this.resolveReCapcha){
      this.showMessage.show('error', this.translate.instant('attention'),this.translate.instant('captcha_invalida'), 'pi pi-exclamation-triangle');
      return;
    }
    this.validateForm();
    if(this.form.valid){
      this.loading = true;
      this.form.get('email')?.disable();
      this.apiService.getResponse('POST', 'users/password/reset/', this.form.value)
      .then( resp =>{
        this.form.get('email')?.enable();
        this.loading = false;
        this.op=1;
      }, error => {
        this.loading = false;
        this.form.get('email')?.enable();
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
        })
    }else
      this.validateForm();
  }

  resetPassword(){
    this.validateFormReset();
    if(this.formReset.valid){
      this.loading = true;
      this.apiService.getResponse('POST', `users/password/reset/done/${this.request.data}/`, this.formReset.value)
      .then( resp =>{
        this.loading = false;
        this.op=3;
        setTimeout(() => {
          this.reset = false;
          this.op=0;          
          this.goLogin();
        }, 5000);
      }, error =>{
        this.loading = false;
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
      })
    }else
      this.validateFormReset();
  }

  goLogin(){
    this.login.emit(0);
  }

  createForm(){
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]]
    });
    
    this.formReset = this.formBuilder.group({
      password: ['', [
        Validators.required,
        CustomValidatorsService.patternValidator(/\d/, { hasNumber: true }),
        CustomValidatorsService.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidatorsService.patternValidator(/[a-z]/, { hasSmallCase: true }),
        CustomValidatorsService.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,{hasSpecialCharacters: true}),
        Validators.minLength(8)
      ]],
      password_confirmation: ['', Validators.required]
    }, {
      validators: this.validator.validateEquals('password','password_confirmation')
    })
  }

  validateForm(){
    return Object.values( this.formReset.controls ).forEach( control => { 
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

  validateFormReset(){
    return Object.values( this.formReset.controls ).forEach( control => { 
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsTouched() );
      } else {
        control.markAsTouched();
      }
    });
  }

  get fR(){
      return this.formReset.controls;
  }

  showResponse(ev:any){
    // console.log('ev', ev)

  }
  initReCapcha:boolean= false;
  resolved(captchaResponse:string){
    this.initReCapcha = true;
    this.resolveReCapcha = false;
    if(captchaResponse ){
      this.resolveReCapcha = true;
    }else{
      this.resolveReCapcha = false;
    }
  }
}
