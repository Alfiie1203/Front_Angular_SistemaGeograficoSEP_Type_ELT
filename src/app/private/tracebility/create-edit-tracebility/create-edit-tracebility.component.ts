import { Location } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Commodity, ListCommodity } from 'src/app/core/interfaces/business';
import { ApiService } from 'src/app/core/services/api.service';
import {
  ListActorType,
  ActorType,
  BusinessGroup,
  ListBusinessGroup,
  Business,
} from '../../../core/interfaces/business';
import { Country, Goecode } from 'src/app/core/interfaces/cities';
import { Region, City, GeocoderAddress } from '../../../core/interfaces/cities';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
/* import { EventService } from '../../../core/services/event.service'; */
import { GooglemapsService } from '../../../core/services/googlemaps.service';
import { GeocoderResponse } from '../../../core/interfaces/maps';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../../core/services/storage.service';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ListPeriod, Period } from 'src/app/core/interfaces/form';
import { TracebilityDetails } from 'src/app/core/interfaces/tracebility';
import { EventService } from 'src/app/core/services/event.service';
import { User } from 'src/app/core/interfaces/user';

export interface resultXLSX {
  index: number;
  status: boolean;
  note: string;
}

@Component({
  selector: 'app-create-edit-tracebility',
  templateUrl: './create-edit-tracebility.component.html',
  styleUrls: ['./create-edit-tracebility.component.scss'],
})
export class CreateEditTracebilityComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  otroActor: boolean = false;
  otroActorPlantilla: boolean = false;
  select: any;
  options: google.maps.MapOptions;
  position: any;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  form: FormGroup = <FormGroup>{};
  formPlantilla: FormGroup = <FormGroup>{};
  displayConfirm = false;
  listCommodity!: Commodity[];
  listActorType!: ActorType[];
  listBusinessGroup!: BusinessGroup[];
  listCountry!: Country[];
  listRegions!: Region[];
  listCities!: City[];
  dataBusiness!: Business;
  update = false;
  loading = false;
  listSuggestion: [] = [];
  loadSuggestion = false;
  path = environment.path;
  lang: any;
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

  searchLocation = '';
  textFile = '';
  fileXlsx: any = null;
  empresaActive: any = null;
  empresasList: Array<any> = [];

  empresaActivePlantillas: any = null;
  empresasListPlantillas: Array<any> = [];

  @ViewChild('search') public searchElementRef!: ElementRef;
  @ViewChild(GoogleMap) public map!: GoogleMap;
  SCENARIO: string = 'create';
  /***UPDATE */
  ID: any = 0;
  data: TracebilityDetails | undefined;
  formCreated: boolean = false;
  role: string = '';
  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  /***UPDATE */
  constructor(
    public location: Location,
    private formBuilder: FormBuilder,
    private ngZone: NgZone,
    private router: Router,
    private apiService: ApiService,
    private aR: ActivatedRoute,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private loadEventService: EventService,
    private gMapsService: GooglemapsService,
    private storageService: StorageService
  ) {
    this.aR.data.subscribe((params: any) => {
      if (params.SCENARIO) {
        this.ID = this.aR.snapshot.paramMap.get('id');
        // console.log('this.ID:', this.ID);
        this.SCENARIO = params.SCENARIO;
       // console.log('this.SCENARIO:', this.SCENARIO);
        if (this.SCENARIO != 'update') {
          this.createForm();
          this.createFormPlantilla();
        }
      } else {
        this.createForm();
        this.createFormPlantilla();
      }
    });

    this.options = {
      center: { lat: 4.6482837, lng: -74.2478938 },
      zoom: 7,
    };
    this.aR.queryParams.subscribe((params: any) => {
      if (params.id) {
        this.getTracebility(params.id);
        this.update = true;
      }
      // if(params.id!=undefined)
    });
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
  }

  async ngOnInit() {
    //this.getListPeriod();
    await this.getPermissions();
    if(this.role != "CLIENTE" && this.SCENARIO == 'update'){
      this.router.navigate(["/traceability"]);
      return;
    }
    if (this.SCENARIO == 'update') {
      this.loadEventService.loadTableEvent.emit(true);
      const [
        getLang,
        getCurrentLocation,
        getListCommodity,
        getListBusinessGroup,
        getListCountry,
      ] = await Promise.all([
        this.getLang(),
        this.getCurrentLocation(),
        this.getListCommodity(),
        this.getListBusinessGroup(),
        this.getListCountry(),
      ]);
      this.getdata();
    } else {
      this.getLang();
      this.getCurrentLocation();
      this.getListCommodity();
      this.getListBusinessGroup();
      this.getListCountry();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getListPeriod() {
    this.apiService.getResponse('GET', `proforestform/periodlist/`).then(
      (resp: ListPeriod) => {
        //this.listPeriod = resp.results;
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

  async register() {
    this.validateForm();
    if (this.form.valid) {
      await this.form.patchValue({
        commodity: this.form.value.listCommodity.id,
        company_group:
          this.form.value.listbusiness_group != null &&
          this.form.value.listbusiness_group != undefined
            ? this.form.value.listbusiness_group.id
            : '',
        actor_type: this.form.value.listType_actor.id,
        country: this.form.value.listCountry.id,
        region: this.form.value.listRegion.id,
        city: this.form.value.listCity.id,
      });
      let sendData = null;
      await (sendData = this.form.value);
      sendData.listCity = this.form.value.listCity.id;
      sendData.period = sendData.period.id;
      sendData.commodity = this.form.value.listCommodity.id;
      sendData.company_group =
        this.form.value.listbusiness_group != null &&
        this.form.value.listbusiness_group != undefined
          ? this.form.value.listbusiness_group.id
          : '';
      sendData.actor_type = this.form.value.listType_actor.id;
      // console.log(this.form.value.year, new Date(this.form.value.year).getFullYear());
      sendData.year = Number(this.data?.year)==Number(this.form.value.year)?this.form.value.year:new Date(this.form.value.year).getFullYear();
      this.loading = true;
      if (this.SCENARIO == 'update') {
        // console.log('update', this.form.value)
        //http://127.0.0.1:8000/traceability/update/<int:pk>/
        this.apiService
          .getResponse(
            'PATCH',
            `traceability/update/${this.ID}/`,
            this.form.value
          )
          .then(
            () => {
              this.createForm();
              this.loading = false;
              this.listSuggestion = [];
              this.displayConfirm = true;
              this.router.navigate(['traceability/view/'+this.ID]);
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
        this.apiService
          .getResponse('POST', 'traceability/create/', sendData)
          .then(
            (res) => {
              this.createForm();
              this.loading = false;
              this.listSuggestion = [];
              this.displayConfirm = true;
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
    } else {
      this.validateForm();
    }
  }

  getTracebility(id: any) {
    this.loadEventService.loadEvent.emit(true);
    this.apiService.getResponse('GET', `company/company/view/${id}/`).then(
      async (resp: Business) => {
        this.dataBusiness = resp;
        await this.getListActorType(this.dataBusiness.commodity.id);
        await this.getListRegions(this.dataBusiness.country.id);
        await this.getListCities(
          this.dataBusiness.country.id,
          this.dataBusiness.region.id
        );
        this.assignData();
        this.loadEventService.loadEvent.emit(false);
      },
      (error) => {
        this.loading = false;
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

  listTracebility() {
    this.displayConfirm = false;
    this.router.navigateByUrl('traceability');
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
    return new Promise((resolve) => {
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
        )
        .finally(() => {
          resolve(true);
        });
    });
  }

  getListBusinessGroup() {
    this.apiService
      .getResponse(
        'GET',
        'company/companygroup/list-create-company-form/?status=true'
      )
      .then(
        (resp: ListBusinessGroup) => {
          this.listBusinessGroup = resp.results;
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

  getListCountry() {
    this.apiService.getResponse('GET', 'cities/countries/').then(
      (resp: Country[]) => {
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
    );
  }

  getListRegions(idContry: any) {
    this.searchLocation = '';
    return new Promise((resolve) => {
      this.apiService
        .getResponse('GET', `cities/countries/${idContry}/regions/`)
        .then(
          async (resp: Region[]) => {
            this.listRegions = resp;
            this.searchLocation = `${this.form.value.listCountry.name}`;
            await this.gMapsService
              .getLocationAddress(this.searchLocation)
              .subscribe((response: GeocoderAddress) => {
                if (response.status === 'OK') {
                  this.position = {
                    lat: response.results[0].geometry.location.lat,
                    lng: response.results[0].geometry.location.lng,
                  };
                  this.options = {
                    zoom: 6,
                  };
                  this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
                  this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
                }
              });
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

  getListCities(idCountry: any, idRegion: any) {
    this.searchLocation = '';
    return new Promise((resolve) => {
      this.apiService
        .getResponse(
          'GET',
          `cities/countries/${idCountry}/regions/${idRegion}/cities/`
        )
        .then(
          async (resp: City[]) => {
            this.listCities = resp;
            if (!this.formCreated) {
              resolve(true);
              return;
            }
            this.searchLocation = `${this.form.value.listCountry.name}, ${this.form.value.listRegion.name}`;
            await this.gMapsService
              .getLocationAddress(this.searchLocation)
              .subscribe((response: GeocoderAddress) => {
                if (response.status === 'OK') {
                  this.position = {
                    lat: response.results[0].geometry.location.lat,
                    lng: response.results[0].geometry.location.lng,
                  };
                  this.options = {
                    zoom: 8,
                  };
                  if (this.formCreated) {
                    this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
                    this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
                  }
                }
                resolve(true);
              });
          },
          (error) => {
            this.loading = false;
            resolve(true);
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
    });
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
        }
      });
  }

  createForm(data: any = null) {
    // console.log('data', data)
    let periodo: any = '';
    let tempActorType: any = '';
    if (data) {
      periodo = this.listPeriod.filter((p) => p.id == data.period)[0];
      tempActorType = {
        id: data.actor_type.id,
        name: data.actor_type.name,
        name_es: data.actor_type.name_es,
        name_en: data.actor_type.name_en,
        name_pt: data.actor_type.name_pt,
        proforest_actortype_code: data.actor_type.proforest_actortype_code,
        commodity: data.actor_type.commodity,
        status: data.actor_type.status,
      };
    }
    this.form = this.formBuilder.group({
      nit: [data ? data.supplier_tax_number : '', [Validators.required]],
      name: [
        data ? data.supplier_name : '',
        [Validators.required],
      ],
      listbusiness_group: [
        data && data.company_group ? data.company_group : '',
      ],
      listCommodity: [
        data && data.commodity ? data.commodity : '',
        [Validators.required],
      ],
      listType_actor: [tempActorType, [Validators.required]],
      supplier_capacity: [
        data && data.supplier_capacity ? data.supplier_capacity : '',
        [
          Validators.pattern('^([0-9])+(.[0-9]{1,2})?$'),
          Validators.required,
          Validators.maxLength(11),
        ],
      ],
      supplier_production: [
        data && data.supplier_production ? data.supplier_production : '',
        [
          Validators.pattern('^([0-9])+(.[0-9]{1,2})?$'),
          Validators.required,
          Validators.maxLength(11),
        ],
      ],
      purchased_volume: [
        data ? (data.purchased_volume * 100 ) : '',//data ? (data.purchased_volume * 100) : '',
        [
          Validators.min(0),
          Validators.max(10000),
          Validators.required,
          Validators.pattern('^([0-9])+(.[0-9]{1,2})?$'),
        ],
      ],
      listCountry: [data ? data.country : '', [Validators.required]],
      country: [data ? data.country.id : ''],
      listRegion: [data ? data.region : '', [Validators.required]],
      region: [data ? data.region.id : ''],
      listCity: [data ? data.city : '', [Validators.required]],
      city: [data ? data.city.id : ''],
      latitude: [data ? data.latitude : '', [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ]],
      longitude: [data ? data.longitude : '', [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ]],
      year: [data ? data.year + '' : '', [Validators.required]],
      period: [periodo, [Validators.required]],
      otroActor: [this.otroActor],
      certification: [
        data && data.certification ? data.certification : '',
        [Validators.required],
      ],
    });
    this.formCreated = true;
    // this.form = this.formBuilder.group({
    //   company_group: [''],
    //   listbusiness_group: [''],
    //   name: ['', Validators.required],
    //   nit: ['', Validators.required],
    //   commodity: [''],
    //   listCommodity: ['', Validators.required],
    //   actor_type: [''],
    //   listType_actor: ['', Validators.required],
    //   identifier_global_company: [''],
    //   id_proforest_business: [{value: '', disabled: true}],
    //   country: [''],
    //   listCountry: [ '' , Validators.required],
    //   region: [''],
    //   listRegion: ['', Validators.required],
    //   city: [''],
    //   listCity: ['', Validators.required],
    //   latitude: ['', Validators.required],
    //   longitude: ['', Validators.required],
    //   status: [true]
    // })
    this.form
      .get('name')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.apiService
          .getResponse('GET', `company/company/search/detail/?name=${response}`)
          .then((resp: any) => {
            if (resp && resp.results && resp.results instanceof Array) {
              this.empresasList = resp.results;
              let find = this.empresasList.find((x) => x?.name === response);
              this.setFormResult(find);
            } else {
              this.empresasList = [];
            }

            this.loadSuggestion = false;
            this.listSuggestion = resp.results;
          });
      });

    this.form
      .get('listCommodity')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {});
  }

  setFormResult(find: any) {
    if (find) {
      this.empresaActive = find;
      const tempActorType = {
        id: this.empresaActive.actor_type.id,
        name: this.empresaActive.actor_type.name,
        name_es: this.empresaActive.actor_type.name_es,
        name_en: this.empresaActive.actor_type.name_en,
        name_pt: this.empresaActive.actor_type.name_pt,
        proforest_actortype_code:
          this.empresaActive.actor_type.proforest_actortype_code,
        commodity: this.empresaActive.actor_type.commodity,
        status: this.empresaActive.actor_type.status,
      };
      this.form.patchValue({
        nit: this.empresaActive.nit,
        listCommodity: this.empresaActive.commodity,
        listType_actor: tempActorType,
      });
      if (this.empresaActive.company_group) {
        this.form.patchValue({
          listbusiness_group: this.empresaActive.company_group,
        });
      }
      this.getListActorType(this.empresaActive.commodity.id);
    } else {
      this.empresaActive = null;
    }
  }
  setDatalist(e: any): void {
    // console.log('8000 setDatalist:', e);
    let find = this.empresasList.find((x) => x?.name === e.target.value);
    this.setFormResult(find);
  }

  assignData() {
    this.form.setValue({
      company_group:
        this.dataBusiness.company_group != null &&
        this.dataBusiness.company_group != undefined
          ? this.dataBusiness.company_group.id
          : '',
      listbusiness_group: this.dataBusiness.company_group,
      name: this.dataBusiness.name,
      nit: this.dataBusiness.nit,
      commodity: this.dataBusiness.commodity.id,
      listCommodity: this.dataBusiness.commodity,
      actor_type: this.dataBusiness.actor_type.id,
      listType_actor: this.dataBusiness.actor_type,
      identifier_global_company: this.dataBusiness.identifier_global_company,
      id_proforest_business: this.dataBusiness.identifier_proforest_company,
      country: this.dataBusiness.country.id,
      listCountry: this.dataBusiness.country,
      region: this.dataBusiness.region.id,
      listRegion: this.dataBusiness.region,
      city: this.dataBusiness.city.id,
      listCity: this.dataBusiness.city,
      latitude: this.dataBusiness.latitude,
      longitude: this.dataBusiness.longitude,
      status: this.dataBusiness.status,
    });
    this.form.controls['identifier_global_company'].disable();
    this.position = {
      lat: this.dataBusiness.latitude,
      lng: this.dataBusiness.longitude,
    };
  }

  suggestions() {
    if (this.form.value.name.length > 3) {
      this.loadSuggestion = true;
      this.apiService
        .getResponse(
          'GET',
          `company/company/search/?limit=5&name=${this.form.value.name}`
        )
        .then((resp: any) => {
          this.loadSuggestion = false;
          this.listSuggestion = resp.results;
        });
    } else {
      this.listSuggestion = [];
    }
  }

  getCurrentLocation() {
    if (!this.update) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.position = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
        this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
      });
    }
  }

  upload(ev: Event) {
    const target: any = ev.target as HTMLInputElement;
    this.fileXlsx = target.files[0];
    this.textFile = target.files[0].name;
  }

  deleteFile() {
    (<HTMLInputElement>document.getElementById('file-input')).value = '';
    this.textFile = '';
    this.fileXlsx = null;
  }

  asingProforestCode() {
    this.form.controls['id_proforest_business'].setValue(
      this.form.value.identifier_global_company
    );
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

  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) {
      this.position = event.latLng.toJSON();
      this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
      this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
      /* this.gMapsService.geocodeLatLng(this.position)
      .then((response:GeocoderResponse)=>{
      })  */
      this.gMapsService
        .getLocation(this.position)
        .subscribe((response: Goecode) => {
          if (response.results.length) {
            const value = response.results[0];
          }
        });
    }
  }

  addMarkerInput() {
    this.position = {
      lat: parseFloat(this.form.value.latitude),
      lng: parseFloat(this.form.value.longitude),
    };
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

  public isRequired(att: string): boolean {
    let _form = this.form.get(att);
    if (_form != null && _form.validator) {
      const validator = _form.validator({} as AbstractControl);
      if (validator && validator['required']) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async downloadService() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      return new Promise((resolve, reject) => {
        let headers = new Headers({
          Authorization: 'Bearer ' + getToken.access,
          'Content-Language': this.lang.code,
        });

        let urlTemp = ``;
        if (this.otroActorPlantilla) {
          urlTemp = `${this.path}traceability/api/xlsx/exportothers/`;
        } else {
          urlTemp = `${this.path}traceability/api/xlsx/export/`;
        }
        fetch(urlTemp, {
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

  isNumberCheck(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      let number = /^[.\d]+$/.test(c.value) ? +c.value : NaN;
      if (number !== number) {
        return { value: true };
      }
      return null;
    };
  }
  isOtherActor() {
    this.otroActor = !this.otroActor;
    if (this.otroActor) {
      this.form.patchValue({
        supplier_capacity: '',
        supplier_production: '',

        certification: '',
      });
      this.form.get('supplier_capacity')?.clearValidators();
      this.form.get('supplier_production')?.clearValidators();
      /* this.form.controls['purchased_volume']?.clearValidators(); */
      this.form.get('certification')?.clearValidators();

      this.form.controls['supplier_capacity'].disable();
      this.form.controls['supplier_production'].disable();
      /* this.form.controls['purchased_volume'].disable(); */
      this.form.controls['certification'].disable();
    } else {
      this.form
        .get('supplier_capacity')
        ?.addValidators([
          Validators.pattern('^([0-9])+(.[0-9]{1,2})?$'),
          Validators.required,
          Validators.maxLength(11),
        ]);
      this.form
        .get('supplier_production')
        ?.addValidators([
          Validators.pattern('^([0-9])+(.[0-9]{1,2})?$'),
          Validators.required,
          Validators.maxLength(11),
        ]);
      /* this.form
        .get('purchased_volume')
        ?.addValidators([
          Validators.min(0),
          Validators.max(100),
          Validators.required,
          Validators.pattern('^([0-9])+(.[0-9]{1,2})?$')
        ]); */
      this.form.get('certification')?.addValidators([Validators.required]);

      this.form.controls['supplier_capacity'].enable();
      this.form.controls['supplier_production'].enable();
      /* this.form.controls['purchased_volume'].enable(); */
      this.form.controls['certification'].enable();
    }
  }

  toStringify(json: any) {
    return JSON.stringify(json);
  }

  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  /*  Material pagination */
  length = 0;
  totalElements: number = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  /*  Material pagination */
  displayedColumns: string[] = [
    'index',
    'status',
    'note',
    'was_company_in_database',
  ];
  showResultXLSX: boolean = false;
  dataResultXLSX: any = null;
  dataSource: MatTableDataSource<resultXLSX> = new MatTableDataSource();
  registerFile: boolean = false;
  uploadFile() {
    //this.fileXlsx;
    this.showResultXLSX = false;
    this.dataResultXLSX = null;
    const formFile = new FormData();
    formFile.append('file_traceability', this.fileXlsx, this.textFile);
    let url = ``;
    //console.log("otroActorPlantilla:",this.otroActorPlantilla);
    if (this.otroActorPlantilla) {
      url = `traceability/xlsx/create/others/`;
    } else {
      url = `traceability/xlsx/create/`;
    }
    this.apiService.getResponse('POST', url, formFile).then(
      (resp: any) => {
        this.dataResultXLSX = resp;

        //this.displayConfirm = true;

        this.loadSuggestion = false;
        this.listSuggestion = resp.results;
        this.showResultXLSX = true;
        this.registerFile = true;
        if (this.dataResultXLSX) {
          this.length = this.dataResultXLSX.load_result.length;
          this.dataSource = new MatTableDataSource(
            this.dataResultXLSX.load_result
          );
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          /* this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort; */
        }
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
  cerrar() {
    this.router.navigateByUrl('traceability');
  }

  createFormPlantilla() {
    this.formPlantilla = this.formBuilder.group({
      otroActorP: [this.otroActorPlantilla],
    });
  }
  setFormResultPlantillas(find: any) {
    if (find) {
      this.empresaActivePlantillas = find;
      this.formPlantilla.patchValue({
        id_empresa_plantilla: this.empresaActivePlantillas.id,
        nit_plantilla: this.empresaActivePlantillas.nit,
      });
    } else {
      this.empresaActivePlantillas = null;
    }
  }
  setDatalistPlantillas(e: any): void {
    let find = this.empresasListPlantillas.find(
      (x) => x?.name === e.target.value
    );
    this.setFormResultPlantillas(find);
  }
  isOtherActorPlantilla() {
    this.otroActorPlantilla = !this.otroActorPlantilla;
  }

  validateFormP() {
    return Object.values(this.formPlantilla.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((control) =>
          control.markAsTouched()
        );
      } else {
        control.markAsTouched();
      }
    });
  }
  get fp() {
    return this.formPlantilla.controls;
  }

  /******UPDATE *********/
  getdata() {
    let url = `traceability/view/${this.ID}/`;
    this.apiService.getResponse('GET', url).then(
      async (resp: TracebilityDetails) => {
        if (resp) {
          this.data = resp;
          this.position = {
            lat: this.data.latitude,
            lng: this.data.longitude,
          };
          await this.getListActorType(this.data.commodity.id);
          await this.getListRegions(this.data.country.id);
          await this.getListCities(this.data.country.id, this.data.region.id);
          this.createForm(this.data);
        }
      },
      (error) => {
        this.data = undefined;
        if (Array.isArray(error)) {
          error.forEach((element: any) => {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          });
        }
      }
    ).finally( ()=>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
    } );
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
        // console.log("getPermissions:",resp);
    });
    
  }
   /******UPDATE *********/
}
