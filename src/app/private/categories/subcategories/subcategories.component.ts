import { Component, OnInit, ViewChild } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { EventService } from '../../../core/services/event.service';
import { StorageService } from '../../../core/services/storage.service';
import { ListSubcategory, Subcategory } from 'src/app/core/interfaces/form';
import { User } from '../../../core/interfaces/user';
import { ListCategories, Category } from '../../../core/interfaces/form';
import { environment } from 'src/environments/environment';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SubcategoriesComponent implements OnInit {

  dataSource:MatTableDataSource<Subcategory> = new MatTableDataSource();
  columnsToDisplay = ['select', 'name', 'code','category.name', 'state', 'actions', 'more'];
  expandedElement!: Subcategory;
  selection = new SelectionModel<Subcategory>(true, []);
  selectedRowIndex = -1;
  display=false;
  display2=false;
  displayConfirm=false;
  displayUpdate=false;
  subcategory!:any;
  textSearch='';
  listData!: ListSubcategory;
  displayRegister=false;
  loading=false;
  listCategories!:Category[];
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
  lang:any;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;

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
      this.permissionAdd = resp.permissions.indexOf( "questionsbank.add_subcategory") > -1; 
      this.permissionChange = resp.permissions.indexOf("questionsbank.change_subcategory") > -1; 
      this.permissionDelete = resp.permissions.indexOf("questionsbank.delete_subcategory") > -1; 
      this.permissionView = resp.permissions.indexOf("questionsbank.view_subcategory") > -1; 
    })
  }


  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
    this.getLang();
    this.list();
    this.getPermissions();
    this.getListCategories();
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  
  ngAfterViewInit() {
  }

  list(){
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true)
    this.apiService.getResponse('GET',`questionbank/subcategory/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}`)
    .then( (resp:ListSubcategory) =>{
      this.listData = resp;
      this.listSize  = resp.count;
      this.dataSource = new MatTableDataSource<Subcategory>(this.listData.results);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
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
    .then( (resp:ListSubcategory) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Subcategory>(this.listData.results);
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
    .then( (resp:ListSubcategory) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Subcategory>(this.listData.results);
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
      this.form.patchValue({
        category: this.form.value.listCategories.id
      })
      this.loading = true;
      this.apiService.getResponse('POST', 'questionbank/subcategory/create/', this.form.value)
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

  getListCategories(){
    this.apiService.getResponse('GET','questionbank/category/list/?status=true')
    .then( (resp:ListCategories) =>{
      this.listCategories = resp.results;
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  createForm(){
    this.form = this.formBuilder.group({
      name_es: ['', Validators.required],
      name_en: ['', Validators.required],
      name_pt: ['', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(16)]],
      category: [''],
      listCategories: ['',Validators.required],
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
      category: [''],
      listCategories: ['', Validators.required],
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


  edit(element:any){
    this.formUpdate.setValue({
      id: element.id,
      name_es: element.name_es,
      name_pt: element.name_pt,
      name_en: element.name_en,
      code: element.code,
      category: element.category.id,
      listCategories: element.category,
      status: element.status
    });
    this.formUpdate.controls['code'].disable();
    this.display2 = true;
  }

  showDelete(element:any){
    this.display = true;
    this.subcategory = element;
  }

  delete(){
    this.loading = true;
    this.apiService.getResponse('DELETE', `questionbank/subcategory/destroy/${this.subcategory.id}/`)
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
      this.formUpdate.patchValue({
        category: this.formUpdate.value.listCategories.id
      })
      this.loading = true;
      this.apiService.getResponse('PATCH', `questionbank/subcategory/update/${this.formUpdate.value.id}/`, this.formUpdate.value)
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


  suggestions(ev:Event){
    let name = '';
    name = (<HTMLInputElement>ev.target).value;
    if(name.length>3){
      this.loadSuggestion = true;
      this.apiService.getResponse('GET', `questionbank/subcategory/search/?limit=5&name=${name}` )
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
  checkboxLabel(row?: Subcategory): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id! + 1}`;
  }

  listTreatment(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.dataSource.sortingDataAccessor = (row:Subcategory,columnName:string) : string => {
    //   if(columnName=="category.name") return row.category!.name;
    //   var columnValue = row[columnName as keyof Subcategory] as string;
    //   return columnValue;
    // }
    this.removeAccent();
    this.filterObject();
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.list();
  }

  filterObject(){
    this.dataSource.filterPredicate = (data:Subcategory, filter) => {
      return data.code.toLocaleLowerCase().includes(filter) //|| 
      // data.name.toLocaleLowerCase().includes(filter) ||
        // data.category?.name.toLocaleLowerCase().includes(filter)
    };
  }

  removeAccent(){
    this.dataSource.filterPredicate = (data: Subcategory, filter: string): boolean => {
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
    // setTimeout(() => {
      this.subcategory = undefined;
    // }, 100);
  }

}
