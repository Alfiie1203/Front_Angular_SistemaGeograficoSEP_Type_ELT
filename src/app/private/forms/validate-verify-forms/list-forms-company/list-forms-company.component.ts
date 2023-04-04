import { Component, OnInit, ViewChild } from '@angular/core';
import { Form, FormCompany, ListForm, ListFormCompany, ListVerifyValidate } from '../../../../core/interfaces/form';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from '../../../../../environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';
import { ShowMessageService } from '../../../../core/services/show-message.service';
import { EventService } from '../../../../core/services/event.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Location, ViewportScroller } from '@angular/common';
import { User, Rol } from '../../../../core/interfaces/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Commodity, ActorType, ListCommodity } from '../../../../core/interfaces/business';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';


@Component({
  selector: 'app-list-forms-company',
  templateUrl: './list-forms-company.component.html',
  styleUrls: ['./list-forms-company.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ListFormsCompanyComponent implements OnInit {
  dataSource = new MatTableDataSource<FormCompany>();
  columnsToDisplay = ['completed','name', 'type_actor' ,'assing', 'more'];
  expandedElement!: FormCompany;
  selection = new SelectionModel<FormCompany>(true, []);
  selectedRowIndex = -1;
  display=false;
  displayConfirm=false;
  enterprise!:FormCompany;
  listData: any;
  textSearch='';
  expandStatus=false;
  loading=false;
  pagination=10;
  listSize = 0;
  path=environment.path;
  pageIndex = 0;
  loadData=false;
  filterValue=''
  filterValue$ = new Subject<any>();
  active=''
  direction=''
  displayAssing=false;
  display2=false;
  data:any;
  title_name="";
  porcentTemp = 95;
  idForm:any;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang:any;
  subRol!:Rol;
  type:any;

  listCompany = [
    {code: 'Empresa 1', name: 'Empresa 1'},
    {code: 'Empresa 2', name: 'Empresa 2'},
    {code: 'Empresa 3', name: 'Empresa 3'},
    {code: 'Empresa 4', name: 'Empresa 4'}
  ]

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  form!:FormGroup

  actor_type: any;
  filterActorType$ = new Subject<string>();
  commodity: any;
  filterCommodity$ = new Subject<string>();

  listCommodity!: Commodity[];
  listActorType!: ActorType[];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private storageService: StorageService,
    private readonly viewport: ViewportScroller,
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    public location: Location
  ) {   
    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
    });
    this.aRouter.queryParams.subscribe((resp:any)=>{
      if(resp.idForm){
        this.idForm = resp.idForm;
        this.list();
      }
    })
    this.createForm();
    this.aRouter.queryParams.subscribe((params:any) =>{
      if(params.type){
        this.type = params.type;
      }
    })
  }
  
  ngOnInit(): void {
    this.getLang();
    this.loadEventService.loadEvent.emit(true);

    this.filterValue$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list();
    });
    this.filterCommodity$
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.list();
    });
    this.filterActorType$
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.list();
    });
    this.getPermissions();
    this.getListCommodity();
    // this.removeAccent();
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
  
  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.permissionAdd = resp.permissions.indexOf( "proforestform.add_proforestform") > -1; 
      this.permissionChange = resp.permissions.indexOf("proforestform.change_proforestform") > -1; 
      this.permissionDelete = resp.permissions.indexOf("proforestform.delete_proforestform") > -1; 
      this.permissionView = resp.permissions.indexOf("proforestform.view_proforestform") > -1; 
      this.subRol = resp.groups!;
    })
  }
  
  list(){
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    this.apiService.getResponse('GET',`formulario/list/asignedformularios/${this.idForm}?limit=${this.pagination}&name=${this.filterValue}&actor_type=${this.actor_type ? this.actor_type.id : ''}&commodity=${this.commodity ? this.commodity.id : ''}`)
    .then( (resp:any) =>{

      // console.log('resp', resp)
      this.title_name = resp.formulario_name;
      this.listData = resp;
      this.listSize  = resp.count;
      this.dataSource = new MatTableDataSource<FormCompany>(this.listData.results);
      this.listTreatment();
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }
  
  listPaginationNext(){
    this.loadEventService.loadTableEvent.emit(true);
    const urlTemp = this.listData.next.replace(this.path,'');
    this.apiService.getResponse('GET',`${urlTemp}`)
    .then( (resp:ListFormCompany) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<FormCompany>(this.listData.results);
      this.loadEventService.loadTableEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loading = false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }
  
  listPaginationBack(){
    this.loadEventService.loadTableEvent.emit(true);
    const urlTemp = this.listData.previous.replace(this.path,'');
    this.apiService.getResponse('GET',`${urlTemp}`)
    .then( (resp:ListFormCompany) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<FormCompany>(this.listData.results);
      this.loadEventService.loadTableEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loading = false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
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
    this.router.navigate(['/business/create-edit-business'], {queryParams: {id: element.id}});
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
  
  paginationChangeSize(e:PageEvent){
    this.viewport.scrollToPosition([0, 100]);
    if(e.pageSize != this.pagination){
      this.pagination = e.pageSize;
      this.list();
    }else{
      if(e.pageIndex > this.pageIndex){
        this.pageIndex = e.pageIndex;
        this.listPaginationNext();
      }else{
        this.pageIndex = e.pageIndex;
        this.listPaginationBack();
      }
    }
  }
  
  toAssing(data:any){
    this.display2 = true;
    this.data = data;
  }
  
  assignedCompany(){
    this.validateForm();
    if(this.form.valid){
      this.display2=false;
      this.displayAssing=true;
    }else{
      this.validateForm();
    }
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
  
  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.list();
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
    this.dataSource.filterPredicate = (data: FormCompany, filter: string): boolean => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return (currentTerm + (data as { [key: string]: any })[key] + '◬');
      }, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
      const transformedFilter = filter.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
      return dataStr.indexOf(transformedFilter) != -1;
    }
  }

  setPorcent(porcent=this.porcentTemp, data:any){
    if(data.revision_status=='WITHOUTVERIFY' || data.revision_status=='WITHOUTVALIDATE'){
      return '10px solid #FF5E61'
    }else if(data.revision_status=='INVERIFYPROCESS' || data.revision_status=='INVALIDATINGPROCESS'){
      return '10px solid #4B5897'
    }else if(data.revision_status=='VERIFIED' || data.revision_status=='VALIDATE' ){
      return '10px solid #00A7B0'
    }else{
      return null;
    }
  }

  review(id:any){
    if(this.subRol){
      if(this.subRol.name=="VERIFICADOR" || (this.subRol.name == 'SUPERADMINISTRADOR' && this.type=='verified'))
        this.router.navigate(['/forms/verified-forms/list-forms-company/review-form-verify'], {queryParams: {idForm: id, idPrev: this.idForm}})
      if(this.subRol.name=="VALIDADOR" || (this.subRol.name == 'SUPERADMINISTRADOR' && this.type=='validate'))
        this.router.navigate(['/forms/validated-forms/list-forms-company/review-form'], {queryParams: {idForm: id, idPrev: this.idForm}})
    }
  }

  getListCommodity() {
    this.apiService
      .getResponse(
        'GET',
        'company/commodity/list-create-company-form/?status=true'
      )
      .then((resp: ListCommodity) => {
        this.listCommodity = resp.results;
      });
  }
  getListActorType(idCommodity: any) {
    this.apiService
      .getResponse(
        'GET',
        `company/commodity/view-create-company-form/${idCommodity}/?status=true`
      )
      .then(
        (resp: ListCommodity) => {
          this.listActorType = resp.actor_type!;
        },
        (error) => {
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

  searchCommodity(event: Event) {
    let commodity = this.commodity;
    if (!commodity) {
      commodity = '';
      this.actor_type = null;
      this.filterCommodity$.next(commodity);
      this.listActorType = [];
    } else {
      this.filterCommodity$.next(commodity);
      this.getListActorType(this.commodity.id);
    }
  }

  searchActorType(event: Event) {
    this.filterActorType$.next(this.actor_type);
  }

  clear(){
    this.commodity = "";
    this.actor_type = "";
    this.listActorType = [];
    this.filterValue="";
    this.textSearch = "";
    this.list();
  }

}
