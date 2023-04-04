import { Component, OnInit, ViewChild } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'src/environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { ShowMessageService } from '../../core/services/show-message.service';
import { EventService } from '../../core/services/event.service';
import { StorageService } from '../../core/services/storage.service';
import { ViewportScroller } from '@angular/common';
import {
  ListTracebility,
  Tracebility,
} from 'src/app/core/interfaces/tracebility';
import { User } from '../../core/interfaces/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import {
  City,
  Country,
  GeocoderAddress,
  Region,
} from 'src/app/core/interfaces/cities';
import { GooglemapsService } from 'src/app/core/services/googlemaps.service';
import {
  ActorType,
  Commodity,
  ListCommodity,
} from 'src/app/core/interfaces/business';
import { Location } from '@angular/common';
import { markerDataInfoI } from '../supply-base/supply-base-view/supply-base-view.component';

export interface myCompanyI {
  id: number;
  name_company: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-tracebility',
  templateUrl: './tracebility.component.html',
  styleUrls: ['./tracebility.component.scss'],
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
export class TracebilityComponent implements OnInit {
  /********Google Map******** */
  listCountry!: Country[];
  listRegions!: Region[];
  listCities!: City[];
  listCommodity!: Commodity[];
  listActorType!: ActorType[];
  @ViewChild(GoogleMap) googleMap!: GoogleMap;
  options!: google.maps.MapOptions;
  position: any;
  traceabilities: Array<any> = [];
  positionList: Array<any> = [];
  map_form: FormGroup = <FormGroup>{};
  @ViewChild(MapInfoWindow, { static: false }) info!: MapInfoWindow;
  supplyBaseL2List = {
    id: 0,
    data: [],
  };
  myCompany!: myCompanyI;
  /********Google Map******** */

  lang: any;

