import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidatorsService } from '../../../core/services/custom-validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { EventService } from '../../../core/services/event.service';
import { Country } from '../../../core/interfaces/cities';
import { ListBusiness, Business } from '../../../core/interfaces/business';
import { User, Rol, RolPermission } from '../../../core/interfaces/user';
import { StorageService } from '../../../core/services/storage.service';


@Component({
  selector: 'app-create-edit-user',
  templateUrl: './create-edit-user.component.html',
  styleUrls: ['./create-edit-user.component.scss']
})
export class CreateEditUserComponent implements OnInit {

  dataSource:MatTableDataSource<string> = new MatTableDataSource();
  columnsToDisplay = ['permission'];
  expandedElement!: string;
  selection = new SelectionModel<string>(true, []);
  selectedRowIndex = -1;
  countries:any;
  select:any;
  position:any
  form: FormGroup = <FormGroup>{};
  displayConfirm = false;
  selectedCountry: any = '';
  selectedCountry2: any = '';
  selectedPhone: any;
  state=true;
  listCountry!: Country[];
  allBusiness!: Business[];
  dataUser: User = <User>{};
  listRol!: Rol[];
  listPermission!: string[];
  displayBusiness=true;
  updateData=false;
  userData!:User;
  loading=false;
  activeState = false;
  

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  

  constructor(
    public location: Location,
    private formBuilder: FormBuilder,
    private router: Router,
    private validator: CustomValidatorsService,
    private translate: TranslateService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private storageService: StorageService,
    private el: ElementRef,
    private aR: ActivatedRoute
    ) { 
    this.createForm();
    this.aR.queryParams.subscribe((params:any)=>{
      if(params.id){
        this.getUserUpdate(params.id);
        this.updateData=true;
      }
    })
  }

  ngOnInit(): void {
    this.getListBusiness();
    this.getListCountry();
    this.getListRoles();
    this.getUser();
  }

