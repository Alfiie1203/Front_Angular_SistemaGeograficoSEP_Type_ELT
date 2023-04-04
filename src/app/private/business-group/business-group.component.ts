import { Component, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { BusinessGroup, ListBusinessGroup } from '../../core/interfaces/business';
import { ShowMessageService } from '../../core/services/show-message.service';
import { EventService } from 'src/app/core/services/event.service';
import { User } from '../../core/interfaces/user';
import { StorageService } from '../../core/services/storage.service';
import { environment } from 'src/environments/environment';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-business-group',
  templateUrl: './business-group.component.html',
  styleUrls: ['./business-group.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})


export class BusinessGroupComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  //Data
  listData!: ListBusinessGroup;
  dataSource:MatTableDataSource<BusinessGroup> = new MatTableDataSource();
  columnsToDisplay = ['select', 'name', 'status', 'actions'];
  expandedElement!: BusinessGroup;
  selection = new SelectionModel<BusinessGroup>(true, []);
  selectedRowIndex = -1;
  display=false;
  display2=false;
  displayConfirm=false;
  displayUpdate=false;
  displayRegister=false;
  business_group!:BusinessGroup;
  textSearch='';
  loading = false;
  form: FormGroup = <FormGroup>{};
  formUpdate: FormGroup = <FormGroup>{};

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;

  filterValue=''
  active=''
  direction=''
  listSuggestion:[] = [];
  loadSuggestion=false;
  pagination=5;
  listSize = 0;
  path=environment.path;
  pageIndex = 0;
  loadData=false;


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
   }

  ngOnInit(): void {
    // this.removeAccent();
    this.loadEventService.loadEvent.emit(true);
    this.list();
    this.getPermissions();
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

  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.permissionAdd = resp.permissions.indexOf("company.add_companygroup") > -1; 
      this.permissionChange = resp.permissions.indexOf("company.change_companygroup") > -1; 
      this.permissionDelete = resp.permissions.indexOf("company.delete_companygroup") > -1; 
      this.permissionView = resp.permissions.indexOf("company.view_companygroup") > -1; 
    })
  }
  
  list(){
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    this.apiService.getResponse('GET',`company/companygroup/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}`)
    .then( (resp:ListBusinessGroup) =>{
      this.listData = resp;
      this.listSize = resp.count;
      this.dataSource = new MatTableDataSource<BusinessGroup>(this.listData.results);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loadEventService.loadEvent.emit(false);
      this.loadEventService.loadTableEvent.emit(false);
    }, error =>{
      this.loadEventService.loadEvent.emit(false);
      this.loadEventService.loadTableEvent.emit(false);
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
    .then( (resp:ListBusinessGroup) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<BusinessGroup>(this.listData.results);
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
    .then( (resp:ListBusinessGroup) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<BusinessGroup>(this.listData.results);
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
      this.apiService.getResponse('POST', 'company/companygroup/create/', this.form.value)
      .then(()=>{
        this.list()
        this.createForm();
        this.listSuggestion =[]
        this.displayRegister=true;
        this.loading = false;
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
      name: ['', Validators.required],
      status: [true]
    })
  }

  createFormUpdate(){
    this.formUpdate = this.formBuilder.group({
      id: [],
      name: ['', Validators.required],
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





  create(){
    this.router.navigateByUrl('business/create-business');
  }

  edit(element:any){
    this.formUpdate.setValue({
      id: element.id,
      name: element.name,
      status: element.status
    });
    this.display2 = true;
  }

  showDelete(element:any){
    this.display = true;
    this.business_group = element;
  }

  delete(){
    this.loading = true;
    this.apiService.getResponse('DELETE', `company/companygroup/destroy/${this.business_group.id}/`)
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
      this.apiService.getResponse('PUT', `company/companygroup/update/${this.formUpdate.value.id}/`, this.formUpdate.value)
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

  showAccept(){
    this.displayConfirm=true;
  }

  showAcceptUpdate(){
    this.displayUpdate=true;
  }

  paginationChangeSize(e:PageEvent){
    this.viewport.scrollToPosition([0, 300]);
    if(e.pageSize != this.pagination){
      this.pagination = e.pageSize;
      // this.pageIndex = 0;
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
    // this.list();
  }

  suggestions(){
    if(this.form.value.name.length>3){
      this.loadSuggestion = true;
      this.apiService.getResponse('GET', `company/companygroup/search/?limit=5&name=${this.form.value.name}` )
      .then((resp:any)=>{
        this.loadSuggestion = false;
        this.listSuggestion = resp.results;
      })
    }else{
      this.listSuggestion = [];
    }
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
  checkboxLabel(row?: BusinessGroup): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.list();
  }

  removeAccent(){
    this.dataSource.filterPredicate = (data: BusinessGroup, filter: string): boolean => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return (currentTerm + (data as { [key: string]: any })[key] + '◬');
      }, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const transformedFilter = filter.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      return dataStr.indexOf(transformedFilter) != -1;
    }
  }

  closeDelete(){
    this.display=false;
    this.business_group = <BusinessGroup>{};
  }
 
}
