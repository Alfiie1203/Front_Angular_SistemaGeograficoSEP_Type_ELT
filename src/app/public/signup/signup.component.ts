import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidatorsService } from 'src/app/core/services/custom-validators.service';
import { ApiService } from '../../core/services/api.service';
import { Country } from '../../core/interfaces/cities';
import { ShowMessageService } from '../../core/services/show-message.service';
import { StorageService } from '../../core/services/storage.service';
import { User } from '../../core/interfaces/one-drive';
import { Router } from '@angular/router';

export interface City{
  name: string;
  code: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  
  @Input() dataRegister:any; 


  selectedCountry: any = '';
  selectedCountry2: any = '';
  listCountry!: Country[];
  selectedPhone: any;
  form: FormGroup = <FormGroup>{};
  loading=false;

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private validator: CustomValidatorsService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private storageService: StorageService,
    private router: Router,
    private el: ElementRef
  ) {
    this.createForm();

   }

  ngOnInit(): void {
    this.getListCountry();
    this.findRegister();
  }

  ngAfterViewInit() {
    this.el.nativeElement.querySelector('#phone').addEventListener('keypress', function (evt: any) {
      if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)          
        evt.preventDefault();
    });
    
  }

  findRegister(){
    if(this.dataRegister){
      this.form.controls['business'].clearValidators();
      this.form.controls['business'].disable();
      this.form.controls['name_company'].disable();
      this.form.controls['name_company'].clearValidators();
      this.form.controls['name_company'].updateValueAndValidity();
      this.form.controls['business'].updateValueAndValidity();
      this.form.controls['id_company'].setValue(this.dataRegister.company);
      this.form.controls['email'].setValue(this.dataRegister.email);
      this.form.controls['confirm_email'].setValue(this.dataRegister.email);
      this.form.controls['name_company'].setValue(this.dataRegister.name);
      this.form.controls['key'].setValue(this.dataRegister.key);
    }
  }

  register(){
    // this.validateForm();
    if(this.dataRegister){
      if(this.form.valid){
        this.loading = true;
        this.form.controls['country'].setValue(this.form.controls['listCountry'].value.id)
        this.apiService.getResponse('POST', 'formulario/usercreate/', this.form.value)
        .then( resp =>{
            this.login();
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
        }else{
      this.showMessage.show('error', this.translate.instant('attention'), this.translate.instant('no_allowed_action'), 'pi pi-exclamation-triangle');
    }
  }

  createForm(){
    this.form = this.formBuilder.group({
      first_name: ['', Validators.required],
      second_name: [''],
      surname: ['', Validators.required],
      second_surname: [''],
      business: ['', Validators.required],
      country: [''],
      listCountry: ['', Validators.required],
      indicative: [ '' , Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required,  Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      confirm_email: ['', [Validators.required , Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [
        Validators.required,
        CustomValidatorsService.patternValidator(/\d/, { hasNumber: true }),
        CustomValidatorsService.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidatorsService.patternValidator(/[a-z]/, { hasSmallCase: true }),
        CustomValidatorsService.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,{hasSpecialCharacters: true}),
        Validators.minLength(8)
      ]],
      confirm_password: ['', Validators.required],
      id_company: [''],
      key: [''],
      name_company: ['', Validators.requiredTrue],
      terms: [false, Validators.requiredTrue],
      politics: [false, Validators.requiredTrue]
    }, {
      validators: [
        this.validator.validateEquals('email','confirm_email'), 
        this.validator.validateEquals('password','confirm_password')
      ]
    })
  }

  getListCountry(){
    this.apiService.getResponse('GET','cities/countries/')
    .then( (resp:any[]) =>{
      this.listCountry = resp;
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  setIndicative(){
    this.form.controls['indicative'].setValue(`+${this.form.value.listCountry.phone}`)
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

  login(){
    // this.validateForm();
    // if(this.form.valid){
      const sendData = {
        email: this.form.controls['email'].value,
        password: this.form.controls['password'].value
      }
      // localStorage.removeItem('time_sesion');
      localStorage.setItem('lang', JSON.stringify({name:'assets/images/esp.png', code: 'es'}))
      this.loading = true;
      this.apiService.getResponse('POST', 'token/', sendData)
      .then( resp =>{
          this.storageService.storage('dataInfoKey', resp).then((save) =>{
            this.getUserDetail();
          });
        }, error =>{
          this.loading = false;
            if(Array.isArray(error)){
              error.forEach((element:any) => {
                this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
              });
            }
        })
    // }else{
    //   this.validateForm();
    // }
  }

  getUserDetail(){
    this.apiService.getResponse('GET', 'users/me/')
    .then((resp:User)=>{
      this.storageService.storage('keyData', resp);
      this.loading = false;
      this.router.navigateByUrl('/home');
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
