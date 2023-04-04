import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { ActorType, Business, Commodity, ListBusiness, ListCommodity } from 'src/app/core/interfaces/business';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { EventService } from '../../../core/services/event.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { User } from '../../../core/interfaces/user';
import { environment } from '../../../../environments/environment';
import { ViewportScroller } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'app-list-business',
  templateUrl: './list-business.component.html',
  styleUrls: ['./list-business.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})
export class ListBusinessComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<Business>();
  columnsToDisplay = ['select','name', 'type_actor', 'switch', 'actions', 'more'];
  expandedElement!: Business;
  selection = new SelectionModel<Business>(true, []);
  selectedRowIndex = -1;
  display=false;
  displayConfirm=false;
  enterprise!:Business;
  listData!: ListBusiness;
  textSearch='';
  expandStatus=false;
  loading=false;
  pagination=10;
  listSize = 0;
  path=environment.path;
  pageIndex = 0;
  loadData=false;
  filterValue=''
  filterValue$ = new Subject<string>();
  filterValueSubs:Subscription | undefined;
  active=''
  direction=''

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang:any;


  actor_type:any;
  filterActorType$ = new Subject<string>();
  filterActorTypeSubs:Subscription | undefined;
  listActorType!: ActorType[];
  commodity:any;
  filterCommodity$ = new Subject<string>();
  filterCommoditySubs:Subscription | undefined;
  listCommodity!:Commodity[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private storageService: StorageService,
    private readonly viewport: ViewportScroller
  ) { 
    this.filterValueSubs = this.filterValue$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list(true);
    });
    this.filterCommoditySubs = this.filterCommodity$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list(true);
    });
    this.filterActorTypeSubs = this.filterActorType$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list(true);
    });
    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
    })
  }
  ngOnDestroy(){
    if(this.filterValueSubs){
      this.filterValueSubs.unsubscribe();
    }
    if(this.filterCommoditySubs){
      this.filterCommoditySubs.unsubscribe();
    }
    if(this.filterActorTypeSubs){
      this.filterActorTypeSubs.unsubscribe();
    }
  }
  
  
  ngOnInit(): void {
    this.getLang();
    this.loadEventService.loadEvent.emit(true);
    this.getPermissions();
    // this.removeAccent();
    this.list(false);
    this.getListCommodity()
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
      this.permissionAdd = resp.permissions.indexOf( "company.add_company") > -1; 
      this.permissionChange = resp.permissions.indexOf("company.change_company") > -1; 
      this.permissionDelete = resp.permissions.indexOf("company.delete_company") > -1; 
      this.permissionView = resp.permissions.indexOf("company.view_company") > -1; 
    })
  }

  getActorType(){
    const url = ``;
  }
  getCommodity(){
    const url = ``;
  }
  list(loader = true){
    this.listSize = 0;
    this.pageIndex = 0;
    
    if(loader)
    this.loadEventService.loadTableEvent.emit(true);

    const url = `company/company/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}&commodity=${(this.commodity?this.commodity.id:"")}&actor_type=${(this.actor_type?this.actor_type.id:"")}`;
    this.apiService.getResponse('GET',url)
    .then( (resp:ListBusiness) =>{
     // console.log('ListBusiness', resp);
      this.listData = resp;
      this.listSize  = resp.count;
      this.dataSource = new MatTableDataSource<Business>(this.listData.results);
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
  getListCommodity(){
    this.apiService.getResponse('GET','company/commodity/list-create-company-form/?status=true')
    .then( (resp:ListCommodity) =>{
      this.listCommodity = resp.results;
    })
  }
  getListActorType(idCommodity:any){
    this.apiService.getResponse('GET',`company/commodity/view-create-company-form/${idCommodity}/?status=true`)
    .then( (resp:ListCommodity) =>{
      this.listActorType = resp.actor_type!;
     // console.log("8000 listActorType",this.listActorType);
    }, error =>{
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
    .then( (resp:ListBusiness) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Business>(this.listData.results);
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
    .then( (resp:ListBusiness) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Business>(this.listData.results);
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

  showAccept(){
    this.displayConfirm=true;
  }

  listTreatment(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.dataSource.sortingDataAccessor = (row:Business,columnName:string) : string => {
    //   if(columnName=="type_actor") return row.actor_type.name;
    //   var columnValue = row[columnName as keyof Business] as string;
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
    this.filterValue$.next(this.filterValue );
  }

  searchCommodity(event: Event){
    this.filterCommodity$.next(this.commodity);
    this.getListActorType(this.commodity.id)
  }
  searchActorType(event: Event){
    this.filterActorType$.next(this.actor_type)
  }

  filterObject(){
    this.dataSource.filterPredicate = (data:Business, filter) => {
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
    };
  }

  removeAccent(){
    this.dataSource.filterPredicate = (data: Business, filter: string): boolean => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return (currentTerm + (data as { [key: string]: any })[key] + '◬');
      }, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const transformedFilter = filter.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      return dataStr.indexOf(transformedFilter) != -1;
    }
  }

  clear(){
    this.actor_type=undefined;
    this.listActorType=[];
    this.commodity=undefined;
    this.listCommodity=[];
    this.getListCommodity()
  }

}
