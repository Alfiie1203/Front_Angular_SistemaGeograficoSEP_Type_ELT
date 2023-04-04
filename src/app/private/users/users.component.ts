import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ShowMessageService } from '../../core/services/show-message.service';
import { EventService } from '../../core/services/event.service';
import { ResultUsers, User } from 'src/app/core/interfaces/user';
import { Country } from '../../core/interfaces/cities';
import { StorageService } from '../../core/services/storage.service';
import { environment } from '../../../environments/environment';
import { ViewportScroller } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})

export class UsersComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<User>();
  columnsToDisplay = ['select', 'full_name' ,'company', 'switch', 'actions', 'more'];
  expandedElement!: User;
  selection = new SelectionModel<User>(true, []);
  selectedRowIndex = -1;
  display=false;
  displayConfirm=false;
  data:any;
  listData!: ResultUsers;
  textSearch = '';
  listCountry!: Country[];
  loading=false;
  pagination=10;
  listSize = 0;
  path=environment.path;
  pageIndex = 0;
  loadData=false;
  filterValue='';
  filterValue$=new Subject<string>();
  active='';
  direction='';

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private storageService: StorageService,
    private readonly viewport: ViewportScroller
  ) {
  }

  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
    this.list();
    this.getPermissions();
    this.filterValue$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list(true);
    });
  }

  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.permissionAdd = resp.permissions.indexOf("user.add_user") > -1; 
      this.permissionChange = resp.permissions.indexOf("user.change_user") > -1; 
      this.permissionDelete = resp.permissions.indexOf("user.delete_user") > -1; 
      this.permissionView = resp.permissions.indexOf("user.view_user") > -1; 
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

  list(load = false){
    this.listSize = 0;
    this.pageIndex = 0;
    //this.loadEventService.loadTableEvent.emit(true);
    if(load){
      this.loadEventService.loadTableEvent.emit(true);
    }
    this.apiService.getResponse('GET',`users/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}&status=true`)
    .then( (resp:ResultUsers) =>{
      //console.log('resp', resp)
      this.listData = resp;
      this.listSize = resp.count;
      this.dataSource = new MatTableDataSource<User>(this.listData.results);
      this.listTreatment();
      
      
    }, error =>{
      
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    }).finally(()=>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
    });
  }

  listPaginationNext(){
    this.loadEventService.loadTableEvent.emit(true);
    const urlTemp = this.listData.next.replace(this.path,'');
    this.apiService.getResponse('GET',`${urlTemp}`)
    .then( (resp:ResultUsers) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<User>(this.listData.results);
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
    .then( (resp:ResultUsers) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<User>(this.listData.results);
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

  edit(element:any){
    this.router.navigate(['users/create-edit-user'], {queryParams: {id: element.id}});
  }

  showDelete(element:any){
    this.display = true;
    this.data = element;
  }

  delete(){
    this.loading=true;
    this.apiService.getResponse('DELETE', `users/destroy-api/${this.data.id}/`)
    .then( () =>{
      this.loading=false;
      this.list()
      this.display = false;
      this.showAccept();
    }, error =>{
      this.loading=false;
      this.loadEventService.loadEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
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

  showAccept(){
    this.displayConfirm=true;
  }

  listTreatment(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.dataSource.sortingDataAccessor = (row:User,columnName:string) : string => {
    //   const fullname = `${row.first_name} ${row.second_name} ${row.surname} ${row.second_surname}`;
    //   if(columnName=="full_name") return fullname;
    //   var columnValue = row[columnName as keyof User] as string;
    //   return columnValue;
    // }
    // this.removeAccent();
    // this.filterObject();
  }

  filterObject(){
    this.dataSource.filterPredicate = (data:User, filter) => {
      if(data.company){
        return data.first_name.toLocaleLowerCase().includes(filter) ||
          data.second_name.toLocaleLowerCase().includes(filter) || 
          data.surname.toLocaleLowerCase().includes(filter) || 
          data.second_surname.toLocaleLowerCase().includes(filter) || 
          data.company.name.toLocaleLowerCase().includes(filter) || 
          data.email.toLocaleLowerCase().includes(filter) || 
          data.phone.toLocaleLowerCase().includes(filter);
      }
      if(data.country){
        return data.first_name.toLocaleLowerCase().includes(filter) ||
          data.second_name.toLocaleLowerCase().includes(filter) || 
          data.surname.toLocaleLowerCase().includes(filter) || 
          data.second_surname.toLocaleLowerCase().includes(filter) || 
          data.country.name.toLocaleLowerCase().includes(filter) || 
          data.email.toLocaleLowerCase().includes(filter) || 
          data.phone.toLocaleLowerCase().includes(filter);
      }
      return data.first_name.toLocaleLowerCase().includes(filter) ||
        data.second_name.toLocaleLowerCase().includes(filter) || 
        data.surname.toLocaleLowerCase().includes(filter) || 
        data.second_surname.toLocaleLowerCase().includes(filter) || 
        data.email.toLocaleLowerCase().includes(filter) || 
        data.phone.toLocaleLowerCase().includes(filter);
      
    };
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
  checkboxLabel(row?: User): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id! + 1}`;
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValue$.next(this.filterValue);
    // this.list(true);
  }

  removeAccent(){
    this.dataSource.filterPredicate = (data: User, filter: string): boolean => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return (currentTerm + (data as { [key: string]: any })[key] + '◬');
      }, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const transformedFilter = filter.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      return dataStr.indexOf(transformedFilter) != -1;
    }
  }

}