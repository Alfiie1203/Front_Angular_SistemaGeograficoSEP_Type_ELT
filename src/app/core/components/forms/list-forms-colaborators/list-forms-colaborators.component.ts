import { Component, OnInit, ViewChild } from '@angular/core';
import { Form, ListForm, ListPeriod, Period } from '../../../interfaces/form';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from '../../../../../environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { ShowMessageService } from '../../../services/show-message.service';
import { EventService } from '../../../services/event.service';
import { StorageService } from '../../../services/storage.service';
import { ViewportScroller } from '@angular/common';
import { User, Rol } from '../../../interfaces/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-list-forms-colaborators',
  templateUrl: './list-forms-colaborators.component.html',
  styleUrls: ['./list-forms-colaborators.component.scss'],
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
export class ListFormsColaboratorsComponent implements OnInit {
  dataSource = new MatTableDataSource<Form>();
  columnsToDisplay = ['select', 'code_form', 'date', 'actions', 'more'];
  expandedElement!: Form;
  selection = new SelectionModel<Form>(true, []);
  selectedRowIndex = -1;
  display = false;
  displayConfirm = false;
  enterprise!: Form;
  formEmail!: FormGroup;
  listData!: ListForm;
  textSearch = '';
  expandStatus = false;
  loading = false;
  pagination = 10;
  listSize = 0;
  path = environment.path;
  pageIndex = 0;
  loadData = false;
  filterValue = '';
  filterValue$ = new Subject<String>();
  active = '';
  direction = '';
  displayAssing = false;
  display2 = false;
  display3 = false;
  data: any;
  role!: Rol;
  sendData: any;
  displayEmail = false;
  assingDataRoute = false;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang: any;

  listCompany = [];
  listAssingCompany = [];
  lisCompanyRes: any = [];

  period!: any;
  period$= new Subject<any>();
  listPeriod!: Period[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  form!: FormGroup;

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
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
    this.createForm();
    this.createFormSend();
    this.aRoute.data.subscribe((data: any) => {
      if (data) {
        if (data.assing) {
          this.assingDataRoute = true;
          this.columnsToDisplay = ['select', 'code_form', 'date', 'assing'];
        }
      }
    });
  }

  ngOnInit(): void {
    this.getLang();
    this.loadEventService.loadEvent.emit(true);
    this.getPermissions();

    this.filterValue$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list();
    });
    this.period$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list();
    });
    // this.removeAccent();
    this.list();
    this.getListPeriod();
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
      this.list();
    });
  }

  getCompanies() {
    this.apiService
      .getResponse(
        'GET',
        `formulario/listcompanies/?proforestform=${this.data.id}`
      )
      .then(
        (res: any) => {
          this.listCompany = res.list_companies;
          this.form
            .get('assigned_company')
            ?.setValue(res.list_selected_companies);
          this.display2 = true;
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

  getPermissions() {
    this.storageService.get('keyData').then((resp: User) => {
      this.role = resp.role!;
      this.permissionAdd =
        resp.permissions.indexOf('proforestform.add_proforestform') > -1;
      this.permissionChange =
        resp.permissions.indexOf('proforestform.change_proforestform') > -1;
      this.permissionDelete =
        resp.permissions.indexOf('proforestform.delete_proforestform') > -1;
      this.permissionView =
        resp.permissions.indexOf('proforestform.view_proforestform') > -1;
    });
  }

  list() {
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    this.apiService
      .getResponse(
        'GET',
        `proforestform/list/?limit=${this.pagination}&name=${
          this.filterValue
        }&active=${this.active}&direction=${this.direction}&period_id=${
          this.period ? this.period.id : ''
        }`
      )
      .then(
        (resp: ListForm) => {
          this.listData = resp;
          this.listSize = resp.count;
          this.dataSource = new MatTableDataSource<Form>(this.listData.results);
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
      (resp: ListForm) => {
        this.listData = resp;
        this.dataSource = new MatTableDataSource<Form>(this.listData.results);
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
      (resp: ListForm) => {
        this.listData = resp;
        this.dataSource = new MatTableDataSource<Form>(this.listData.results);
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
    this.router.navigate(['forms/list-forms/register-forms'], {
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

  toAssing(data: any) {
    this.data = undefined;
    this.data = data;
    this.getCompanies();
  }

  cancelAssing() {
    this.display2 = false;
    // this.listCompany = [];
    this.form.get('assigned_company')?.setValue('');
  }

  assignedCompany() {
    this.validateForm();
    if (this.form.valid) {
      this.loading = true;
      this.assingData();
      this.apiService
        .getResponse('POST', `formulario/asign/`, this.sendData)
        .then(
          () => {
            this.loading = false;
            this.display2 = false;
            this.displayAssing = true;
            this.list();
            this.form.get('assigned_company')?.setValue('');
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
    } else {
      this.validateForm();
    }
  }

  assingData() {
    this.sendData = {
      proforestform: this.data.id,
      assigned_companies: this.form.get('assigned_company')!.value,
    };

    // this.sendData.assigned_companies.push();
  }

  addCompany() {
    this.form.get('assigned_company')?.value;
  }

  suplyBase(ev: Event, pos: number) {
    const chk = (<HTMLInputElement>ev.target).checked;
    this.form.get('assigned_company')!.value[pos].supply_base = chk;
  }

  createForm() {
    this.form = this.fb.group({
      assigned_company: ['', Validators.required],
    });
  }

  validateForm() {
    return Object.values(this.form.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((control) =>
          control.markAsTouched()
        );
      } else {
        control.markAsTouched();
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  showAccept() {
    this.displayConfirm = true;
  }

  listTreatment() {
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
    // console.log('this.textSearch', this.textSearch)
    this.filterValue$.next(this.filterValue)
    // this.list();
  }

  filterObject() {
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

  removeAccent() {
    this.dataSource.filterPredicate = (data: Form, filter: string): boolean => {
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

  getListSendCompany() {
    this.apiService
      .getResponse('GET', `formulario/listcompanies/noresponsable/`)
      .then(
        (resp: any) => {
          this.lisCompanyRes = resp.list_companies;
          this.display2 = false;
          this.display3 = true;
        },
        (error) => {
          this.display2 = false;
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

  createFormSend() {
    this.formEmail = this.fb.group({
      company: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
    });
  }

  validateFormSend() {
    return Object.values(this.formEmail.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((control) =>
          control.markAsTouched()
        );
      } else {
        control.markAsTouched();
      }
    });
  }

  get fS() {
    return this.formEmail.controls;
  }

  sendEmailForm() {
    this.loading = true;
    const tempData = {
      proforestform: this.data.id,
      assigned_companies: [
        {
          id_company: this.formEmail.get('company')?.value.id,
          email: this.formEmail.get('email')?.value,
          supply_base: false,
        },
      ],
    };
    this.apiService
      .getResponse('POST', `formulario/asign/formemailcompany`, tempData)
      .then(
        (resp: any) => {
          this.display3 = false;
          this.displayEmail = true;
          this.loading = false;
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

  filterPeriod(){
    this.period$.next(this.period.id);
  }

  clear() {
    this.active = '';
    this.direction = '';
    this.filterValue = '';
    this.textSearch = '';
    this.period = undefined;
    this.list();
  }
}
