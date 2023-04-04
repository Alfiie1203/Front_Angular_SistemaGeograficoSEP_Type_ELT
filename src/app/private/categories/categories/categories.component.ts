import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { EventService } from '../../../core/services/event.service';
import { StorageService } from '../../../core/services/storage.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../../core/interfaces/user';
import { Category, ListCategories } from '../../../core/interfaces/form';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { environment } from '../../../../environments/environment';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CategoriesComponent implements OnInit {

  dataSource:MatTableDataSource<Category> = new MatTableDataSource();
  columnsToDisplay = ['select', 'name', 'code', 'state', 'actions', 'more'];
  expandedElement!: Category;
  selection = new SelectionModel<Category>(true, []);
  selectedRowIndex = -1;
  display=false;
  display2=false;
  displayConfirm=false;
  displayUpdate=false;
  category!:any;
  textSearch='';
  listData!: ListCategories;
  displayRegister=false;
  loading=false;
  path=environment.path;
  pagination=5;
  listSize = 0;
  pageIndex = 0;
  loadData=false;
  filterValue=''
  active=''
  direction=''
  listSuggestion:[] = [];
  loadSuggestion=false;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang:any;

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


  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.permissionAdd = resp.permissions.indexOf( "questionsbank.add_category") > -1; 
      this.permissionChange = resp.permissions.indexOf("questionsbank.change_category") > -1; 
      this.permissionDelete = resp.permissions.indexOf("questionsbank.delete_category") > -1; 
      this.permissionView = resp.permissions.indexOf("questionsbank.view_category") > -1; 
    })
  }


  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true)
    this.getLang();
    this.list();
    this.getPermissions();
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  
  langCode = {
    es:"es"
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
    this.loadEventService.loadTableEvent.emit(true)
    this.apiService.getResponse('GET',`questionbank/category/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}`)
    .then( (resp:ListCategories) =>{
      this.listData = resp;
      this.listSize  = resp.count;
      this.dataSource = new MatTableDataSource<Category>(this.listData.results);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      this.loadEventService.loadEvent.emit(false)
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
    .then( (resp:ListCategories) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Category>(this.listData.results);
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
    .then( (resp:ListCategories) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Category>(this.listData.results);
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
      this.apiService.getResponse('POST', 'questionbank/category/create/', this.form.value)
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
      code: ['', [Validators.required, Validators.maxLength(16)]],
      status: [true]
    })
  }

  createFormUpdate(){
    this.formUpdate = this.formBuilder.group({
      id: [''],
      name_es: ['', Validators.required],
      name_en: ['', Validators.required],
      name_pt: ['', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(16)]],
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


  edit(element:Category){
    this.formUpdate.setValue({
      id: element.id,
      name_es: element.name_es,
      name_pt: element.name_pt,
      name_en: element.name_en,
      code: element.code,
      status: element.status
    });
    this.formUpdate.controls['code'].disable();
    this.display2 = true;
  }

  showDelete(element:any){
    this.display = true;
    this.category = element;
  }

  delete(){
    this.loading = true;
    this.apiService.getResponse('DELETE', `questionbank/category/destroy/${this.category.id}/`)
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
      this.apiService.getResponse('PATCH', `questionbank/category/update/${this.formUpdate.value.id}/`, this.formUpdate.value)
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
      this.apiService.getResponse('GET', `questionbank/category/search/?limit=5&name=${name}` )
      .then((resp:any)=>{
        this.loadSuggestion = false;
        this.listSuggestion = resp.results;
      })
    }else{
      this.listSuggestion = [];
    }
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
  checkboxLabel(row?: Category): string {
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
    this.dataSource.filterPredicate = (data: Category, filter: string): boolean => {
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
    this.category = undefined;
  }

}
