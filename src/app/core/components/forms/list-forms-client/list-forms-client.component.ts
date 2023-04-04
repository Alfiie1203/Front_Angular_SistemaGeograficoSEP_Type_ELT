import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormClient,
  ListFormClient,
  ListPeriod,
  Period,
} from '../../../interfaces/form';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from '../../../../../environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { ShowMessageService } from '../../../services/show-message.service';
import { EventService } from '../../../services/event.service';
import { StorageService } from '../../../services/storage.service';
import { ViewportScroller } from '@angular/common';
import { User } from '../../../interfaces/user';
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-list-forms-client',
  templateUrl: './list-forms-client.component.html',
  styleUrls: ['./list-forms-client.component.scss'],
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
export class ListFormsClientComponent implements OnInit {
  dataSource = new MatTableDataSource<FormClient>();
  columnsToDisplay = ['completed', 'code_form', 'date', 'assing', 'more'];
  expandedElement!: any;
  selection = new SelectionModel<FormClient>(true, []);
  selectedRowIndex = -1;
  display = false;
  displayConfirm = false;
  enterprise!: FormClient;
  listData!: ListFormClient;
  textSearch = '';
  expandStatus = false;
  loading = false;
  pagination = 10;
  listSize = 0;
  path = environment.path;
  pageIndex = 0;
  loadData = false;
  filterValue = '';
  active = '';
  direction = '';
  porcentTemp = 95;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  permissionFill = false;
  lang: any;

