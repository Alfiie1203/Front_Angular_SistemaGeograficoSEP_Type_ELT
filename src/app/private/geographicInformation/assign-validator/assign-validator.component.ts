import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, ViewportScroller } from '@angular/common';
import { StorageService } from 'src/app/core/services/storage.service';
import { User } from 'src/app/core/interfaces/user';
import { ApiService } from 'src/app/core/services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import {
  CoordinateAdminList,
  CoordinatesResults,
  TraceabilityList,
} from 'src/app/core/interfaces/geographicInformationI';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EventService } from 'src/app/core/services/event.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  ActorType,
  Commodity,
  ListCommodity,
} from 'src/app/core/interfaces/business';
import { DatePipe } from '@angular/common';
import { PrimeNGConfig } from 'primeng/api';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';


export interface validatorsI {
  id: number;
  full_name: string;
  checked: boolean;
}

export interface validators2I {
  id: number;
  full_name: string;
  checked: boolean;
}

@Component({
  selector: 'app-assign-validator',
  templateUrl: './assign-validator.component.html',
  styleUrls: ['./assign-validator.component.scss'],
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
export class AssignValidatorComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  listSize = 0;
  /*  Material pagination */
  length = 0;
  totalElements: number = 0;
  pageIndex = 0;
  pageSize = 50;
  initPSize: number = this.pageSize;
  pageSizeOptions: number[] = [this.initPSize, 100, 500];
  OFFSET: number = 0;
  pagination: any;
  /*  Material pagination */
  displayedColumns: string[] = [
    'reported_company',
    'supplier_company',
    // 'reported_user',
    'estado',
    'year',
    'period',
    'more'
  ];

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  loading = false;
  lang: any;

  listData: any;
  displayConfirm = false;
  company: any = null;
  validators: Array<validatorsI> = [];
  validatorsBTN: boolean = false;
  validatorsCount: number = 0;
  pageSizeV = 10;
  listSizeV = 0;
  OFFSETV: number = 0;
  pageSizeOptionsV: number[] = [10, 25, 100];

  loadV = true;

  errorV: boolean = false;
  errorMessageV: string = '';

  dataSource: MatTableDataSource<TraceabilityList> = new MatTableDataSource();
  btnUpdate: string = '';
  btnAssign: string = '';

  constructor(
    public location: Location,
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private translate: TranslateService,
    private showMessage: ShowMessageService,
    public datepipe: DatePipe,
    private config: PrimeNGConfig
  ) {
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
    this.getLang();
    this.periodoSubs = this.periodo$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response: any) => {
        this.list();
      });
    this.yearSubs = this.year$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response: any) => {
        this.list();
      });
    this.filterCommoditySubs = this.filterCommodity$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.list();
      });
    this.filterActorTypeSubs = this.filterActorType$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.list();
      });
    this.nameSubs = this.name$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.list();
      });
    this.statusRevisionSubs = this.statusRevision$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.list();
      });
    this.asignadoASubs = this.asignadoA$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.list();
      });

    this.getListCommodity();
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  /********Filtros */
  companies: Array<any> = [];
  listPeriod: any[] = [
    {
      id: 0,
      name: 'ANNUAL',
    },
    {
      id: 1,
      name: 'BIANNUAL_1',
    },
    {
      id: 2,
      name: 'BIANNUAL_2',
    },
  ];
  periodo: any = '';
  periodo$ = new Subject<string>();
  periodoSubs: Subscription | undefined;
  actor_type: any;
  filterActorType$ = new Subject<string>();
  filterActorTypeSubs: Subscription | undefined;

  year: any = '';
  year$ = new Subject<string>();
  yearSubs: Subscription | undefined;

  commodity: any;
  filterCommodity$ = new Subject<string>();
  filterCommoditySubs: Subscription | undefined;

  listCommodity!: Commodity[];
  listActorType!: ActorType[];

  status_revision: any = '';
  statusRevision$ = new Subject<string>();
  statusRevisionSubs: Subscription | undefined;
  listStatusRevision: any = [
    {
      id: 'SR',
      name: 'SELFREPORTED',
    },
    {
      id: 'NV',
      name: 'NOTVALIDATED',
    },
    {
      id: 'VA',
      name: 'VALIDATED',
    },
    {
      id: 'NVE',
      name: 'NOTVERIFIED',
    },
    {
      id: 'VE',
      name: 'VERIFIED',
    },
  ];
  listStatusCodes: any = {
    SR: {
      name: 'SELFREPORTED',
    },
    NV: {
      name: 'NOTVALIDATED',
    },
    VA: {
      name: 'VALIDATED',
    },
    NVE: {
      name: 'NOTVERIFIED',
    },
    VE: {
      name: 'VERIFIED',
    },
  };
  biannual: any = {
    0: 'ANNUAL',
    1: 'BIANNUAL_1',
    2: 'BIANNUAL_2',
  };
  asignado_a: any = '';
  asignadoA$ = new Subject<string>();
  asignadoASubs: Subscription | undefined;
  listAsignadoA!: validators2I[];
  expandedElement:any;
  name: any = '';
  name$ = new Subject<string>();
  nameSubs: Subscription | undefined;

  textSearch: string = '';
  textSearchV: string = '';
  textSearchV$ = new Subject<string>();

  range_date_validation: Array<any> = [];
  /********Filtros */
  ngOnInit(): void {
    this.config.setTranslation(this.calendar_es);
    this.list();
    this.getAsignadoA();
    this.textSearchV$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        if (this.displayConfirm) {
          this.getValidators();
        }
      });
  }
  ngOnDestroy() {
    if (this.periodoSubs) {
      this.periodoSubs.unsubscribe();
    }
    if (this.yearSubs) {
      this.yearSubs.unsubscribe();
    }
    if (this.filterCommoditySubs) {
      this.filterCommoditySubs.unsubscribe();
    }
    if (this.filterActorTypeSubs) {
      this.filterActorTypeSubs.unsubscribe();
    }
    if (this.nameSubs) {
      this.nameSubs.unsubscribe();
    }
    if (this.statusRevisionSubs) {
      this.statusRevisionSubs.unsubscribe();
    }
    if (this.asignadoASubs) {
      this.asignadoASubs.unsubscribe();
    }
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
    });
  }
  async list() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      const _url = `coordinates/view/validation/traceability/list/?name=${
        this.name ? this.name : ''
      }&actor_type=${this.actor_type ? this.actor_type.id : ''}&commodity=${
        this.commodity ? this.commodity.id : ''
      }&limit=${this.pageSize}&offset=${this.OFFSET}&period=${
        this.periodo ? this.periodo.id : ''
      }&year=${this.year ? this.year : ''}&validator_id=${
        this.asignado_a ? this.asignado_a.id : ''
      }&status_revision=${this.status_revision ? this.status_revision.id : ''}`;

      this.loadEventService.loadTableEvent.emit(true);
      let url = `coordinates/view/validation/company/list/?limit=${this.pageSize}&offset=${this.OFFSET}`;
      this.apiService.getResponse('GET', _url).then(
        (resp: any) => {
          this.btnUpdate = this.translate.instant('update');
          this.btnAssign = this.translate.instant('to_assign');
          if (resp && resp.results) {
            this.listData = resp;
            this.listSize = resp.count;
            this.dataSource = new MatTableDataSource<TraceabilityList>(
              this.listData.results
            );
          }
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
  }
  async getAsignadoA() {
    const url = `coordinates/general/colaborators/list/`;
    this.apiService.getResponse('GET', url).then(
      (resp: any) => {
        let sin_asignar = this.translate.instant('sin_asignar');
        let defValue = {
          full_name: sin_asignar,
          group: '',
          id: 0,
        };
        let data: any = [defValue];
        data = data.concat(resp.results);
        this.listAsignadoA = data;
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
  async getValidators() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));
    if (getToken) {
      this.loadV = true;
      let url = `coordinates/validators/list/?limit=${this.pageSizeV}&offset=${this.OFFSETV}`;
      this.apiService.getResponse('GET', url).then(
        (resp: any) => {
          if (resp && resp.results) {
            this.validators = [];
            let validators: Array<validatorsI> = resp.results;
            this.listSizeV = resp.count;
            validators.forEach((item) => {
              this.validators.push({
                id: item.id,
                full_name: item.full_name,
                checked: false,
              });
            });
            this.validatorsCount = resp.count;
          }
          this.loadV = false;
        },
        (error) => {
          this.loadV = false;
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
  }

  closeValidator() {
    this.company = null;
    this.displayConfirm = false;
    this.validators = [];
    this.validatorsCount = 0;
  }

  async saveValidator(validator: validatorsI, event: Event, op_en: any) {
    const dataSend: any = {
      commodity: this.commodity ? this.commodity.id : '',
      period: this.periodo ? this.periodo.id : '',
      year: this.year ? this.year : '',
      name: this.name ? this.name : '',
      revisor_id: validator,
      start_date_validation: this.datepipe.transform(
        new Date(this.range_date_validation[0]),
        'yyyy-MM-dd'
      ),
      end_date_validation: this.datepipe.transform(
        new Date(this.range_date_validation[1]),
        'yyyy-MM-dd'
      ),
      status_revision: this.status_revision ? this.status_revision.id : '',
      validator_id: this.asignado_a ? this.asignado_a.id : '',
      actor_type: this.actor_type ? this.actor_type.id : '',
    };
    let paramsUrl = ``;
    let separator = `?`;
    for (let key in dataSend) {
      paramsUrl += `${separator}${key}=${dataSend[key]}`;
      separator = `&`;
    }
    let data = {
      validator_user: validator.id,
      deadline_validation: this.range_date_validation[0],
    };
    const url = `coordinates/asign/validation/traceability/list/`;
    this.loading = true;
    let getToken: any;

    //console.log('dataSend', dataSend)
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);
      this.apiService.getResponse('POST', url, dataSend).then(
        (resp: any) => {
          let asignado = this.translate.instant('asigned');
          if (resp && resp.results) {
            let type = resp.asignado == 0 ? 'warn' : 'success';
            this.showMessage.show(
              type,
              this.translate.instant('attention'),
              this.translate.instant('velidator_assing'),
              'pi pi-exclamation-triangle'
            );
            this.cancelValidator();
            this.list();
          }
          this.clear()
          this.errorMessageV = '';
          this.errorV = false;
          this.loading = false;
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        },
        (error) => {
          this.errorMessageV = '';
          this.errorV = false;
          this.loading = false;
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
  }
  cancelValidator() {
    this.loading = false;
    this.displayConfirm = false;
    this.textSearchV = '';
    this.clearRangeDate();
    this.validators.forEach((e) => {
      e.checked = false;
    });
  }
  confirmValidatorChange(id: number) {
    this.validatorsBTN = true;
    this.validators.forEach((e) => {
      if (id == e.id) {
        if(e.checked){
          e.checked=false;
        }else{
          e.checked=true;
        }
      }
    });
  }
  paginationChangeSize(e: PageEvent) {
    let offset = e.pageIndex * this.pageSize;
    if (offset >= this.listSize) {
      return;
    }
    this.OFFSET = offset;
    this.pageSize = e.pageSize;
    this.list();
  }
  applyFilterV(event: Event) {
    this.textSearchV$.next(this.textSearchV);
  }

  paginationValidatorsChangeSize(e: PageEvent) {
    let offset = e.pageIndex * this.pageSizeV;
    if (offset >= this.listSizeV) {
      return;
    }
    this.OFFSETV = offset;
    this.pageSizeV = e.pageSize;
    this.getValidators();
  }

  //setCompany
  /********Filtros */
  applyFilterPeriod(data:any=null) {
    this.periodo = data;
    this.periodo$.next(this.periodo);
  }
  applyFilterYear() {
    let year = new Date(this.year).getFullYear();
    this.year = year.toString();
    this.year$.next(this.year);
  }
  clearYear() {
    this.year = '';
    this.year$.next(this.year);
  }

  searchCommodity(event: any) {
    this.commodity = event;
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
  searchActorType(event: any) {
    this.actor_type = event;
    this.filterActorType$.next(this.actor_type);
  }
  searchStatusRevision(event: any) {
    this.status_revision = event;
    this.statusRevision$.next(this.status_revision);
  }
  searchAsignadoA(event: Event) {
    this.asignadoA$.next(this.asignado_a);
  }

  applyFilter(event: Event) {
    this.name$.next(this.name);
  }
  clear() {
    this.name = '';
    this.year = null;
    this.periodo = null;
    this.commodity = null;
    this.actor_type = null;
    this.listActorType = [];
    this.asignado_a = null;
    this.status_revision = null;
    this.listCommodity = [];
    this.getListCommodity();
    this.list();
  }
  assignValidator(event: Event, op_en: any) {
    if (!this.listData || (this.listData && this.listData.results == 0)) {
      this.errorV = true;
      this.errorMessageV = 'no_selected_company';
      op_en.toggle(event);
      return;
    }
    this.getValidators();
    this.companies = this.listData;
    this.displayConfirm = true;
  }

  setCompany(company: any) {
    this.getValidators();
    this.company = company;
    this.displayConfirm = true;
  }

  clearRangeDate() {
    this.range_date_validation = [];
  }
  /********Filtros */
  confirmValidator(event: Event, op_en: any) {
    if (
      this.range_date_validation &&
      (!this.range_date_validation[0] || !this.range_date_validation[1])
    ) {
      this.errorV = true;
      this.errorMessageV = 'set_the_dates';
      op_en.toggle(event);
      return;
    }
    if (!this.listData && this.listData && this.listData.results.length == 0) {
      this.errorV = true;
      this.errorMessageV = 'no ha seleccionado ninguna empresa';
      op_en.toggle(event);
      return;
    }
    this.errorV = false;
    this.errorMessageV = '';
    let selectedValidator: validatorsI;
    let selectedValidator_:any=[]; 
    this.validators.forEach((el) => {
      if(el.checked == true){
        selectedValidator_.push(el.id)
      }
    });
    selectedValidator = this.validators.filter((el) => el.checked == true)[0];
    if (selectedValidator_.length>0) {
      if (this.range_date_validation) {
        if (!this.range_date_validation[0] || !this.range_date_validation[1]) {
          this.errorV = true;
          this.errorMessageV = 'set_the_dates';
          op_en.toggle(event);
          return;
        }
      } else {
        this.errorV = true;
        this.errorMessageV = 'set_the_dates';
        op_en.toggle(event);
        return;
      }
      this.saveValidator(selectedValidator_, event, op_en);
    } else {
      this.errorMessageV = 'no_selected_validator';
      op_en.toggle(event);
      this.errorV = true;
    }
  }

  calendar_es = {
    closeText: 'Cerrar',
    prevText: 'Anterior',
    nextText: 'Siguiente',
    monthNames: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    monthNamesShort: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
    dayNames: [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
    weekHeader: 'Semana',
    firstDay: 0,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: '',
    timeOnlyTitle: 'Solo hora',
    timeText: 'Tiempo',
    hourText: 'Hora',
    minuteText: 'Minuto',
    secondText: 'Segundo',
    currentText: 'Fecha actual',
    ampm: false,
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    allDayText: 'Todo el día',
  };

  expand(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

}