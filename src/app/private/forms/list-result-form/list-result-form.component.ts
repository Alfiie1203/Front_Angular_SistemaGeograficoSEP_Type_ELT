import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from '../../../../environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ViewportScroller } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Form, ListForm } from 'src/app/core/interfaces/form';
import { Rol, User } from 'src/app/core/interfaces/user';
import { ApiService } from 'src/app/core/services/api.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { EventService } from 'src/app/core/services/event.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Subject } from 'rxjs';
import { Period, ListPeriod } from '../../../core/interfaces/form';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, state, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-list-result-form',
  templateUrl: './list-result-form.component.html',
  styleUrls: ['./list-result-form.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListResultFormComponent implements OnInit {
  dataSource = new MatTableDataSource<Form>();
  columnsToDisplay = ['completed','code_form', 'date', 'assigned_company' ,'actions', 'more'];
  expandedElement!: Form;
  selection = new SelectionModel<Form>(true, []);
  selectedRowIndex = -1;
  display=false;
  displayConfirm=false;
  enterprise!:Form;
  formEmail!:FormGroup;
  listData!: ListForm;

  expandStatus=false;
  loading=false;
  pagination=10;
  listSize = 0;
  path=environment.path;
  pageIndex = 0;
  loadData=false;
  filterValue=''
  active=''
  direction=''
  displayAssing=false;
  display2=false;
  display3=false;
  data:any;
  role!: Rol;
  sendData:any;
  displayEmail=false;
  assingDataRoute=false;
  displayColumn=false;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang:any;
  listPeriod:Period[] = []
  listCompany = []
  listAssingCompany = []
  lisCompanyRes:any =[]

  OFFSETV: number = 0;
  textSearch='';
  textSearch$ = new Subject<string>();
  textSearchAssigned='';
  textSearchAssigned$ = new Subject<string>();
  textSearchAssing='';
  textSearchAssing$ = new Subject<string>();
  periodo:any = "";
  periodo$ = new Subject<string>();
  year:any = "";
  year$ = new Subject<string>();
  OFFSET: number = 0;
  pageSize = 10;

  status!: any;
  status$ = new Subject<any>();
  date_assing!: any;
  date_assing$ = new Subject<any>();
  date_close!: any;
  date_close$ = new Subject<any>();
  listState: any[] = [
    { id: 'ACTIVE', name: 'ACTIVE' },
    { id: 'CLOSED', name: 'CLOSED' },
  ];

  listCode:any[]=[];
  
  code_form!: any;
  code_form$ = new Subject<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  form!:FormGroup

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private translate: TranslateService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private storageService: StorageService,
    private readonly viewport: ViewportScroller,
    private fb: FormBuilder
  ) {   
    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
    })
    this.createForm();
    this.createFormSend();
  }
  
  ngOnInit(): void {
    this.getLang();
    this.loadEventService.loadEvent.emit(true);
    this.getPermissions();
    // this.removeAccent();
    this.getListPeriod();
    this.textSearch$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });
    this.textSearchAssigned$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });
    this.textSearchAssing$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });
    this.periodo$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response:any) => {
      this.list()
    });
    this.year$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });
    this.code_form$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });

    this.status$
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response: any) => {
      this.list();
    });
  this.date_assing$
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response: any) => {
      this.list();
    });
  this.date_close$
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response: any) => {
      this.list();
    });
    // this.list();
  }
  
  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  
  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe((resp)=>{
      if(resp.direction==''){
        this.active='',
        this.direction=''
      }else{
        this.active = resp.active;
        this.direction = resp.direction;
      }
      this.list();
    })
  }
  
  getCompanies(){
    this.apiService.getResponse('GET',`formulario/listcompanies/?proforestform=${this.data.id}`)
    .then( (res:any) =>{
      this.listCompany = res.list_companies;
      this.form.get('assigned_company')?.setValue(res.list_selected_companies);
      this.display2 = true;
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }
  
  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.role = resp.role!;
      if(this.role.name=='COLABORADOR'){
        // this.displayColumn=true;
        this.columnsToDisplay = ['completed','code_form', 'date', 'assigned_company', 'allocating_company' ,'actions', 'more'];
      }

      this.permissionAdd = resp.permissions.indexOf( "proforestform.add_proforestform") > -1; 
      this.permissionChange = resp.permissions.indexOf("proforestform.change_proforestform") > -1; 
      this.permissionDelete = resp.permissions.indexOf("proforestform.delete_proforestform") > -1; 
      this.permissionView = resp.permissions.indexOf("proforestform.view_proforestform") > -1; 
      this.list();
    })
  }
  
  // list(){
  //   this.listSize = 0;
  //   this.pageIndex = 0;
  //   this.loadEventService.loadTableEvent.emit(true);
  //   this.apiService.getResponse('GET',`formulario/list/assigned/detail/?limit=${this.pageSize}&offset=${this.OFFSET}&year=${this.year}&period_id=${(this.periodo && this.periodo.id)?this.periodo.id:''}&company_assigned_name=${this.textSearch?this.textSearch:''}`)
  //   .then( (resp:ListForm) =>{
  //     this.listData = resp;
  //     this.listSize  = resp.count;
  //     this.dataSource = new MatTableDataSource<Form>(this.listData.results);
  //     this.listTreatment();
  //     this.loadEventService.loadTableEvent.emit(false);
  //     this.loadEventService.loadEvent.emit(false);
  //   }, error =>{
  //     this.loadEventService.loadTableEvent.emit(false);
  //     this.loadEventService.loadEvent.emit(false);
  //     if(Array.isArray(error)){
  //       error.forEach((element:any) => {
  //         this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
  //       });
  //     }
  //   })
  // }


  async list() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);
      let fechaFormateadaA = '';
      let fechaFormateadaC = '';
      if(this.date_assing){
        const fecha = new Date(this.date_assing)
        const dia = fecha.getDate();
        const mes = fecha.getMonth() + 1;
        const anio = fecha.getFullYear();
    
        fechaFormateadaA = `${dia}-${mes}-${anio}`;
      }
      if(this.date_close){
        const fechaC = new Date(this.date_close)
        const diaC = fechaC.getDate();
        const mesC = fechaC.getMonth() + 1;
        const anioC = fechaC.getFullYear();
    
        fechaFormateadaC = `${diaC}-${mesC}-${anioC}`;
      }
      let url = `formulario/list/assigned/detail/?limit=${this.pageSize}&offset=${this.OFFSET}&year=${this.year?this.year:''}&period_id=${(this.periodo && this.periodo.id)?this.periodo.id:''}&proforestform_name=${this.textSearch?this.textSearch:''}&company_assigned_name=${this.textSearchAssigned?this.textSearchAssigned:''}&company_allocator_name=${this.textSearchAssing?this.textSearchAssing:''}&status=${(this.status && this.status.id)?this.status.id:''}&date_assing=${this.date_assing?fechaFormateadaA:''}&date_close=${this.date_close?fechaFormateadaC:''}&code_form=${this.code_form?this.code_form.code:''}`
      this.apiService.getResponse('GET', url).then(
        (resp: any) => {
        console.log('resp', resp)
            // this.listData = resp.array;
            // this.listSize = resp.array.length;period
            // this.dataSource = new MatTableDataSource<any>(this.listData);
          if (resp && resp.results) {
            this.listData = resp;
            this.listCode = resp.list_codes_form;
            this.listSize = resp.count;
            this.dataSource = new MatTableDataSource<any>(this.listData.results);
          }
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        },
        (error) => {
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
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
  }

  
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  
  checked(element:any){
    this.selection.clear();
    this.selection.toggle(element);
    this.selectedRowIndex = element.id;
  }
  
  create(){
    this.router.navigateByUrl('business/create-business');
  }
  
  edit(element:any){
    this.router.navigate(['forms/list-forms/register-forms'], {queryParams: {id: element.id}});
  }
  
  showDelete(element:any){
    this.display = true;
    this.enterprise = element;
  }
  
  delete(){
    this.loading=true;
    this.apiService.getResponse('DELETE', `company/company/destroy/${this.enterprise.id}/`)
    .then(()=>{
      this.list()
      this.loading=false;
      this.display = false;
      this.showAccept();
    }, error =>{
      this.loading = false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }
  
  paginationChangeSize(e: PageEvent) {
    let offset = e.pageIndex * this.pageSize;
    if (offset >= this.listSize) {
      return;
    }
    this.OFFSET = offset;
    this.pageSize = e.pageSize;
    this.list();
  }

  
  toAssing(data:any){
    this.data=undefined;
    this.data = data;
    this.getCompanies();
  }
  
  cancelAssing(){
    this.display2=false;
    // this.listCompany = [];
    this.form.get('assigned_company')?.setValue('');
  }
  
  assignedCompany(){
    this.validateForm();
    if(this.form.valid){
      this.loading = true;
      this.assingData();
      this.apiService.getResponse('POST', `formulario/asign/`, this.sendData)
      .then(()=>{
        this.loading = false;
        this.display2=false;
        this.displayAssing=true;
        this.list();
        this.form.get('assigned_company')?.setValue('');
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
  
  assingData(){
    this.sendData = {
      proforestform: this.data.id,
      assigned_companies : this.form.get('assigned_company')!.value
    }
  
    // this.sendData.assigned_companies.push();
  }
  
  addCompany(){
    this.form.get('assigned_company')?.value;
  }
  
  suplyBase(ev:Event, pos:number){
    const chk = (<HTMLInputElement>ev.target).checked;
    this.form.get('assigned_company')!.value[pos].supply_base = chk;
  }
  
  createForm(){
    this.form = this.fb.group({
      assigned_company: ['', Validators.required]
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
  
  showAccept(){
    this.displayConfirm=true;
  }
  
  listTreatment(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.dataSource.sortingDataAccessor = (row:Form,columnName:string) : string => {
    //   if(columnName=="type_actor") return row.actor_type.name;
    //   var columnValue = row[columnName as keyof Form] as string;
    //   return columnValue;
    // }
    // this.removeAccent();
    // this.filterObject();
  }
  
  expand(element:any){
    this.expandedElement = this.expandedElement === element ? null : element;
  }
  
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
    this.selection.clear() :
    this.dataSource.data.forEach(row => this.selection.select(row));
  }
  
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
  

  
  filterObject(){
  /*   this.dataSource.filterPredicate = (data:Form, filter) => {
      return data.name.toLocaleLowerCase().includes(filter) ||
        data.nit.toLocaleLowerCase().includes(filter) || 
        data.identifier_global_company.toLocaleLowerCase().includes(filter) || 
        data.identifier_proforest_company.toLocaleLowerCase().includes(filter) || 
        // data.commodity.name?[this.lang.code].toLocaleLowerCase().includes(filter) || 
        data.company_group.name.toLocaleLowerCase().includes(filter) || 
        data.country.name.toLocaleLowerCase().includes(filter) || 
        data.region.name.toLocaleLowerCase().includes(filter) || 
        data.city.name.toLocaleLowerCase().includes(filter) //|| 
        // data.actor_type.name!.toLocaleLowerCase().includes(filter) ;
    }; */
  }
  
  removeAccent(){
    this.dataSource.filterPredicate = (data: Form, filter: string): boolean => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return (currentTerm + (data as { [key: string]: any })[key] + '◬');
      }, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
      const transformedFilter = filter.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
      return dataStr.indexOf(transformedFilter) != -1;
    }
  }
  
  getListSendCompany(){
    this.apiService.getResponse('GET',`formulario/listcompanies/noresponsable/`)
    .then((resp:any)=>{
      this.lisCompanyRes = resp.list_companies;
      this.display2=false;
      this.display3=true;
    }, error =>{
      this.display2=false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }
  
  createFormSend(){
    this.formEmail = this.fb.group({
      company: ['', Validators.required],
      email: ['', [Validators.required,  Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]]
    })
  }
  
  validateFormSend(){
    return Object.values( this.formEmail.controls ).forEach( control => { 
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsTouched() );
      } else {
        control.markAsTouched();
      }
    });
  }
  
  get fS(){
    return this.formEmail.controls;
  }

  clearYear(){
    this.year = "";
    this.year$.next(this.year);
  }

  clear() {
    this.textSearch = '';
    this.year = null;
    this.periodo = null;
    this.textSearch="";
    this.textSearchAssigned="";
    this.textSearchAssing="";
    this.status = undefined;
    this.date_assing = undefined;
    this.date_close = undefined;
    this.code_form = undefined;
    this.list();
  }

  applyFilter(ev:any=null){
    this.textSearch$.next(this.textSearch);
  }
  applyFilterAssingned(ev:any=null){
    this.textSearchAssigned$.next(this.textSearchAssigned);
  }
  applyFilterAssing(ev:any=null){
    this.textSearchAssing$.next(this.textSearchAssing);
  }
  applyFilterPeriod(ev:any=null){
    this.periodo = ev;
    this.periodo$.next(this.periodo);
  }

  applyFilterCode(ev:any=null){
    this.code_form = ev;
    this.code_form$.next(this.code_form);
  }

  applyFilterYear(){
    let year = new Date(this.year).getFullYear();
    this.year = year.toString()
    this.year$.next(this.year);
  }

  getListPeriod(){
    this.apiService.getResponse('GET', `proforestform/periodlist/`)
    .then((resp:ListPeriod)=>{
      this.listPeriod = resp.results;
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
  })
  }

  applyFilterState(ev: any = null) {
    this.status = ev;
    this.status$.next(this.status.id);
  }
  applyFilterYearAssing() {
    this.date_assing$.next(this.date_assing);
  }

  applyFilterYearClose() {
    this.date_close$.next(this.date_close);
  }

}
