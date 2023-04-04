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
  Business,
  Commodity,
  ListCommodity,
} from 'src/app/core/interfaces/business';
import { DatePipe } from '@angular/common';
import { PrimeNGConfig } from 'primeng/api';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
  selector: 'app-assign-company-verify',
  templateUrl: './assign-company-verify.component.html',
  styleUrls: ['./assign-company-verify.component.scss'],
    animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AssignCompanyVerifyComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  listSize = 0;
  /*  Material pagination */
  length = 0;
  totalElements: number = 0;
  pageIndex = 0;
  pageSize = 10;
  initPSize: number = this.pageSize;
  pageSizeOptions: number[] = [10,50, 100, 500];
  OFFSET: number = 0;
  pagination: any;
  assingMassive=0;
  /*  Material pagination */
  displayedColumns: string[] = [
    'name',
    'commodity',
    'actor_type',
    'action',
    'more'
  ];

    expandedElement!: any;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang: any;

  listData: any;
  displayConfirm = false;
  loading = false;
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

  dataSource: MatTableDataSource<Business> = new MatTableDataSource();
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
    
    
    this.nameSubs = this.name$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
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
    //this.getAsignadoA();
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
      const _url = `coordinates/view/verification/company/list/?limit=${this.pageSize}&offset=${this.OFFSET}&name=${
        this.name ? this.name : ''
      }&actor_type=${
        this.actor_type ? this.actor_type.id : ''
      }&commodity=${
        this.commodity ? this.commodity.id : ''}`;

      this.loadEventService.loadTableEvent.emit(true);
      let url = `coordinates/view/validation/company/list/?limit=${this.pageSize}&offset=${this.OFFSET}`;
      this.apiService.getResponse('GET', _url).then(
        (resp: any) => {
         // console.log('resp', resp)
          this.btnUpdate = this.translate.instant('update');
          this.btnAssign = this.translate.instant('to_assign');
          if (resp && resp.results) {
            this.listData = resp;
            this.listSize = resp.count;
            this.dataSource = new MatTableDataSource<Business>(
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
      let url = `coordinates/verificators/list/?limit=${this.pageSizeV}&offset=${this.OFFSETV}`;
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
    let start_date_validation = this.datepipe.transform(
      new Date(this.range_date_validation[0]),
      'yyyy-MM-dd'
    );
    let end_date_validation = this.datepipe.transform(
      new Date(this.range_date_validation[1]),
      'yyyy-MM-dd'
    );
    const dataSend: any = {
      validator_user:validator,
      start_date_validation:start_date_validation,
      end_date_validation:end_date_validation
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
   // console.log('dataSend', dataSend)
    //coordinates/asign/companyverificator/8/
    // const url = `coordinates/asign/companyverificator/${this.company.id}/`;
    let url = '';
    let method:any='';
    if(this.assingMassive==0){
      url = `coordinates/asign/companyverificator/${this.company.id}/`;
      method = 'PATCH'
    }else if(this.assingMassive==1){
      url = `coordinates/asign/list/company/verificator/`;
      method = 'POST'
      dataSend.commodity=this.commodity?this.commodity.id:'';
      dataSend.actor_type=this.actor_type?this.actor_type.id:'';
      dataSend.name=this.name;
    }
    let getToken: any;
    this.loading=true;

    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);
      this.apiService.getResponse(method, url, dataSend).then(
        (resp: any) => {
          let asignado = this.translate.instant('asigned');
          // if (resp && resp.id > 0) {
            let type = resp.id == 0 ? 'warn' : 'success';
            this.showMessage.show(
              'success',
              this.translate.instant("attention"),
              this.translate.instant("verify_assing"),
              'pi pi-exclamation-triangle'
            );
            this.cancelValidator();
            this.list();
          // }
          this.errorMessageV = '';
          this.errorV = false;
          this.loading=false;
        },
        (error) => {
          this.errorMessageV = '';
          this.errorV = false;
          this.loading=false;
          
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
      ).finally( ()=>{
        this.errorMessageV = '';
          this.errorV = false;
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
      } );
    }
  }
  cancelValidator() {
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
  applyFilterPeriod() {
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

  searchCommodity(event: Event) {
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
  searchActorType(event: Event) {
    this.filterActorType$.next(this.actor_type);
  }
  searchStatusRevision(event: Event) {
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
  assignValidator(event: Event, op_en: any, massive:any) {
    if (!this.listData || (this.listData && this.listData.results == 0)) {
      this.errorV = true;
      this.errorMessageV = 'no_selected_company';
      op_en.toggle(event);
      return;
    }
    this.getValidators();
    this.companies = this.listData;    
    this.assingMassive = massive;
    this.displayConfirm = true;
  }

  setCompany(company: any,massive:any) {
    this.getValidators();
    this.company = company;
    this.assingMassive = massive;
    this.displayConfirm = true;
  }

  clearRangeDate() {
    this.range_date_validation = [];
  }
  /********Filtros */
  confirmValidator(event: Event, op_en: any) {

    
    let selectedValidator: validatorsI;
    selectedValidator = this.validators.filter((el) => el.checked == true)[0];
        let selectedValidator_:any=[]; 
      this.validators.forEach((el) => {
        if(el.checked == true){
          selectedValidator_.push(el.id)
        }
      });
      
    if (!this.company && this.assingMassive == 0) {
      this.errorV = true;
      this.errorMessageV = 'no ha seleccionado ninguna empresa';
      op_en.toggle(event);
      return;
    }
    // console.log("confirmValidator company:",this.company);
    
    if (selectedValidator_.length==0) {
      this.errorMessageV = 'no_selected_validator';
      op_en.toggle(event);
      this.errorV = true;
    }
    // console.log("confirmValidator validator:",selectedValidator);
    if (selectedValidator_.length==0) {
      let companyvalidator = this.company.id;
      let validatorUser = selectedValidator.id;
    }
    if (
      this.range_date_validation &&
      (!this.range_date_validation[0] || !this.range_date_validation[1])
    ) {
      this.errorV = true;
      this.errorMessageV = 'set_the_dates';
      op_en.toggle(event);
      return;
    }
    let start_date_validation = this.datepipe.transform(
      new Date(this.range_date_validation[0]),
      'yyyy-MM-dd'
    );
    let end_date_validation = this.datepipe.transform(
      new Date(this.range_date_validation[1]),
      'yyyy-MM-dd'
    );
    this.errorV = false;
    this.errorMessageV = '';
    this.saveValidator(selectedValidator_, event, op_en);
    
    
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

    expand(element:any){
    this.expandedElement = this.expandedElement === element ? null : element;
  }
}