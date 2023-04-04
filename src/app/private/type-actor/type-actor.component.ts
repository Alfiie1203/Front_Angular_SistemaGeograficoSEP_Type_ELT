import { AfterViewChecked, Component, OnInit, ViewChild, AfterViewInit, AfterContentInit, AfterContentChecked } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ActorType, Commodity, ListActorType, ListCommodity } from '../../core/interfaces/business';
import { ShowMessageService } from '../../core/services/show-message.service';
import { EventService } from '../../core/services/event.service';
import { environment } from '../../../environments/environment';
import { ViewportScroller } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'app-type-actor',
  templateUrl: './type-actor.component.html',
  styleUrls: ['./type-actor.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TypeActorComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<ActorType>();
  columnsToDisplay = ['select', 'name', 'proforest_actortype_code', 'commodity', 'state', 'actions', 'more'];
  expandedElement!: ActorType;
  selection = new SelectionModel<ActorType>(true, []);
  listData!: ListActorType;
  selectedRowIndex = -1;
  display=false;
  display2=false;
  displayConfirm=false;
  displayUpdate=false;
  type_actor:any;
  displayRegister=false;
  textSearch='';
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
  lang:any;

  form: FormGroup = <FormGroup>{};
  formUpdate: FormGroup = <FormGroup>{};

  listCommodity!: Commodity[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('actor_type_sort') actor_type_sort: MatSort = new MatSort();
  formNameSubscriptionES:Subscription | undefined;
  formNameSubscriptionEN:Subscription | undefined;
  formNameSubscriptionPT:Subscription | undefined;
  constructor(
    private router: Router,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private readonly viewport: ViewportScroller
  ) {
    this.createForm();
    this.createFormUpdate();
    this.loadEventService.loadLanguage.subscribe(()=>{
      // this.list();
      this.getLang();
    })
  }
  
  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
    this.list();
    this.getListCommodity();
    this.getLang();
  }
  ngOnDestroy(){
    if(this.formNameSubscriptionES){
      this.formNameSubscriptionES.unsubscribe();
    }
    if(this.formNameSubscriptionEN){
      this.formNameSubscriptionEN.unsubscribe();
    }
    if(this.formNameSubscriptionPT){
      this.formNameSubscriptionPT.unsubscribe();
    }
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  isProductor = [
    {
      name:"si",
      value:true
    },
    {
      name:"no",
      value:false
    }

  ]
  
  ngAfterViewInit(): void {
    this.actor_type_sort.sortChange.subscribe((resp)=>{
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
    this.apiService.getResponse('GET',`company/actortype/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}`)
    .then( (resp:ListActorType) =>{
      this.listData = resp;
      this.listSize = resp.count;
      this.dataSource = new MatTableDataSource<ActorType>(this.listData.results);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.actor_type_sort;
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
    .then( (resp:ListActorType) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<ActorType>(this.listData.results);
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
    .then( (resp:ListActorType) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<ActorType>(this.listData.results);
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

/*   list(){
    this.loadEventService.loadEvent.emit(true);
    this.apiService.getResponse('GET','company/actortype/list/')
    .then( (resp:ListActorType) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET',`company/actortype/list/?limit=${resp.count}`)
        .then((list:ListActorType)=>{
          this.listData = list;
          this.dataSource = new MatTableDataSource<ActorType>(this.listData.results);
          this.listTreatment();
          this.loadEventService.loadEvent.emit(false);
        }, error =>{
          this.loadEventService.loadEvent.emit(false);
          this.loading = false;
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
        })
      }
    }, error =>{
      this.loadEventService.loadEvent.emit(false);
      this.loading = false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  } */

  register(){
    this.validateForm();
    if(this.form.valid){
      this.form.patchValue({
        commodity: this.form.value.listCommodity.id
      })
      this.form.patchValue({
        is_productor: this.form.value.isProductor.value
      })
      this.loading=true;
      this.apiService.getResponse('POST', 'company/actortype/create/', this.form.value)
      .then(()=>{
        this.list()
        this.createForm();
        this.listSuggestion =[]
        this.loading=false;
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
      commodity: [''],
      listCommodity: ['', Validators.required],
      isProductor: ['', Validators.required],
      is_productor: [''],
      name_es: ['', Validators.required],
      name_en: ['', Validators.required],
      name_pt: ['', Validators.required],
      proforest_actortype_code: ['', [Validators.required, Validators.maxLength(2)]],
      status: [true]
    })
    this.formListenets()
  }

  formListenets(){
    this.formNameSubscriptionES = this.form
    .get('name_es')
    ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.suggestionsForm(response);
    });
    this.formNameSubscriptionEN = this.form
    .get('name_en')
    ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.suggestionsForm(response);
    });
    this.formNameSubscriptionPT = this.form
    .get('name_pt')
    ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.suggestionsForm(response);
    });
  }
  suggestionsForm(search:string){
    let name:string = (search?search:'');
    
    if(name.length>3){
      this.loadSuggestion = true;
      this.apiService.getResponse('GET', `company/actortype/search/?limit=5&name=${name}` )
      .then((resp:any)=>{
        this.loadSuggestion = false;
        this.listSuggestion = resp.results;
      })
    }else{
      this.listSuggestion = [];
    }
  }


  createFormUpdate(){
    this.formUpdate = this.formBuilder.group({
      id: '',
      commodity: [''],
      listCommodity: ['', Validators.required],
      isProductor: ['', Validators.required],
      is_productor: [''],
      name_es: ['', Validators.required],
      name_en: ['', Validators.required],
      name_pt: ['', Validators.required],
      proforest_actortype_code: ['',[ Validators.required, Validators.maxLength(2)]],
      status: ['']
    })
    this.formListenets()
  }
  source:any;
  suggestions(ev:Event){
       
    let name = '';
    name = (<HTMLInputElement>ev.target).value;
    if(name.length>3){
      this.loadSuggestion = true;
      this.apiService.getResponse('GET', `company/actortype/search/?limit=5&name=${name}` )
      .then((resp:any)=>{
        this.loadSuggestion = false;
        this.listSuggestion = resp.results;
      })
    }else{
      this.listSuggestion = [];
    }
  }

  getListCommodity(){
    this.apiService.getResponse('GET','company/commodity/list/?status=true')
    .then( (resp:ListCommodity) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET', `company/commodity/list/?status=true&limit=${resp.count}`)
        .then((res: ListCommodity)=>{
          this.listCommodity = res.results;
        })
      }
    })
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

  edit(element:ActorType){
    const isProductor = this.isProductor.find(x => x.value == element.is_productor);
    this.formUpdate.setValue({
      id: element.id,
      name_es: element.name_es,
      name_en: element.name_en,
      name_pt: element.name_pt,
      is_productor: element.is_productor,
      isProductor: isProductor,
      commodity: element.commodity.id,
      listCommodity: element.commodity,
      proforest_actortype_code: element.proforest_actortype_code,
      status: element.status
    });
    this.formUpdate.controls['proforest_actortype_code'].disable();
    this.display2 = true;
  }

  showDelete(element:any){
    this.display = true;
    this.type_actor = element;
  }

  delete(){
    this.loading=true;
    this.apiService.getResponse('DELETE', `company/actortype/destroy/${this.type_actor.id}/`)
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

  update(){
    this.validateFormUpdate();
    if(this.formUpdate.valid){
      this.formUpdate.patchValue({
        commodity: this.formUpdate.value.listCommodity.id
      })
      this.loading=true;
      this.apiService.getResponse('PATCH', `company/actortype/update/${this.formUpdate.value.id}/`, this.formUpdate.value)
      .then(()=>{
        this.list()
        this.createFormUpdate();
        this.loading=false;
        this.display2 = false;
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

  listTreatment(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.actor_type_sort;
    // this.dataSource.sortingDataAccessor = (row:ActorType,columnName:string) : string => {
    //   if(columnName=="commodity.name") return row.commodity.name!;
    //   var columnValue = row[columnName as keyof ActorType] as string;
    //   return columnValue;
    // }
    this.removeAccent();
    this.filterObject();
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
  checkboxLabel(row?: ActorType): string {
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
    this.dataSource.filterPredicate = (data:ActorType, filter) => {
      return data.proforest_actortype_code.toLocaleLowerCase().includes(filter) //|| 
      // data.name?.toLocaleLowerCase().includes(filter) ||
        // data.commodity.name!.toLocaleLowerCase().includes(filter)
    };
  }

  removeAccent(){
    this.dataSource.filterPredicate = (data: ActorType, filter: string): boolean => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return (currentTerm + (data as { [key: string]: any })[key] + '◬');
      }, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const transformedFilter = filter.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      return dataStr.indexOf(transformedFilter) != -1;
    }
  }
 
}
