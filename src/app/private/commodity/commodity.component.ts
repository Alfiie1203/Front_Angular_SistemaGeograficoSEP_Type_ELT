import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Commodity, ListCommodity } from 'src/app/core/interfaces/business';
import { ApiService } from '../../core/services/api.service';
import { ShowMessageService } from '../../core/services/show-message.service';
import { EventService } from '../../core/services/event.service';
import { StorageService } from '../../core/services/storage.service';
import { User } from '../../core/interfaces/user';
import { environment } from 'src/environments/environment';
import { ViewportScroller } from '@angular/common';


@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CommodityComponent implements OnInit {

  dataSource:MatTableDataSource<Commodity> = new MatTableDataSource();
  columnsToDisplay = ['name', 'proforest_commodity_code', 'state', 'actions', 'more'];
  expandedElement!: Commodity;
  selection = new SelectionModel<Commodity>(true, []);
  selectedRowIndex = -1;
  display=false;
  display2=false;
  displayConfirm=false;
  displayUpdate=false;
  commodity!:any;
  textSearch='';
  listData!: ListCommodity;
  displayRegister=false;
  loading=false;
  pagination=5;
  listSize = 0;
  path=environment.path;
  pageIndex = 0;
  loadData=false;
  filterValue=''
  active=''
  direction=''
  listSuggestion:[] = [];
  loadSuggestion=false;
  displayConfirmRegister=false;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang:any;
  statusActive:string = "Activo";
  statusInactive:string = "Inactivo";

  form: FormGroup = <FormGroup>{};
  formUpdate: FormGroup = <FormGroup>{};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private storageService: StorageService,
    private readonly viewport: ViewportScroller
  ) {
    this.createForm();
    this.createFormUpdate();
    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
    })
   }

  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
    this.getPermissions();
    this.getLang();
    this.list();
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.permissionAdd = resp.permissions.indexOf( "company.add_commodity") > -1; 
      this.permissionChange = resp.permissions.indexOf("company.change_commodity") > -1; 
      this.permissionDelete = resp.permissions.indexOf("company.delete_commodity") > -1; 
      this.permissionView = resp.permissions.indexOf("company.view_commodity") > -1; 
    })
  }
  
  ngAfterViewInit() {
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

  list(){
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    this.apiService.getResponse('GET',`company/commodity/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}`)
    .then( (resp:ListCommodity) =>{
      this.statusActive = this.translate.instant("active");
      this.statusInactive = this.translate.instant("inactive");
      this.listData = resp;
      this.listSize = resp.count;
      this.dataSource = new MatTableDataSource<Commodity>(this.listData.results);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
      this.loading = false;
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
    .then( (resp:ListCommodity) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Commodity>(this.listData.results);
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
    .then( (resp:ListCommodity) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Commodity>(this.listData.results);
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

  register(){
    this.validateForm();
    if(this.form.valid){
      this.loading = true;
      this.apiService.getResponse('POST', 'company/commodity/create/', this.form.value)
      .then(()=>{
        this.list()
        this.createForm();
        this.listSuggestion =[]
        this.loading = false;
        this.displayRegister=true;
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

  createForm(){
    this.form = this.formBuilder.group({
      name_es: ['', Validators.required],
      name_en: ['', Validators.required],
      name_pt: ['', Validators.required],
      proforest_commodity_code: ['', [Validators.required, Validators.maxLength(2)]],
      status: [true]
    })
  }

  createFormUpdate(){
    this.formUpdate = this.formBuilder.group({
      id: [''],
      name_es: ['', Validators.required],
      name_en: ['', Validators.required],
      name_pt: ['', Validators.required],
      proforest_commodity_code: ['', [Validators.required, Validators.maxLength(2)]],
      status: []
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


  edit(element:Commodity){

    this.formUpdate.setValue({
      id: element.id,
      name_es: element.name_es,
      name_en: element.name_en,
      name_pt: element.name_pt,
      proforest_commodity_code: element.proforest_commodity_code,
      status: element.status
    });
    this.formUpdate.controls['proforest_commodity_code'].disable();
    this.display2 = true;
  }

  showDelete(element:any){
    this.display = true;
    this.commodity = element;
  }

  delete(){
    this.loading = true;
    this.apiService.getResponse('DELETE', `company/commodity/destroy/${this.commodity.id}/`)
    .then(()=>{
      this.list()
      this.display = false;
      this.loading = false;
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

  update(){
    this.validateFormUpdate();
    if(this.formUpdate.valid){
      this.loading = true;
      this.apiService.getResponse('PATCH', `company/commodity/update/${this.formUpdate.value.id}/`, this.formUpdate.value)
      .then(()=>{
        this.list()
        this.createFormUpdate();
        this.display2 = false;
        this.loading = false;
        this.showAcceptUpdate();
      }, error =>{
        this.loading = false;
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
      })
    }else{
      this.validateFormUpdate();
    }    
  }

  suggestions(ev:Event){
    let name = '';
    name = (<HTMLInputElement>ev.target).value;
    if(name.length>3){
      this.loadSuggestion = true;
      this.apiService.getResponse('GET', `company/commodity/search/?limit=5&name=${name}` )
      .then((resp:any)=>{
        this.loadSuggestion = false;
        this.listSuggestion = resp.results;
      })
    }else{
      this.listSuggestion = [];
    }
  }

  paginationChangeSize(e:PageEvent){
    this.viewport.scrollToPosition([0, 300]);
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

  showAccept(){
    this.displayConfirm=true;
  }

  showAcceptUpdate(){
    this.displayUpdate=true;
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

  page(e:PageEvent){
    
  }
    
  get f(){
    return this.form.controls;
  }

  validateFormUpdate(){
    return Object.values( this.formUpdate.controls ).forEach( control => { 
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsTouched() );
      } else {
        control.markAsTouched();
      }
    });
  }

  get fU(){
    return this.formUpdate.controls;
  }

  expand(element:any){
    this.expandedElement = this.expandedElement === element ? null : element
  }
  
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Commodity): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id! + 1}`;
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.list();
  }

  removeAccent(){
    this.dataSource.filterPredicate = (data: Commodity, filter: string): boolean => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return (currentTerm + (data as { [key: string]: any })[key] + '◬');
      }, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const transformedFilter = filter.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      return dataStr.indexOf(transformedFilter) != -1;
    }
  }

  closeDelete(){
    this.display=false;
    this.display2=false;
    this.createFormUpdate();
    this.commodity =undefined;;
  }
 

}
