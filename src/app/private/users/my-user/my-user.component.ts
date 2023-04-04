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
  selector: 'app-my-user',
  templateUrl: './my-user.component.html',
  styleUrls: ['./my-user.component.scss']
})
export class MyUserComponent implements OnInit {


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
  }

  ngOnInit(): void {
    this.getListCountry();
    this.getUser();
  }

  ngAfterViewInit() {
    this.el.nativeElement.querySelector('#phone').addEventListener('keypress', function (evt: any) {
      if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)          
        evt.preventDefault();
    });
    
  }

  getUser(){
    this.loadEventService.loadEvent.emit(true);
    this.storageService.get('keyData').then((resp:User)=>{
      // console.log('this.dataUser', resp)
      this.dataUser=resp;
      if(this.dataUser.role && this.dataUser.role?.name == 'COLABORADOR'){
        if(this.dataUser.groups.name=='VERIFICADOR' || this.dataUser.groups.name=='VALIDADOR'){
          this.form.get('email')?.disable()
          this.form.get('confirm_email')?.disable()
        }
      }
      this.form.controls['password'].removeValidators(Validators.required);
      this.form.controls['confirm_password'].removeValidators(Validators.required);
      this.form.controls['password'].updateValueAndValidity();
      this.form.controls['confirm_password'].updateValueAndValidity();
      this.assignData();
    })
  }

  register(){
    this.validateForm();
    if(this.form.valid){
      this.loading=true;
      this.form.patchValue({
        country: this.form.value.listCountry?this.form.value.listCountry.id:''
      });
      if(this.dataUser.role && this.dataUser.role?.name == 'COLABORADOR'){
        if(this.dataUser.groups.name=='VERIFICADOR' || this.dataUser.groups.name=='VALIDADOR'){
          this.form.get('email')?.enable()
          this.form.get('confirm_email')?.enable()
        }
      }
      const formData = this.createFormData();

      this.apiService.getResponse("PATCH", `users/update/${this.dataUser.id}/`, formData)
      .then((resp:any)=>{
        this.apiService.getResponse('GET', `users/view/${this.dataUser.id}/`)
        .then(async (resp:User)=>{
          await this.storageService.storage('keyData', resp);
          this.loading=false;
          this.displayConfirm=true;
        });
      }, error =>{
        this.loading=false;
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


  listUser(){
    this.router.navigateByUrl('/users/list')
  }


  getPermission(){
    if(this.dataUser.role && this.dataUser.role.id){
      this.dataSource = new MatTableDataSource();
      this.apiService.getResponse('GET',`users/subrole/permissions/api/list/${this.dataUser.groups.id}/`)
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
      first_name: this.dataUser.first_name,
      second_name: this.dataUser.second_name,
      surname: this.dataUser.surname,
      second_surname: this.dataUser.second_surname,
      country: this.dataUser.country?.id,
      listCountry: this.dataUser.country,
      indicative: this.dataUser.indicative,
      phone: this.dataUser.phone,
      email: this.dataUser.email,
      confirm_email: this.dataUser.email,
      status: this.dataUser.status
    });
    // await this.getPermission();
    // this.form.disable();
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

  cancel(){
    // this.updateData=false;
    this.getUser();
  }
}