  dataSource = new MatTableDataSource<Tracebility>();
  columnsToDisplay = [
    'name',
    'supplier_company',
    'year',
    'type_actor',
    'actions',
    'more'
  ];
  expandedElement!: Tracebility;
  selection = new SelectionModel<Tracebility>(true, []);
  selectedRowIndex = -1;
  display = false;
  displayConfirm = false;
  enterprise!: Tracebility;
  listData!: ListTracebility;
  textSearch = '';
  created_at__gte = '';
  created_at__lte = '';
  expandStatus = false;
  loading = false;
  pagination = 10;
  listSize = 0;
  path = environment.path;
  pageIndex = 0;
  loadData = false;
  displayFilter = false;
  filterValue = '';
  active = '';
  direction = '';
  role: string = '';
  offset: number = 0;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  permissionExport = false;
  sendData: any = {
    search: '',
    year: '',
    period: '',
  };
  formatos: Array<any> = [
    {
      id: 0,
      name: 'csv',
    },
    {
      id: 1,
      name: 'xls',
    },
    {
      id: 2,
      name: 'xlsx',
    },
  ];
  formato: any;
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  form: FormGroup = <FormGroup>{};
  colombiaCenter = {
    lat: 5.50705835241824,
    lng: -74.24603021021836,
  }
  constructor(
    private router: Router,
    private translate: TranslateService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private loadEventService: EventService,
    private storageService: StorageService,
    private readonly viewport: ViewportScroller,
    private formBuilder: FormBuilder,
    private gMapsService: GooglemapsService,
    public location: Location
  ) {
    (async () => {
      await this.getPermissions();
      //await this.getMyCompany();

      if(this.role == "COLABORADOR"){
        this.getCompanyList();
        this.position = this.colombiaCenter;
        this.options = {
          center: this.position,
          zoom: 6,
        };
      }else{
        await this.getMyCompany();
        this.position = {
          lat: this.myCompany.latitude,
          lng: this.myCompany.longitude,
        };
        this.options = {
          center: this.position,
          zoom: 6,
        };
        this.initMap();
      }      
    })();

    this.getListCommodity();
    this.createMapForm();
    this.getLang();
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
  }
  companyList:Array<myCompanyI> = [];
  async getCompanyList(){
    //company/company/list/?limit=10&name=&active=&direction=&commodity=&actor_type=
    const url = `company/company/list/?limit=10000&name=&active=&direction=&commodity=&actor_type=`;
    await new Promise((resolve) => {
      this.apiService
        .getResponse('GET', url)
        .then(
          (resp: any) => {
            if(resp && resp.results){
              let result:Array<any> = resp.results;
              this.companyList = [];
              result.forEach(item=>{
                let data:myCompanyI;
                data = {
                  id:item.id,
                  latitude:item.latitude,
                  longitude:item.longitude,
                  name_company:item.name
                }
                this.companyList.push(data);
              });

            }
            //this.initMap();
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
        )
        .finally(() => {
          resolve(true);
        });
    });
  }
  selectCompany(){
    //this.myCompany
    //this.initMap()
  }
  periodo:any = null;

  async getMyCompany() {
    await new Promise((resolve) => {
      this.apiService
        .getResponse('GET', 'traceability/mycompany/')
        .then(
          (resp: myCompanyI) => {
            this.myCompany = resp;
            this.initMap();
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
        )
        .finally(() => {
          resolve(true);
        });
    });
  }

  ngOnInit(): void {
    this.createForm();
    this.loadEventService.loadEvent.emit(true);
    
    // this.removeAccent();
    this.list();
    //this.initMap();
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  formCreated_at__gteSubs: Subscription | undefined;
  formCreated_at__lteSubs: Subscription | undefined;
  formSearchSubs: Subscription | undefined;
  createForm() {
    this.form = this.formBuilder.group({
      search: [''],
      year: [''],
      period: [''],
    });
    this.formCreated_at__gteSubs = this.form
      .get('year')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.filterList();
      });
    this.formCreated_at__lteSubs = this.form
      .get('period')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.filterList();
      });
    this.formSearchSubs = this.form
      .get('search')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.filterList();
      });

     
  }

  ngOnDestroy() {
    if (this.formCreated_at__gteSubs) {
      this.formCreated_at__gteSubs.unsubscribe();
    }
    if (this.formCreated_at__lteSubs) {
      this.formCreated_at__lteSubs.unsubscribe();
    }
    if (this.formSearchSubs) {
      this.formSearchSubs.unsubscribe();
    }
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

  async getPermissions() {
    await this.storageService.get('keyData').then((resp: User) => {
      let ROLE: any = resp.role;
      this.role = ROLE.name;
      this.permissionAdd =
        resp.permissions.indexOf('traceability.add_traceability') > -1;
      this.permissionChange =
        resp.permissions.indexOf('traceability.change_traceability') > -1;
      this.permissionDelete =
        resp.permissions.indexOf('traceability.delete_traceability') > -1;
      this.permissionView =
        resp.permissions.indexOf('traceability.view_traceability') > -1;
      this.permissionExport =
        resp.permissions.indexOf('traceability.export_traceability') > -1;
    });
  }

  list() {
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    this.apiService
      .getResponse(
        'GET',
        `traceability/list/?limit=${this.pagination}&offset=${this.offset}&year=${this.sendData.year}&period=${this.sendData.period}&search=${this.sendData.search}`
      )
      .then(
        (resp: ListTracebility) => {
          this.listData = resp;
          this.listSize = resp.count;
          this.dataSource = new MatTableDataSource<Tracebility>(
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
      (resp: ListTracebility) => {
        this.listData = resp;
        this.dataSource = new MatTableDataSource<Tracebility>(
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
      (resp: ListTracebility) => {
        this.listData = resp;
        this.dataSource = new MatTableDataSource<Tracebility>(
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

  edit(element: any) {
    this.router.navigate(['/tracebility/create-edit-tracebility'], {
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
      .getResponse('DELETE', `traceability/destroy/${this.enterprise}/`)
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
    this.offset = e.pageIndex;
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
    // this.dataSource.sortingDataAccessor = (row:Tracebility,columnName:string) : string => {
    //   if(columnName=="type_actor") return row.actor_type.name;
    //   var columnValue = row[columnName as keyof Tracebility] as string;
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
    this.list();
  }

  filterList() {
    this.sendData = this.form.value;
    if (!this.sendData) {
      return;
    }
    if(!this.sendData.year){
      this.sendData.year = "";
    }else
    this.sendData.year = new Date(this.sendData.year).getFullYear();
    if(this.sendData.period){
      this.sendData.period = this.sendData.period.id;
    }else{
      this.sendData.period = "";
    }
    
    this.list();
  }
  formatDate(_date: string) {
    if (!_date) {
      return '';
    }
    let date = new Date(_date);
    return (
      [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        this.padTo2Digits(date.getHours()),
        this.padTo2Digits(date.getMinutes()),
        this.padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }
  padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  filterObject() {
    // this.dataSource.filterPredicate = (data:Tracebility, filter) => {
    //   return data.name.toLocaleLowerCase().includes(filter) ||
    //     data.nit.toLocaleLowerCase().includes(filter) ||
    //     data.identifier_global_company.toLocaleLowerCase().includes(filter) ||
    //     data.identifier_proforest_company.toLocaleLowerCase().includes(filter) ||
    //     data.commodity.name.toLocaleLowerCase().includes(filter) ||
    //     data.company_group.name.toLocaleLowerCase().includes(filter) ||
    //     data.country.name.toLocaleLowerCase().includes(filter) ||
    //     data.region.name.toLocaleLowerCase().includes(filter) ||
    //     data.city.name.toLocaleLowerCase().includes(filter) ||
    //     data.actor_type.name.toLocaleLowerCase().includes(filter) ;
    // };
  }

  removeAccent() {
    this.dataSource.filterPredicate = (
      data: Tracebility,
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

  viewTraceability(id: number) {
    this.router.navigate(['traceability/view', id]);
  }
  async exportar(event: Event, op_en: any) {
    if (!this.formato) {
      op_en.toggle(event);
      return;
    }
    const url = `${environment.path}traceability/file/export/?year=${this.sendData.year}&period=${this.sendData.period}&search=${this.sendData.search}&_format_file=${this.formato.id}`;

    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));
    if (getToken) {
      return new Promise((resolve, reject) => {
        let headers = new Headers({
          Authorization: 'Bearer ' + getToken.access,
        });

        fetch(url, {
          method: 'GET',
          headers: headers,
        })
          .then((response) => response.blob())
          .then((data) => {
            let a = document.createElement('a');
            a.href = window.URL.createObjectURL(data);
            a.download = `trazabilidad_${new Date()
              .getFullYear()
              .toString()}_${new Date().getMonth().toString()}_${new Date()
              .getDate()
              .toString()}_${new Date().getHours().toString()}${new Date()
              .getMinutes()
              .toString()}`;
            a.click();
            resolve('success');
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      });
    }
  }

  linkByRole(): string {
    let url: string = '';
    if (this.role == 'COLABORADOR') {
      url = '/traceability/create-edit-traceability-admin';
    } else {
      url = '/traceability/create-edit-tracebility';
    }
    return url;
  }
  /********Google Map ***********/
  async getListCountry() {
    await new Promise((resolve) => {
      this.apiService
        .getResponse('GET', 'cities/countries/')
        .then(
          (resp: Country[]) => {
            this.listCities = [];

            this.listCountry = resp;
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
        )
        .finally(() => {
          resolve(true);
        });
    });
  }
  getListRegions(idContry: any) {
    let searchLocation = '';
    this.apiService
      .getResponse('GET', `cities/countries/${idContry}/regions/`)
      .then(
        async (resp: Region[]) => {
          this.listRegions = resp;
          this.listCities = [];
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
  getListCities(idCountry: any, idRegion: any) {
    let searchLocation = '';
    this.apiService
      .getResponse(
        'GET',
        `cities/countries/${idCountry}/regions/${idRegion}/cities/`
      )
      .then(
        async (resp: City[]) => {
          this.listCities = resp;
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

  resetAllSearcMap() {
    this.map_created_at__gte = '';
    this.map_created_at__lte = '';
    this.map_search = '';
    this.map_active = '';
    this.map_year = '';
    this.map_period = '';
    this.map_form.patchValue({
      map_created_at__gte: this.map_created_at__gte,
      map_created_at__lte: this.map_created_at__lte,
      map_search: this.map_search,
      map_active: this.map_active,
      map_year: null,
      map_period: this.map_period,
    });
    this.map_list = [];
    this.clearCountrySearchMap();
    this.clearCommoditySearchMap();
    this.displayFilter = false;
  }
  clearCountrySearchMap() {
    this.map_country = '';
    this.map_region = '';
    this.map_ciudad = '';
    this.map_form.patchValue({
      map_country: this.map_country,
      map_region: this.map_region,
      map_ciudad: this.map_ciudad,
    });
  }
  clearRegionSearchMap() {
    this.map_region = '';
    this.map_ciudad = '';
    this.map_form.patchValue({
      map_region: this.map_region,
      map_ciudad: this.map_ciudad,
    });
  }
  clearCitySearchMap() {
    this.map_ciudad = '';
    this.map_form.patchValue({
      map_ciudad: this.map_ciudad,
    });
  }
  clearCommoditySearchMap() {
    this.map_commodity = '';
    this.map_tipo_actor = '';
    this.map_form.patchValue({
      map_commodity: this.map_commodity,
      map_tipo_actor: this.map_tipo_actor,
    });
  }
  clearTipoActorSearchMap() {
    this.map_tipo_actor = '';
    this.map_form.patchValue({
      map_tipo_actor: this.map_tipo_actor,
    });
  }

  map_offset: number = 0;
  map_limit: number = 1000;
  map_created_at__gte: string = '';
  map_created_at__lte: string = '';
  map_search: string = '';
  map_active: string = ''; //id
  map_country: string = '';
  map_region: string = '';
  map_ciudad: string = '';
  map_commodity: string = '';
  map_tipo_actor: string = '';
  map_list: Array<any> = [];
  map_year: string = '';
  map_period: string = '';
  map_company_list: any = '';
  createMapForm() {
    this.map_form = this.formBuilder.group({
      map_created_at__gte: [''],
      map_created_at__lte: [''],
      map_year: [null],
      map_period: [''],
      map_search: [''],
      map_active: [''],
      map_country: [''],
      map_region: [''],
      map_ciudad: [''],
      map_commodity: [''],
      map_tipo_actor: [''],

      map_company_list: ['',[Validators.required]],
    });

    this.map_form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {

        if(this.role == "COLABORADOR"){
          if(!this.map_form.valid){
            Object.values(this.map_form.controls).forEach((control) => {
              if (control instanceof FormGroup) {
                Object.values(control.controls).forEach((control) =>
                  control.markAsTouched()
                );
              } else {
                control.markAsTouched();
              }
            });
            return;
          }
        }
        this.map_search = response.map_search;
        this.map_created_at__gte = response.map_created_at__gte;
        this.map_created_at__lte = response.map_created_at__lte;
        this.map_country = response.map_country ? response.map_country.id : '';
        this.map_region = response.map_region ? response.map_region.id : '';
        this.map_ciudad = response.map_ciudad ? response.map_ciudad.id : '';
        this.map_commodity = response.map_commodity
          ? response.map_commodity.id
          : '';
        this.map_tipo_actor = response.map_tipo_actor
          ? response.map_tipo_actor.id
          : '';
          this.map_year = response.map_year?(new Date(response.map_year).getFullYear()).toString():"";
          this.map_period =response.map_period?response.map_period.id:"";

          this.map_company_list = response.map_company_list
          ? response.map_company_list
          : '';
          
          if(this.role == "COLABORADOR"){
            if(this.map_company_list){
              this.myCompany = this.map_company_list;
              this.filterMap();
            }
          }else{
            this.filterMap();
          }
      });
    this.getListCountry();
  }
  filterMap() {
    let url = ``;
    //traceability/colaborator/list/
    //url: http://127.0.0.1:8000/traceability/list/?limit=10&created_at__gte=2022-12-07 00:00&created_at__lte=2022-12-15 00:00&search=cafe&active=id&direction=asc&pais=2&region=55&ciudad=6405&commodity=5&tipo_actor=24&offset=0
    if(this.role == "COLABORADOR"){
      this.position = {
        lat: this.myCompany.latitude,
        lng: this.myCompany.longitude,
      };
      this.options = {
        center: this.position,
        zoom: 6,
      };
      url = `traceability/collaborator/list/?id_company=${this.myCompany.id}&limit=${this.map_limit}&offset=${this.map_offset}&year=${this.map_year}&period=${this.map_period}&search=${this.map_search}&active=${this.map_active}&pais=${this.map_country}&region=${this.map_region}&ciudad=${this.map_ciudad}&commodity=${this.map_commodity}&tipo_actor=${this.map_tipo_actor}`;
    }else{
      url = `traceability/list/?limit=${this.map_limit}&offset=${this.map_offset}&year=${this.map_year}&period=${this.map_period}&search=${this.map_search}&active=${this.map_active}&pais=${this.map_country}&region=${this.map_region}&ciudad=${this.map_ciudad}&commodity=${this.map_commodity}&tipo_actor=${this.map_tipo_actor}`;
    }
    this.apiService.getResponse('GET', `${url}`).then(
      (resp: any) => {
        if (
          resp &&
          resp.count != undefined &&
          resp.results != undefined &&
          resp.results.length > 0
        ) {
          if (resp.results instanceof Array) {
            this.map_list = resp.results;
            this.setDataMap();
          } else {
            this.map_list = [];
            this.initMap();
          }
        } else {
          this.initMap();
          this.showMessage.show(
            'error',
            this.translate.instant('attention'),
            this.translate.instant('no_se_encuentran_resultado_para_su_busqueda'),
            'pi pi-exclamation-triangle'
          );
        }
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
  markerDataInfo: markerDataInfoI = this.setMarkerDataDafault();
  infoWindowData: any;
  markerDetail(markerElem: MapMarker, item: any) {
    this.markerDataInfo = this.setMarkerDataDafault();
    let data: any = null;
    this.markerDataInfo.marker_type = item.type;
    if (item.level == 2) {
      data = this.positionList.filter((_data) => {
        return (
          _data.id == item.id && item.type != 'principal' && _data.level == 2
        );
      });
      this.markerDataInfo.marker_info = item.data.supplier_name;
      this.markerDataInfo.marker_data = data[0].data;
      this.markerDataInfo.marker_type = item.type;
      this.markerDataInfo.marker_level = 2;
      if (item.data)
        this.markerDataInfo.reported_company =
          this.infoWindowData.data.supplier_name;

      this.info.open(markerElem);
      this.markerCloseActive = this.info.closeclick.subscribe(() => {
        this.markerDataInfo = this.setMarkerDataDafault();
        if (this.markerCloseActive) this.markerCloseActive.unsubscribe();
      });
      return;
    }
    this.infoWindowData = item;
    if (this.markerCloseActive) this.markerCloseActive.unsubscribe();
    if (item.type == 'principal') {
      data = this.positionList.filter((data) => {
        return data.id == item.id && item.type == 'principal';
      });
      this.markerDataInfo.marker_info = this.myCompany.name_company;
      this.markerDataInfo.marker_data = this.myCompany;
      this.markerDataInfo.marker_type = item.type;
      this.markerDataInfo.marker_level = 1;
      if (item.data)
        this.markerDataInfo.reported_company = item.data.reported_company;
    } else {
      data = this.positionList.filter((data) => {
        return (
          data.id == item.id && item.type != 'principal' && data.level == 1
        );
      });

      if (item.data) {
        this.markerDataInfo.marker_info = item.data.supplier_name;
        this.markerDataInfo.marker_data = item.data;
        this.markerDataInfo.marker_level = 1;
        this.markerDataInfo.marker_type = item.type;
        if (item.data)
          this.markerDataInfo.reported_company = item.data.reported_company;
      }
    }
    this.info.open(markerElem);
    if (item.type != 'principal') this.obtainSupplyBase();
  }
  markerCloseActive: any = null;
  setMarkerDataDafault(): markerDataInfoI {
    const markerDataDafault: markerDataInfoI = {
      marker_info: '',
      reported_company: '',
      marker_type: '',
      marker_data: null,
      marker_level: 0,
    };
    return markerDataDafault;
  }
  viewMapDetail() {
    //console.log("this.markerDataInfo.marker_data:",this.markerDataInfo.marker_data);
    this.router.navigate([
      `traceability/view/${this.markerDataInfo.marker_data.id}`,
    ]);
  }
  setDataMap() {
    
    this.positionList = [];
    let markerOptions: google.maps.MarkerOptions = {
      draggable: false,
      title: this.myCompany.name_company,
      icon: './assets/images/icons1.png',
    };
    
    const positionPrincipal = {
      lat: this.myCompany.latitude,
      lng: this.myCompany.longitude,
    };
    this.positionList = [
      {
        id: this.myCompany.id,
        type: 'principal',
        name: this.myCompany.name_company,
        position: this.options.center,
        markerOptions: markerOptions,
        data: null,
        level: 1,
      },
    ];
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(positionPrincipal);
    this.map_list.forEach((item: any, index, array) => {
      const position = { lat: item.latitude, lng: item.longitude };
      bounds.extend(position);
      let markerOptions: google.maps.MarkerOptions = {
        draggable: false,
        title: item.supplier_company,
        icon: {
          url: './assets/images/icons2.png',
          scaledSize: new google.maps.Size(30, 30),
        },
      };
      this.positionList.push({
        id: item.id,
        type: 'traceability',
        name: item.supplier_company,
        position: position,
        markerOptions: markerOptions,
        data: item,
        level: 1,
      });
      if (index == array.length - 1) {
        this.googleMap.fitBounds(bounds);
      }
    });
  }

  initMap() {
    let markerOptions: google.maps.MarkerOptions = {
      draggable: false,
      title: 'Colombia',
      icon: './assets/images/icons1.png',
    };
    this.positionList = [
      {
        id: this.myCompany.id,
        type: 'principal',
        name: this.myCompany.name_company,
        position: this.options.center,
        markerOptions: markerOptions,
        data: null,
        level: 1,
      },
    ];

    this.options = {
      center: { lat: this.myCompany.latitude, lng: this.myCompany.longitude },
      zoom: 6,
    };
  }

  getTemCode() {
    if (this.form.value.identifier_global_company == '') {
      this.apiService
        .getResponse(
          'GET',
          `company/company/previousproforestcode/?commodity=${this.form.value.listCommodity.id}&actor_type=${this.form.value.listType_actor.id}`
        )
        .then(
          (resp: any) => {
            this.form.controls['id_proforest_business'].setValue(
              resp.ProforestCode
            );
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
  }

  async obtainSupplyBase() {
    //supplybase/api/obtainsupplybase/location/
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      let d = {
        company_id: this.markerDataInfo.marker_data.supplier_company_id,
        year: this.markerDataInfo.marker_data.year,
        period: this.markerDataInfo.marker_data.period,
      };
      this.loadEventService.loadTableEvent.emit(true);
      const url = `supplybase/api/obtainsupplybase/location/?company_id=${d.company_id}&year=${d.year}&period=${d.period}`;
      this.supplyBaseL2List = {
        id: 0,
        data: [],
      };
      this.apiService
        .getResponse('GET', url)
        .then(
          (resp: any) => {
            if (resp && resp.results && resp.results.length) {
              this.supplyBaseL2List = {
                id: d.company_id,
                data: resp.results[0].traceability,
              };
              
              this.showLevel2();
              //MERGE infoWindowData
            }
          },
          (error) => {
            this.positionList = this.positionList.filter((el) => {
              return el.level != 2;
            });
            if (Array.isArray(error)) {
              error.forEach((element: any) => {
                /* this.showMessage.show(
                  'error',
                  this.translate.instant('attention'),
                  element,
                  'pi pi-exclamation-triangle'
                ); */
              });
            }
          }
        )
        .finally(() => {
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        });
    }
  }
  showLevel2() {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(this.position);
    this.map_list.forEach((item, _i, _array) => {
      let position = {
        lat: item.latitude,
        lng: item.longitude,
      };
      bounds.extend(position);
    });

    if (this.supplyBaseL2List.data) {
      this.supplyBaseL2List.data.forEach((_item) => {
        let item: any = _item;
        let markerOptions: google.maps.MarkerOptions = {
          draggable: false,
          title: item.supplier_name,
          icon: {
            url: './assets/images/icons3.png',
            scaledSize: new google.maps.Size(20, 20),
          },
        };
        let position = {
          lat: item.latitude,
          lng: item.longitude,
        };
        bounds.extend(position);
        let data = {
          id: item.id,
          type: 'traceability',
          name: item.supplier_name,
          position: position,
          markerOptions: markerOptions,
          data: item,
          level: 2,
        };

        this.positionList.push(data);
      });
      this.googleMap.fitBounds(bounds);
      //this.info.close();
      this.markerCloseActive = this.info.closeclick.subscribe(() => {
        this.markerDataInfo = this.setMarkerDataDafault();
        if (this.markerCloseActive) this.markerCloseActive.unsubscribe();
      });
    }
  }
  /********Google Map ***********/
  get fmap() {
    return this.map_form.controls;
  }
}