  period!: any;
  period$ = new Subject<any>();
  company!: any;
  company$ = new Subject<any>();
  status!: any;
  status$ = new Subject<any>();
  date_assing!: any;
  date_assing$ = new Subject<any>();
  date_close!: any;
  date_close$ = new Subject<any>();
  filterValue$ = new Subject<any>();
  listPeriod: Period[] = [];
  listComaniesAssing: any[] = [];
  listState: any[] = [
    { id: 'ACTIVE', name: 'ACTIVE' },
    { id: 'CLOSED', name: 'CLOSED' },
  ];

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
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
  }

  ngOnInit(): void {
    this.getLang();
    this.loadEventService.loadEvent.emit(true);
    this.getPermissions();
    // this.removeAccent();
    this.period$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response: any) => {
        this.list(true);
      });
    this.status$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response: any) => {
        this.list(true);
      });
    this.company$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response: any) => {
        this.list(true);
      });
    this.date_assing$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response: any) => {
        this.list(true);
      });
    this.date_close$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response: any) => {
        this.list(true);
      });

    this.filterValue$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.list();
      });

    /*   this.textSearch$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
    this.list()
  });
  this.textSearchAssigned$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
    this.list()
  });
  this.textSearchAssing$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
    this.list()
  });

  this.year$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
    this.list()
  }); */
    this.getListPeriod();
    this.list(false);
  }

  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe((resp) => {
      if (resp.direction == '') {
        (this.active = ''), (this.direction = '');
      } else {
        this.active = resp.active;
        this.direction = resp.direction;
      }
      this.list(true);
    });
  }

  getPermissions() {
    this.storageService.get('keyData').then((resp: User) => {
      this.permissionAdd =
        resp.permissions.indexOf('proforestform.add_proforestform') > -1;
      this.permissionChange =
        resp.permissions.indexOf('proforestform.change_proforestform') > -1;
      this.permissionDelete =
        resp.permissions.indexOf('proforestform.delete_proforestform') > -1;
      this.permissionView =
        resp.permissions.indexOf('proforestform.view_proforestform') > -1;
      this.permissionFill =
        resp.permissions.indexOf('formulario.fill_out_forms') > -1;
    });
  }

  list(loader = true) {
    this.listSize = 0;
    this.pageIndex = 0;
    if (loader) this.loadEventService.loadTableEvent.emit(true);

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
    this.apiService
      .getResponse(
        'GET',
        `formulario/list/?limit=${this.pagination}&name=${this.filterValue}&active=${this.active}&direction=${this.direction}&period_id=${(this.period && this.period.id)?this.period.id:''}&id_company=${(this.company && this.company.id_company)?this.company.id_company:''}&status=${(this.status && this.status.id)?this.status.id:''}&date_assing=${this.date_assing?fechaFormateadaA:''}&date_close=${this.date_close?fechaFormateadaC:''}`
      )
      .then(
        (resp: any) => {
          // console.log('resp', resp);
          this.listData = resp;
          this.listSize = resp.count;
          this.listComaniesAssing = resp.list_companies_asignadoras;
          this.dataSource = new MatTableDataSource<FormClient>(
            this.listData.results
          );
          this.listTreatment();
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

  listPaginationNext() {
    this.loadEventService.loadTableEvent.emit(true);
    const urlTemp = this.listData.next.replace(this.path, '');
    this.apiService.getResponse('GET', `${urlTemp}`).then(
      (resp: ListFormClient) => {
        this.listData = resp;
        this.dataSource = new MatTableDataSource<FormClient>(
          this.listData.results
        );
        this.loadEventService.loadTableEvent.emit(false);
      },
      (error) => {
        this.loadEventService.loadTableEvent.emit(false);
        this.loading = false;
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

  listPaginationBack() {
    this.loadEventService.loadTableEvent.emit(true);
    const urlTemp = this.listData.previous.replace(this.path, '');
    this.apiService.getResponse('GET', `${urlTemp}`).then(
      (resp: ListFormClient) => {
        this.listData = resp;
        this.dataSource = new MatTableDataSource<FormClient>(
          this.listData.results
        );
        this.loadEventService.loadTableEvent.emit(false);
      },
      (error) => {
        this.loadEventService.loadTableEvent.emit(false);
        this.loading = false;
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

  getListPeriod() {
    this.apiService.getResponse('GET', `proforestform/periodlist/`).then(
      (resp: ListPeriod) => {
        this.listPeriod = resp.results;
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  checked(element: any) {
    this.selection.clear();
    this.selection.toggle(element);
    this.selectedRowIndex = element.id;
  }

  create() {
    this.router.navigateByUrl('business/create-business');
  }

  edit(element: any) {
    this.router.navigate(['/business/create-edit-business'], {
      queryParams: { id: element.id },
    });
  }

  showDelete(element: any) {
    this.display = true;
    this.enterprise = element;
  }

  delete() {
    this.loading = true;
    this.apiService
      .getResponse('DELETE', `company/company/destroy/${this.enterprise.id}/`)
      .then(
        () => {
          this.list();
          this.loading = false;
          this.display = false;
          this.showAccept();
        },
        (error) => {
          this.loading = false;
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

  paginationChangeSize(e: PageEvent) {
    this.viewport.scrollToPosition([0, 100]);
    if (e.pageSize != this.pagination) {
      this.pagination = e.pageSize;
      this.list();
    } else {
      if (e.pageIndex > this.pageIndex) {
        this.pageIndex = e.pageIndex;
        this.listPaginationNext();
      } else {
        this.pageIndex = e.pageIndex;
        this.listPaginationBack();
      }
    }
  }

  showAccept() {
    this.displayConfirm = true;
  }

  listTreatment() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.dataSource.sortingDataAccessor = (row:FormClient,columnName:string) : string => {
    //   if(columnName=="type_actor") return row.actor_type.name;
    //   var columnValue = row[columnName as keyof FormClient] as string;
    //   return columnValue;
    // }
    // this.removeAccent();
    // this.filterObject();
  }

  expand(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValue$.next(this.filterValue);
  }

  filterObject() {
    /*   this.dataSource.filterPredicate = (data:FormClient, filter) => {
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

  removeAccent() {
    this.dataSource.filterPredicate = (
      data: FormClient,
      filter: string
    ): boolean => {
      const dataStr = Object.keys(data)
        .reduce((currentTerm: string, key: string) => {
          return currentTerm + (data as { [key: string]: any })[key] + '◬';
        }, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      const transformedFilter = filter
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      return dataStr.indexOf(transformedFilter) != -1;
    };
  }

  applyFilterPeriod(ev: any = null) {
    this.period = ev;
    this.period$.next(this.period.id);
  }

  applyFilterState(ev: any = null) {
    this.status = ev;
    this.status$.next(this.status.id);
  }
  searchCompanyAssing(ev: any = null) {
    // this.status = ev;
    this.company$.next(this.company.id_company);
  }

  applyFilterYear() {
    // let fecha = new Date(this.date_assing);
    // // this.date_assing = fecha.toString()
    // const dia = fecha.getDate();
    // const mes = fecha.getMonth() + 1;
    // const anio = fecha.getFullYear();

    // const fechaFormateada = `${dia}-${mes}-${anio}`;
    // console.log(fechaFormateada);
    // this.date_assing = fechaFormateada;
    // console.log(this.date_assing);
    this.date_assing$.next(this.date_assing);
  }

  applyFilterYearClose() {
    // let fecha = new Date(this.date_assing);
    // // this.date_assing = fecha.toString()
    // const dia = fecha.getDate();
    // const mes = fecha.getMonth() + 1;
    // const anio = fecha.getFullYear();

    // const fechaFormateada = `${dia}-${mes}-${anio}`;
    // console.log(fechaFormateada);
    // this.date_assing = fechaFormateada;
    // console.log(this.date_assing);
    this.date_close$.next(this.date_close);
  }

  clear() {
    this.period = undefined;
    this.status = undefined;
    this.company = undefined;
    this.date_assing = undefined;
    this.date_close = undefined;
    this.filterValue = '';
    this.textSearch = '';
    this.list();
  }

  /* applyFilter(ev:any=null){
    this.textSearch$.next(this.textSearch);
  }
  applyFilterAssingned(ev:any=null){
    this.textSearchAssigned$.next(this.textSearchAssigned);
  }
  applyFilterAssing(ev:any=null){
    this.textSearchAssing$.next(this.textSearchAssing);
  }

  */
}
