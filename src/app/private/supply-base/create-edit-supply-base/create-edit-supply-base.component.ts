import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { User } from 'src/app/core/interfaces/user';
import { EventService } from 'src/app/core/services/event.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';

export interface formI {
  id?: number;
  user_report: any;
  company: any;
  year: number;
  period: any;
}
export function floatNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const floatNumber = { floatNumber: true, "floatNumber.text":"Formato incorrecto" };
    const maxPercent = { maxPercent: true, "maxPercent.text":"El valor no puede ser mayor a 100" };
    const floatValues = /([0-9]*[.])?[0-9]+/;
    if (value.match(floatValues) && !isNaN(value)) {
      let f = value.split('.');
      if (f.length == 2) {
        if (f[1] == '') {
          return floatNumber;
        }
      }
      /* if (value > 100) {
        return  maxPercent;
      } */
      if (value < 0) {
        return  floatNumber;
      }
    } else {
      return floatNumber;
    }
    return null;
  };
}

@Component({
  selector: 'app-create-edit-supply-base',
  templateUrl: './create-edit-supply-base.component.html',
  styleUrls: ['./create-edit-supply-base.component.scss'],
})
export class CreateEditSupplyBaseComponent implements OnInit {
  empresaActiveReport: any = null;
  empresasListReport: Array<any> = [];
  result: any;
  dependenciesData: Array<any> = [];
  actorTypeData: Array<any> = [];

  emailUser: string = '';
  lang: any;
  role:any;

