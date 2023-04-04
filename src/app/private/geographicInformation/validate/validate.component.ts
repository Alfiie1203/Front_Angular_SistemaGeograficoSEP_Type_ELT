import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { CoordinatesResults } from 'src/app/core/interfaces/geographicInformationI';
import { ApiService } from 'src/app/core/services/api.service';
import { EventService } from 'src/app/core/services/event.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Location, ViewportScroller } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GooglemapsService } from 'src/app/core/services/googlemaps.service';
import {
  City,
  Country,
  GeocoderAddress,
  Goecode,
  Region,
} from 'src/app/core/interfaces/cities';
import { GoogleMap } from '@angular/google-maps';

export interface validatorsI {
  id: number;
  full_name: string;
  checked: boolean;
}

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss'],
})
export class ValidateComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;

  options: google.maps.MapOptions;
  markerTitle = 'company';
  markerOptions!: google.maps.MarkerOptions;
  @ViewChild('search') public searchElementRef!: ElementRef;
  @ViewChild(GoogleMap) public map!: GoogleMap;

  form: FormGroup = <FormGroup>{};

  listSize = 0;
  /*  Material pagination */
  length = 0;
  totalElements: number = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 100];
  OFFSET: number = 0;
  pagination: any;
  /*  Material pagination */
  displayedColumns: string[] = ['name', 'action'];

  textSearch: string = '';
  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  loading = false;
  diabledInputs = false;
  lang: any;

  listData: any;
  listDataBK: any;
  displayConfirm = false;
  company: any = null;
  companyBK: any = null;
  validators: Array<validatorsI> = [];
  validatorsBTN: boolean = false;
  validatorsCount: number = 0;
  pageSizeV = 10;
  listSizeV = 0;
  OFFSETV: number = 0;
  pageSizeOptionsV: number[] = [10, 25, 100];
  textSearchV: string = '';
  textSearchV$ = new Subject<string>();
  loadV = true;
  fechaLimiteV: string = '';
  errorV: boolean = false;
  errorMessageV: string = '';
  validateNoteV: string = '';

  dataSource: MatTableDataSource<CoordinatesResults> = new MatTableDataSource();

  listStatus: Array<any> = [
    {
      id: 'SR',
      name: 'SELFREPORTED',
    },
    {
      id: 'NV',
      name: 'NOTVALIDATE',
    },
    {
      id: 'VA',
      name: 'VALIDATE',
    },
  ];
  companyStatus = {
    id: '',
    name: '',
  };
  position = {
    lat: 0,
    lng: 0,
  };
  init = false;
  listCountry!: Country[];
  listRegions!: Region[];
  listCities!: City[];
  readonly saveData = {
    country: 0,
    region: 0,
    city: 0,
    latitude: 0.0,
    longitude: 0.0,
    status_revision: '',
    note_revision: '',
  };
  modelValidErr: any = {
    statuValidate: {
      err: false,
      message: '',
      touched: false,
    },
    note: {
      err: false,
      message: '',
      touched: false,
    },
  };

  constructor(
    public location: Location,
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private translate: TranslateService,
    private showMessage: ShowMessageService,
    private gMapsService: GooglemapsService,
    private ngZone: NgZone,
    private formBuilder: FormBuilder
  ) {
    this.options = {
      center: { lat: 4.6482837, lng: -74.2478938 },
      zoom: 7,
    };
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
    this.getLang();
    //MarkerTitle
    (async () => {
      let title: string = '';
      title = await this.translateModule('company');
      this.markerOptions = { draggable: true, title: title };
    })();
  }
  translateSubs:Subscription | undefined;
  translateModule(word: string, data: {} = {}): Promise<string> {
    return new Promise((resolve) => {
      try {
        this.translateSubs = this.translate.get(word, data).subscribe((res: string) => {
          resolve(res);
        });
      } catch (error) {
        resolve('');
      }
    });
  }
  
  ngOnDestroy(){
    if(this.translateSubs){
      this.translateSubs.unsubscribe();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      listCountry: [
        this.company ? this.company.country : '',
        [Validators.required],
      ],
      country: [this.company ? this.company.country.id : ''],
      listRegion: [
        this.company ? this.company.region : '',
        [Validators.required],
      ],
      region: [this.company ? this.company.region.id : ''],
      listCity: [this.company ? this.company.city : '', [Validators.required]],
      city: [this.company ? this.company.city.id : ''],
      latitude: [
        this.company ? this.company.latitude : '',
        [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ],
      ],
      longitude: [
        this.company ? this.company.longitude : '',
        [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ],
      ],
    });
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  searchLocation = '';
  /***********peticiones******** */
  async getListCountry() {
    await this.apiService.getResponse('GET', 'cities/countries/').then(
      (resp: Country[]) => {
        this.listCountry = resp;
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
  getListRegions(idContry: any, formFirstLoad = true) {
    this.searchLocation = '';
    this.apiService
      .getResponse('GET', `cities/countries/${idContry}/regions/`)
      .then(
        async (resp: Region[]) => {
          this.listRegions = resp;
          this.searchLocation = `${this.form.value.listCountry.name}`;
          await this.gMapsService
            .getLocationAddress(this.searchLocation)
            .subscribe((response: GeocoderAddress) => {
              if (response.status === 'OK' && formFirstLoad) {
                this.position = {
                  lat: response.results[0].geometry.location.lat,
                  lng: response.results[0].geometry.location.lng,
                };
                this.options = {
                  zoom: 6,
                };
                this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
                this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
                this.company.latitude = this.position.lat;
                this.company.longitude = this.position.lng;
                this.company.country = this.form.value.listCountry;
              }
            });
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
  getListCities(idCountry: any, idRegion: any, formFirstLoad = true) {
    this.searchLocation = '';
    this.apiService
      .getResponse(
        'GET',
        `cities/countries/${idCountry}/regions/${idRegion}/cities/`
      )
      .then(
        async (resp: City[]) => {
          this.listCities = resp;
          this.searchLocation = `${this.form.value.listCountry.name}, ${this.form.value.listRegion.name}`;
          await this.gMapsService
            .getLocationAddress(this.searchLocation)
            .subscribe((response: GeocoderAddress) => {
              if (response.status === 'OK' && formFirstLoad) {
                this.position = {
                  lat: response.results[0].geometry.location.lat,
                  lng: response.results[0].geometry.location.lng,
                };
                this.options = {
                  zoom: 8,
                };
                this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
                this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
                this.company.latitude = this.position.lat;
                this.company.longitude = this.position.lng;
                this.company.region = this.form.value.listRegion;
              }
            });
        },
        (error) => {
          //this.loading = false;
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

  locationCity() {
    this.searchLocation = '';
    this.searchLocation = `${this.form.value.listCountry.name}, ${this.form.value.listRegion.name}, ${this.form.value.listCity.name}`;
    this.gMapsService
      .getLocationAddress(this.searchLocation)
      .subscribe((response: GeocoderAddress) => {
        if (response.status === 'OK') {
          this.position = {
            lat: response.results[0].geometry.location.lat,
            lng: response.results[0].geometry.location.lng,
          };
          this.options = {
            zoom: 14,
          };
          this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
          this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
          this.company.latitude = this.position.lat;
          this.company.longitude = this.position.lng;
          this.company.city = this.form.value.listCity;
        }
      });
  }
  async list() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);
      let url = `coordinates/validation/company/list/?limit=${this.pageSize}&offset=${this.OFFSET}`;
      this.apiService.getResponse('GET', url).then(
        (resp: any) => {
          //console.log('resp', resp)
          if (resp && resp.results) {
            this.listData = resp;
            this.listDataBK = JSON.parse(JSON.stringify(resp));
            this.listSize = resp.count;
            this.dataSource = new MatTableDataSource<CoordinatesResults>(
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
  /***********peticiones******** */
  async ngOnInit() {
    await this.list();
    await this.getListCountry();
    this.createForm();
    this.boxSearch();
  }

  async getCompany() {
    if (!this.company) {
      return;
    }
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);
      let url = `coordinates/revisor/detail/${this.company.id}/`;
      this.apiService.getResponse('GET', url).then(
        (resp: any) => {
          if (resp && resp.results) {
            this.listData = resp;
            this.listSize = resp.count;
            //this.dataSource = new MatTableDataSource<CoordinatesResults>(this.listData.results);
          }
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);

          this.boxSearch();
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
  applyFilter(event: Event) {}

  async setCompany(company: any) {
    this.resetCompany();

    this.company = company;
    this.diabledInputs = this.company.actor_type.is_productor
    await this.getListRegions(this.company.country.id, false);
    await this.getListCities(
      this.company.country.id,
      this.company.region.id,
      false
    );

    this.createForm();

    this.companyBK = JSON.parse(JSON.stringify(company));
    this.displayConfirm = true;
    this.companyStatus = this.listStatus.filter(
      (el) => el.id == company.status_revision
    )[0];
    this.position = {
      lat: company.latitude,
      lng: company.longitude,
    };
    //await this.getCompany();
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

  /************** */

  statusValidation(event: any) {
    let id: string = 'statuValidate';
    //console.log('Event:', event.value);
    if (this.company) {
      this.company.status_revision = event.value.id;
      this.companyStatus.id = event.value.id;
      this.companyStatus.name = event.value.name;
      //console.log('companyStatus:', this.companyStatus);
      this.modelValidErr[id].touched = true;
      if (event.value && event.value.id) {
        this.modelValidErr[id].err = false;
        this.modelValidErr[id].message = '';
      } else {
        this.modelValidErr[id].err = true;
        this.modelValidErr[id].message = 'required_field';
      }
    }
  }
  noteKeyUp() {
    let id: string = 'note';
    this.modelValidErr[id].touched = true;
    if (!this.validateNoteV) {
      this.modelValidErr[id].err = true;
      this.modelValidErr[id].message = 'required_field';
    } else {
      this.modelValidErr[id].err = false;
      this.modelValidErr[id].message = '';
    }
  }

  resetCompany() {
    this.company = null;
    this.companyBK = null;
    this.validateNoteV = '';
    this.searchElementRef.nativeElement.value = '';
    //this.init = false;
    this.listData = JSON.parse(JSON.stringify(this.listDataBK));
    this.dataSource = new MatTableDataSource<CoordinatesResults>(
      this.listData.results
    );
    this.companyStatus = {
      id: '',
      name: '',
    };
    this.modelValidErr = {
      statuValidate: {
        err: false,
        message: '',
        touched: false,
      },
      note: {
        err: false,
        message: '',
        touched: false,
      },
    };
    this.list();
  }
  resetCompanyDefaultCoordenates() {
    //this.init = false;
    this.company = JSON.parse(JSON.stringify(this.companyBK));
    this.createForm();
    this.position = {
      lat: this.company.latitude,
      lng: this.company.longitude,
    };
    //console.log('position:', this.position);
  }

  async saveValidation() {
    //this.saveData;
    let saveData = this.saveData;
    let err = 0;
    if (this.companyStatus.id && this.companyStatus.name) {
      this.modelValidErr['statuValidate'].err = false;
      this.modelValidErr['statuValidate'].touched = false;
      this.modelValidErr['statuValidate'].message = '';
    } else {
      this.modelValidErr['statuValidate'].err = true;
      this.modelValidErr['statuValidate'].touched = true;
      this.modelValidErr['statuValidate'].message = 'required_field';
      err++;
    }
    if (!this.validateNoteV) {
      this.modelValidErr['note'].err = true;
      this.modelValidErr['note'].touched = true;
      this.modelValidErr['note'].message = 'required_field';
      err++;
    } else {
      this.modelValidErr['note'].err = false;
      this.modelValidErr['note'].touched = false;
      this.modelValidErr['note'].message = '';
    }
    if (err > 0) {
      return;
    }
    saveData.latitude = this.company.latitude;
    saveData.longitude = this.company.longitude;
    saveData.country = this.company.country.id;
    saveData.region = this.company.region.id;
    saveData.city = this.company.city.id;
    saveData.note_revision = this.validateNoteV;
    saveData.status_revision = this.companyStatus.id;
    
    //console.log('saveValidation ->saveData:', saveData);
    //console.log('Sending data...');
    //confirm save

    //http://127.0.0.1:8000/coordinates/review/company/6/
    //coordinates/verification/company/13/
    const url = `coordinates/validate/company/${this.company.id}/`;
    //console.log('saveValidation ->url:', url);
    let filterData = {
      note_revision:this.validateNoteV,
      status_revision: this.companyStatus.id
    }
    this.loading = true;
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);

      this.apiService.getResponse('PATCH', url, saveData).then(
        async (resp: any) => {
          this.resetCompany();
          this.init = false;
          await this.getListCountry();
          this.list();
          this.loading = false;

          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        },
        (error) => {
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
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
    /* this.resetCompany();
    this.init = false;
    this.list(); */
  }
  get f() {
    return this.form.controls;
  }
  /*************Mapa*********** */
  boxSearch() {
    // Binding autocomplete to search input control
    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );
    // Align search box to center
    if (true) {
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        this.searchElementRef.nativeElement
      );
      this.init = true;
    }
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        //get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();
        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }
        //set latitude, longitude and zoom
        let latitude: number = place.geometry.location?.lat()
          ? place.geometry.location?.lat()
          : 0;
        let longitude = place.geometry.location?.lng()
          ? place.geometry.location?.lng()
          : 0;
        this.position = {
          lat: latitude,
          lng: longitude,
        };
        this.company.latitude = latitude;
        this.company.longitude = longitude;
        this.createForm();
      });
    });
  }
  setCompanyCoordenates() {
    this.company.latitude = this.position.lat;
    this.company.longitude = this.position.lng;
  }
  addMarker(event: google.maps.MapMouseEvent) {
    if(!this.diabledInputs){
      return;
    }
    if (event.latLng != null && this.company) {
      this.position = event.latLng.toJSON();

      this.company.latitude = Number(this.position.lat).toFixed(8);
      this.company.longitude = Number(this.position.lng).toFixed(8);
      this.form.patchValue({
        latitude: this.company.latitude,
        longitude: this.company.longitude,
      });

      this.gMapsService
        .getLocation(this.position)
        .subscribe((response: Goecode) => {
          if (response.results.length) {
            const value = response.results[0];
          }
        });
    }
  }
  gragMarker(event: any) {
    if (event.latLng != null && this.company) {
      this.position = event.latLng.toJSON();
      this.company.latitude = this.position.lat;
      this.company.longitude = this.position.lng;
      this.form.patchValue({
        latitude:this.company.latitude,
        longitude:this.company.longitude
      });
      this.createForm();
     
      this.gMapsService
        .getLocation(this.position)
        .subscribe((response: Goecode) => {
          if (response.results.length) {
            const value = response.results[0];
          }
        });
    }
  }
  /*************Mapa*********** */
  setCoordinates() {
    let latitude = this.form.value.latitude;
    let longitude = this.form.value.longitude;
    this.position = {
      lat: Number.parseFloat(latitude),
      lng: Number.parseFloat(longitude),
    };
    this.company.latitude = latitude;
    this.company.longitude = longitude;
    //console.log('position:', this.position);
  }
}