  ngAfterViewInit() {
    this.el.nativeElement.querySelector('#phone').addEventListener('keypress', function (evt: any) {
      if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)          
        evt.preventDefault();
    });
    
  }

  getUser(){
    this.storageService.get('keyData').then((resp:User)=>{this.dataUser=resp;})
  }

  register(){
    this.validateForm();
    if(this.form.valid){
      this.loading=true;
      if(this.updateData){
        if(this.dataUser.role?.name == 'COLABORADOR' && this.dataUser.groups.name=='SUPERADMINISTRADOR'){
          if(this.userData.role?.name=='COLABORADOR'){
            this.form.get('first_name')?.enable()
            this.form.get('second_name')?.enable()
            this.form.get('surname')?.enable()
            this.form.get('second_surname')?.enable()
            this.form.get('email')?.enable()
            this.form.get('confirm_email')?.enable()
            this.form.get('listBusiness')?.enable()
            this.form.get('password')?.enable()
            this.form.get('confirm_password')?.enable()
          }
  
        }else if(this.dataUser.role?.name == 'COLABORADOR' && this.dataUser.groups.name=='ADMINISTRADOR'){
          if(this.userData.role?.name=='CLIENTE'){
            this.form.get('listRol')?.enable()
          }
          if(this.userData.role?.name=='COLABORADOR'){
            this.form.get('first_name')?.enable()
            this.form.get('second_name')?.enable()
            this.form.get('surname')?.enable()
            this.form.get('second_surname')?.enable()
            this.form.get('email')?.enable()
            this.form.get('confirm_email')?.enable()
            this.form.get('listBusiness')?.enable()
            this.form.get('password')?.enable()
            this.form.get('confirm_password')?.enable()
            this.form.get('listRol')?.enable()
            this.form.get('phone')?.enable()
            this.form.get('status')?.enable()
            this.form.get('listCountry')?.enable()
          }
        }else{
          if(this.userData.role?.name=='CLIENTE'){
            this.form.get('first_name')?.enable()
            this.form.get('second_name')?.enable()
            this.form.get('surname')?.enable()
            this.form.get('second_surname')?.enable()
            this.form.get('email')?.enable()
            this.form.get('confirm_email')?.enable()
            this.form.get('listBusiness')?.enable()
            this.form.get('listRol')?.enable()
            this.form.get('status')?.enable()
            this.form.get('listCountry')?.enable()
          }
        }

        this.form.patchValue({
          role: this.form.value.listRol?this.form.value.listRol.role_id:'',
          groups: this.form.value.listRol?this.form.value.listRol.id:'',
          company: this.form.value.listBusiness!=null?this.form.value.listBusiness.id:'',
          country: this.form.value.listCountry?this.form.value.listCountry.id:''
        });
        const formData = this.createFormData();

        this.apiService.getResponse("PATCH", `users/update/${this.userData.id}/`, formData)
        .then((resp:User)=>{
          this.loading=false;
          this.createForm();
          this.displayConfirm=true;
        }, error =>{
          this.loading=false;
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
        })
      }else{
        this.form.patchValue({
          role: this.form.value.listRol?this.form.value.listRol.role_id:'',
          groups: this.form.value.listRol?this.form.value.listRol.id:'',
          company: this.form.value.listBusiness!=null?this.form.value.listBusiness.id:'',
          country: this.form.value.listCountry?this.form.value.listCountry.id:''
        });
        const formData = this.createFormData();
        this.apiService.getResponse("POST", "users/create/", formData)
        .then((resp:User)=>{
          this.loading=false;
          this.createForm();
          this.displayConfirm=true;
        }, error =>{
          this.loading=false;
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
        })
      }
    }else{
      this.validateForm();
    }    
  }

  getUserUpdate(id:any){
    this.loadEventService.loadEvent.emit(true);
    this.apiService.getResponse('GET', `users/view/${id}/`)
    .then((resp:User)=>{
      this.userData = resp;
      this.form.controls['password'].removeValidators(Validators.required);
      this.form.controls['confirm_password'].removeValidators(Validators.required);
      this.form.controls['password'].updateValueAndValidity();
      this.form.controls['confirm_password'].updateValueAndValidity();
      this.assignData();

      if(this.dataUser.role && this.dataUser.role?.name == 'COLABORADOR' && this.dataUser.groups.name=='SUPERADMINISTRADOR'){
        if(this.userData.role?.name=='COLABORADOR'){
          // this.form.get('first_name')?.disable()
          // this.form.get('second_name')?.disable()
          // this.form.get('surname')?.disable()
          // this.form.get('second_surname')?.disable()
          // this.form.get('email')?.disable()
          // this.form.get('confirm_email')?.disable()
          // this.form.get('listBusiness')?.disable()
          // this.form.get('password')?.disable()
          // this.form.get('confirm_password')?.disable()
        }

      }else if(this.dataUser.role && this.dataUser.role?.name == 'COLABORADOR' && this.dataUser.groups.name=='ADMINISTRADOR'){
        if(this.userData.role?.name=='CLIENTE'){
          this.form.get('listRol')?.disable()
        }
        if(this.userData.role?.name=='COLABORADOR'){
          this.form.get('first_name')?.disable()
          this.form.get('second_name')?.disable()
          this.form.get('surname')?.disable()
          this.form.get('second_surname')?.disable()
          this.form.get('email')?.disable()
          this.form.get('confirm_email')?.disable()
          this.form.get('listBusiness')?.disable()
          this.form.get('password')?.disable()
          this.form.get('confirm_password')?.disable()
          this.form.get('listRol')?.disable()
          this.form.get('phone')?.disable()
          this.form.get('status')?.disable()
          this.form.get('listCountry')?.disable()
        }
      }else{
        if(this.dataUser.role && this.userData.role?.name=='CLIENTE'){
          this.form.get('first_name')?.disable()
          this.form.get('second_name')?.disable()
          this.form.get('surname')?.disable()
          this.form.get('second_surname')?.disable()
          this.form.get('email')?.disable()
          this.form.get('confirm_email')?.disable()
          this.form.get('listBusiness')?.disable()
          this.form.get('listRol')?.disable()
          this.form.get('status')?.disable()
          this.form.get('listCountry')?.disable()
        }
      }

      
    }, error =>{
      this.loadEventService.loadEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  listUser(){
    this.router.navigateByUrl('/users/list')
  }

  getListRoles(){
    this.apiService.getResponse('GET', 'users/role/api/list/')
    .then((resp:Rol[]) =>{
      this.listRol = resp
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  getPermission(){
    this.showBusiness();
    this.dataSource = new MatTableDataSource();
    this.apiService.getResponse('GET',`users/subrole/permissions/api/list/${this.form.value.listRol.id}/`)
    .then((resp:RolPermission) =>{
      this.listPermission = resp.permissions;
      this.dataSource = new MatTableDataSource<string>(this.listPermission);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;      
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  showBusiness(){
    if(this.form.value.listRol.role_id==1){
      this.displayBusiness = true;
      this.form.controls['listBusiness'].setValidators([Validators.required]);
    }
    if(this.form.value.listRol.role_id==2){
      this.displayBusiness = false;
      this.form.controls['listBusiness'].reset();
      this.form.controls['listBusiness'].clearValidators();

    }
    this.form.controls['listBusiness'].updateValueAndValidity();
  }

  getListBusiness(){
    this.apiService.getResponse('GET','company/company/list-create-user-form/?status=true')
    .then( (resp:ListBusiness) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET',`company/company/list-create-user-form/?limit=${resp.count}&status=true`)
        .then((data:any) => {
          this.allBusiness = data.results.map((item:any) =>{
            return item = {
              id: item.id,
              name: item.name        
            }
          });

        })
      }
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  getListCountry(){
    this.apiService.getResponse('GET','cities/countries/')
    .then( (resp:Country[]) =>{
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

  createForm(){
    this.form = this.formBuilder.group({
      first_name: ['', Validators.required],
      second_name: [''],
      surname: ['', Validators.required],
      second_surname: [''],
      role: [''],
      listRol: ['', Validators.required],
      groups: [''],
      company: [''],
      listBusiness: ['', Validators.required],
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
      status: [true]
    }, {
      validators: [
        this.validator.validateEquals('email','confirm_email'), 
        this.validator.validateEquals('password','confirm_password')
      ]
    })
  }

  createFormData(){
    const formData = new FormData();
    formData.append('first_name', this.form.value.first_name);
    formData.append('second_name', this.form.value.second_name);
    formData.append('surname', this.form.value.surname);
    formData.append('second_surname', this.form.value.second_surname);
    formData.append('role', this.form.value.role);
    formData.append('groups', this.form.value.groups);
    formData.append('company', this.form.value.company);
    formData.append('country', this.form.value.country);
    formData.append('indicative', this.form.value.indicative);
    formData.append('phone', this.form.value.phone);
    formData.append('email', this.form.value.email);
    if(this.form.value.password!='')
      formData.append('password', this.form.value.password);
    formData.append('status', this.form.value.status);
    return formData;
  }

  async assignData(){
    this.form.patchValue({
      first_name: this.userData.first_name,
      second_name: this.userData.second_name,
      surname: this.userData.surname,
      second_surname: this.userData.second_surname,
      role: this.userData.role?.id,
      listRol: {
        id: this.userData.groups?.id,
        name: this.userData.groups?.name,
        role_id: this.userData.role?.id
      },
      groups: this.userData.groups.id,
      company: this.userData.company?.id,
      listBusiness: {
        id: this.userData.company?.id,
        name: this.userData.company?.name
      },
      country: this.userData.country?.id,
      listCountry: this.userData.country,
      indicative: this.userData.indicative,
      phone: this.userData.phone,
      email: this.userData.email,
      confirm_email: this.userData.email,
      status: this.userData.status
    });
    await this.getPermission();
    this.loadEventService.loadEvent.emit(false);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  checked(element:any){
    this.selection.clear();
    this.selection.toggle(element);
    this.selectedRowIndex = element;
  }
 /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: string): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row + 1}`;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

}