  SCENARIO: any = null;
  validateCompany: boolean = false;
  validateButtonSave: boolean = false;
  validateUnique: boolean = false;
  permissionAdd: boolean = true;
  form: FormGroup = <FormGroup>{};
  listPeriod: any[] = [
    {
      id: 0,
      name: 'ANNUAL',
    },
    {
      id: 1,
      name: 'BIANNUAL_1',
    },
    {
      id: 2,
      name: 'BIANNUAL_2',
    },
  ];
  dataForm: any = {
    id: {
      active: false,
      data: ['', [Validators.required]],
    },
    user_report: {
      active: true,
      data: ['', [Validators.required]],
    },
    company: {
      active: true,
      data: ['', [Validators.required]],
    },
    company_id: {
      active: true,
      data: ['', [Validators.required]],
    },
    year: {
      active: true,
      data: ['', [Validators.required]],
    },
    year_data: {
      active: true,
      data: ['', [Validators.required]],
    },
    period: {
      active: true,
      data: ['', [Validators.required]],
    },
    purchased_volume: {
      active: true,
      data: ['', [Validators.required, floatNumberValidator()]],
    },
  };
  constructor(
    public location: Location,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private storageService: StorageService,
    private loadEventService: EventService,
    private showMessage: ShowMessageService,
    private translate: TranslateService
  ) {
    this.getDataUser()
    this.getLang();
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
    this.route.data.subscribe((data) => {
      this.SCENARIO = data['scenario'];
      if (this.SCENARIO == 'create') {
        this.createForm();
      } else {
        this.loadDataForm();
      }
    });
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  async loadDataForm() {
    const [created_by, company] = await Promise.all([4, 5]);
    /* console.log('created_by:', created_by);
    console.log('company:', company); */
    await this.getDataUser() 
    this.createForm();
  }

  ngOnInit(): void {}
  async formBuild() {
    await this.getDataUser();
    let activeForm: any = {};
    this.dataForm.id.active =
      this.SCENARIO && this.SCENARIO == 'update' ? true : false;
    this.dataForm.user_report.data[0] = this.emailUser;

    for (let input in this.dataForm) {
      if (this.dataForm[input].active) {
        activeForm[input] = this.dataForm[input].data;
      }
    }
    return activeForm;
  }
  async createForm() {
    await this.getDataUser()
    let data = await this.formBuild();
    this.form = this.formBuilder.group(data);
    let url = ``;
    if(this.role.name == "COLABORADOR"){
      url = `company/company/search/detail/?name=`;
    }else{
      url = `company/company/search/detail/?name=`;
      //userCompany
      this.empresasListReport = [this.userCompany];
      // console.log("empresasListReport:",this.empresasListReport);
      this.setFormResultReport(this.userCompany);
    }
    if (this.dataForm.company.active && this.role.name == "COLABORADOR")
      this.form
        .get('company')
        ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((response) => {
          // console.log("8000 response:",response);
          this.apiService
            .getResponse(
              'GET',
              `${url}${response}`
            )
            .then((resp: any) => {
              
              if (resp && resp.results && resp.results instanceof Array) {
                this.empresasListReport = resp.results;
                let find = this.empresasListReport.find(
                  (x) => x?.name === response
                );
                // console.log("8000 data:",find);
                this.setFormResultReport(find);
              } else {
                this.empresasListReport = [];
              }
            });
        });
    if (this.dataForm.year.active)
      this.form
        .get('year')
        ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((response) => {
          try {
            let year: any = new Date(response).getFullYear();
            if (year && year != 1969) {
              this.form.patchValue({
                year_data: year,
              });
            } else {
              this.form.patchValue({
                year_data: '',
              });
            }
          } catch (error) {
            this.form.patchValue({
              year_data: '',
            });
          }
          this.activeButtonSave();
        });
    if (this.dataForm.period.active)
      this.form
        .get('period')
        ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((response) => {
          this.activeButtonSave();
        });
  }

  actorTypeKeyUp(event: any, id: number) {
    //[(ngModel)]="actorTypeData[i].percentage"
    // console.log("event:",event.target);
    this.actorTypeData.forEach((item) => {
      if (item.id == id) {
        item.touched = true;
        let val = event.target.value.replace("%","");
        // console.log("Value:",val);
        if (val == '') {
          item.percentage = '';
          item.error = 'Este campo es obligatorio';
          return;
        } else {
          item.error = '';
        }
        var floatValues = /[+-]?([0-9]*[.])?[0-9]+/;
        if (val.match(floatValues) && !isNaN(val)) {
          let f = val.split('.');
          if (f.length == 2) {
            //val = f[0];
            if (f[1] == '') {
              //val = f[0] + '.';
              item.error = 'Formato incorrecto';
            } else {
              //val = f.join('.');
              item.error = '';
            }
          }
          if (val > 100) {
            item.error = 'El valor no debe ser mayor a 100';
          }
          if (val < 0) {
            item.error = 'El valor no debe negativo';
          }
          item.percentage = val;
        } else {
          //item.percentage = '';
          item.error = 'Formato incorrecto';
        }
      }
    });
    
  }
  getDependenciesData(id: number) {
    //supplybase/api/getdependencies/?company_id=3
    const url = `supplybase/api/getdependencies/?company_id=${id}`;
    this.apiService.getResponse('GET', url).then(
      (resp: any) => {
        if (resp && resp.results) {
          this.dependenciesData = resp.results;
          
          this.actorTypeData = [];
          this.dependenciesData.forEach((item: any) => {
            item.actor_type_dependency.forEach((dat: any) => {
              
              let data = {
                id: dat.id,
                percentage: '',
                touched: false,
                error: '',
              };
              this.actorTypeData.push(data);
            });
          });
          //actorTypeData
          this.activeButtonSave();
        } else {
          this.actorTypeData = [];
        }
        /* this.loadSuggestion = false;
            this.listSuggestion = resp.results; */
      },
      (error) => {
        this.loadEventService.loadTableEvent.emit(false);
        this.loadEventService.loadEvent.emit(false);
        this.actorTypeData = [];
        if (Array.isArray(error)) {
          error.forEach((element: any) => {
            this.showMessage.show(
              'error',
              this.translate.instant('attention'),
              element,
              'pi pi-exclamation-triangle'
            );
          });
        }
      }
    );
  }
  async activeButtonSave() {
    let err = 0;
    if (this.dependenciesData && this.dependenciesData.length) {
      this.validateCompany = true;
      
    } else {
      err++;
      this.validateCompany = false;
      
    }
    if (!this.form.value.year || !this.form.value.period) {
      err++;
    }
    if (err == 0) {
      await this.validateUniqueRegister();
      if (!this.validateUnique) {
        this.showMessage.show(
          'error',
          this.translate.instant('attention'),
          'Ye se encuentra un registro para estos parametros',
          'pi pi-exclamation-triangle'
        );
      }
      this.validateButtonSave = this.validateUnique;
    } else {
      this.validateButtonSave = false;
    }
  }
  async validateUniqueRegister() {
    const url = `supplybase/api/checkregister/?company_id=${this.empresaActiveReport.id}&register_year=${this.form.value.year_data}&period=${this.form.value.period.id}`;
    await new Promise((resolve) => {
      this.apiService
        .getResponse('GET', url)
        .then(
          (resp: any) => {
            if (resp && resp.exist != undefined) {
              this.validateUnique = !resp.exist;
            } else {
              this.validateUnique = false;
            }
          },
          (error) => {
            this.loadEventService.loadTableEvent.emit(false);
            this.loadEventService.loadEvent.emit(false);
            this.validateUnique = false;
            resolve(this.validateUnique);
            if (Array.isArray(error)) {
              error.forEach((element: any) => {
                this.showMessage.show(
                  'error',
                  this.translate.instant('attention'),
                  element,
                  'pi pi-exclamation-triangle'
                );
              });
            }
          }
        )
        .finally(() => {
          resolve(this.validateUnique);
        });
    });
  }

  setFormResultReport(find: any) {
    if (find) {
      this.empresaActiveReport = find;
      this.form.patchValue({
        company: this.empresaActiveReport.name,
        company_id: this.empresaActiveReport.id,
      });
      this.getDependenciesData(this.empresaActiveReport.id);
    } else {
      
      this.empresaActiveReport = null;
      this.dependenciesData = [];
      this.activeButtonSave();
    }
  }
  setDatalistReport(event: Event) {
   
    if (!this.empresaActiveReport) {
      this.form.patchValue({
        company: '',
        company_id: '',
      });
      
    }
    // console.log("dependenciesData:",this.dependenciesData);
    if(this.dependenciesData.length == 0 && this.form.value.company){
      this.showMessage.show(
        'error',
        this.translate.instant('attention'),
        "No existen registros de dependencia para el tipo de Actor al cual la empresa esta asociada.",
        'pi pi-exclamation-triangle'
      );
    }
    
  }
  get f() {
    return this.form.controls;
  }
  validateForm() {
    return Object.values(this.form.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((control) =>
          control.markAsTouched()
        );
      } else {
        control.markAsTouched();
      }
    });
  }

  validateactorTypeData() {
    let err = 0;
    for (let item of this.actorTypeData) {
      item.touched = true;
      let val = item.percentage;
      if (val == '') {
        item.percentage = '';
        if (!item.error) item.error = 'Este campo es obligatorio';
        err++;
      } else {
        item.error = '';
        var floatValues = /[+-]?([0-9]*[.])?[0-9]+/;
        if (val.match(floatValues) && !isNaN(val)) {
          //let v: string = val;
          let f = val.split('.');
          if (f.length == 2) {
            //val = f[0];
            if (f[1] == '') {
              //val = f[0] + '.0';
              item.error = 'Formato incorrecto';
              err++;
            } else {
              //val = f.join('.');
              item.error = '';
            }
          }
          if (val > 100) {
            item.error = 'El valor no debe ser mayor a 100';
            err++;
          }
          if (val < 0) {
            item.error = 'El valor no debe negativo';
            err++;
          }
          item.percentage = val;
        } else {
          err++;
          //item.percentage = '';
          item.error = 'Formato incorrecto';
        }
      }
    }
    return err;
  }

  async register() {
    let err = this.validateactorTypeData();
    this.validateForm();
    if (this.form.valid && this.validateUnique && err == 0) {
      let actor_type_dependency:any = [];
      let resultPercentage = 0;
      for await(let item of this.actorTypeData){
        let actor_type_dependencyObj ={
          "actor_type": item.id,
          "percentage": item.percentage.trim().replace("+","").replace("%","")
        }
        resultPercentage += parseFloat(item.percentage.trim().replace("+",""));
        actor_type_dependency.push(actor_type_dependencyObj)
      }
      if(resultPercentage != 100){
        this.showMessage.show(
          'error',
          this.translate.instant('attention'),
          "La suma de compras por Tipo de Actor debe ser igual a 100%",
          'pi pi-exclamation-triangle'
        );
        return;
      }
      const data = {
        "company": this.empresaActiveReport.id,
        "register_year": this.form.value.year_data,
        "period": this.form.value.period.id,
        "purchased_volume": this.form.value.purchased_volume.trim().replace("+","").replace("%",""),
        "actor_type_dependency": actor_type_dependency
      };
      //console.log('Sending...', data);
      const url = `supplybase/api/create/`;
      this.apiService
            .getResponse(
              'POST',
              url,data
            )
            .then((resp: any) => {
              
              if(resp && resp.id && resp.register_year){
                this.showMessage.show(
                  'success',
                  this.translate.instant('attention'),
                  (this.SCENARIO == "create")?"Los datos se registraron saisfactoriamente":"Los datos se actualizaron saisfactoriamente",
                  'pi pi-exclamation-triangle'
                );
                this.router.navigate(["/supply-base"]);
              }else{
                // console.log("Response:",resp);
                this.showMessage.show(
                  'error',
                  this.translate.instant('attention'),
                  "Ha ocurrido un error",
                  'pi pi-exclamation-triangle'
                );
              }
              //{"id":12,"register_year":2022,"period":1,"purchased_volume":4.0}
            },(error) => {              
              if (Array.isArray(error)) {
                error.forEach((element: any) => {
                  this.showMessage.show(
                    'error',
                    this.translate.instant('attention'),
                    element,
                    'pi pi-exclamation-triangle'
                  );
                });
              }
            }).finally(()=>{
              this.loadEventService.loadTableEvent.emit(false);
              this.loadEventService.loadEvent.emit(false);
            });
    } else {
      // console.log('Error form...');
    }
  }
  userCompany:any;
  async getDataUser() {
    /* "company.can_assign_validator",
    "company.can_view_validation",
    "company.can_make_a_validation" */
    await this.storageService.get('keyData').then((resp: User) => {
      
      this.emailUser = resp.email;
      this.role = resp.role!;
      //console.log("Rol:",this.role);
      /* this.role = resp.role!;
      this.permissionAdd = resp.permissions.indexOf( "company.can_assign_validator") > -1;
      this.permissionMake = resp.permissions.indexOf( "company.can_make_a_validation") > -1;  */
      //console.log("8000 DATA:",resp);
      if(this.role.name == "CLIENTE"){
        this.userCompany = resp.company;
        //console.log("8000 userCompany:",resp);
        return resp
      }
      return resp
      
    });
  }




  /***********TEST */
  testEmpresasListReport: any[] = [];
  empresaName:any;
  filterCompany(event:any){
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.empresasListReport.length; i++) {
      let country = this.empresasListReport[i];
      if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(country);
      }
    }
    this.testEmpresasListReport = filtered;
  }
  getdata(){
    // console.log("getdata:",this.empresaName);
    if(this.empresaName instanceof Object){
      // console.log("getdata: set",this.empresaName);
    }else{
      // console.log("getdata: set null",this.empresaName);
      this.empresaName = null;
    }
  }
  setEmpresa(data:any){
/*     console.log("Empresa:",data);
    console.log("Empresa name:",this.empresaName); */
    this.result = data;
  }
}
