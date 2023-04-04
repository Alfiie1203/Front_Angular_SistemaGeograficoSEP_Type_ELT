import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/core/services/event.service';
import { ApiService } from 'src/app/core/services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { CoordinateVerifyList } from 'src/app/core/interfaces/geographicInformationI';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { GooglemapsService } from 'src/app/core/services/googlemaps.service';
import { GoogleMap } from '@angular/google-maps';
import { PageEvent } from '@angular/material/paginator';
import { City, Country, GeocoderAddress, Goecode, Region } from 'src/app/core/interfaces/cities';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';


@Component({
  selector: 'app-verify-traceability',
  templateUrl: './verify-traceability.component.html',
  styleUrls: ['./verify-traceability.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ]
})
export class VerifyTraceabilityComponent implements OnInit {
  @ViewChild('search') public searchElementRef!: ElementRef;
  @ViewChild(GoogleMap) public map!: GoogleMap;

  idCompany=false;

  constructor(
    public location: Location,
    private loadEventService: EventService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private gMapsService: GooglemapsService,
    private ngZone: NgZone,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) { 
    this.options = {
      center: { lat: 4.6482837, lng: -74.2478938 },
      zoom: 10,
    };
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
    this.getLang();

    this.route.queryParams.subscribe(async (params:any) =>{
      if(params.idCompany){
        this.idCompany = true;
        this.selected_company = {};
        this.selected_company.id_company  = params.idCompany;
        this.list();
        
      }
    })
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  is_productor:boolean = false;
  lang:any;
  init = false;
  form: FormGroup = <FormGroup>{};
  periodo:any = "";
  periodo$ = new Subject<string>();
  year:any = "";
  year$ = new Subject<string>();
  textSearchMain:string = "";
  textSearch$ = new Subject<string>();
  expandedElement:any;
  
  displayedColumns: string[] = ['name',"supplier_company","deadline", 'action', 'more'];
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
  listStatus: Array<any> = [
    {
      id: 'SR',
      name: 'SELFREPORTED',
    },
    // {
    //   id: 'NV',
    //   name: 'NOTVALIDATE',
    // },
    // {
    //   id: 'VA',
    //   name: 'VALIDATE',
    // },
    {
      id: 'NVE',
      name: 'NOTVERIFIED',
    },
    {
      id: 'VE',
      name: 'VERIFIED',
    },
  ];
  modelValidErr:any = {
    "statuValidate":{
      err:false,
      message:"",
      touched:false
    },
    "note":{
      err:false,
      message:"",
      touched:false
    }
  }
  readonly saveData = {   
    "supplier_capacity": 0.0,
    "supplier_production": 0.0,
    "purchased_volume": 0.0,
    "certification": "",
    "latitude": 0.0,
    "longitude": 0.0,
    "country": 0,
    "region": 0,
    "city": 0,
    "year": 0,
    "period": 0,
    "validated": "",
    "note_validation": ""
  }
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 100];
  OFFSET: number = 0;
  pagination: any;
  listSize = 0;

  listData: any;
  listDataBK: any;
  dataSource: MatTableDataSource<CoordinateVerifyList> = new MatTableDataSource();
  company: any = null;
  companyBK: any = null;

  loadV = true;
  fechaLimiteV: string = '';
  errorV: boolean = false;
  errorMessageV: string = '';
  validateNoteV:string = '';
  searchLocation = '';

  listCountry!: Country[];
  listRegions!: Region[];
  listCities!: City[];
  companyStatus = {
    id: '',
    name: '',
  };
  position: any;
  options: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  displayConfirm = false;
  start_date:any;
  end_date:any;
  start_date$=new Subject<string>();
  end_date$=new Subject<string>();
  start_dateSubs:Subscription | undefined;
  end_dateSubs:Subscription | undefined;
  status_revision: any = '';
  statusRevision$ = new Subject<string>();
  statusRevisionSubs: Subscription | undefined;
  list_companies:any=[];
  selected_company:any;
  selected_company$=new Subject<string>();
  selected_companySubs:Subscription | undefined;


  async ngOnInit() {
    this.textSearch$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });
    this.year$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      
      
      this.list()
    });
    this.periodo$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response:any) => {
      //console.log(this.periodo);
      this.list()
    });
    this.statusRevisionSubs = this.statusRevision$.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.list();
    });

    this.start_dateSubs = this.start_date$.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.list();
    });
    this.end_dateSubs = this.end_date$.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.list();
    });
    this.selected_companySubs = this.selected_company$.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe((response) => {
      this.list();
    });
    await this.list();
    await this.getListCountry();
    this.createForm();
    this.boxSearch()
  }
  /* list(){
    const url = `coordinates/verification/list/`;
  } */
  async list() {
      this.loadEventService.loadTableEvent.emit(true);
      //let url = `coordinates/traceability/validate/?limit=${this.pageSize}&offset=${this.OFFSET}`;
      // //console.log(this.periodo);
      let url = `coordinates/traceability/verify/?limit=${this.pageSize}&offset=${this.OFFSET}&year=${this.year}&period=${(this.periodo && this.periodo.id)?this.periodo.id:''}&status_revision=${this.status_revision ? this.status_revision.id : ''}&start_date_validation=${this.start_date ? this.start_date : ''}&end_date_validation=${this.end_date ? this.end_date : ''}&reported_company_id=${this.selected_company ? this.selected_company.id_company : ''}`;
      this.apiService.getResponse('GET', url).then(
        (resp: any) => {
          // console.log('resp', resp)
          if (resp && resp.results) {
            this.list_companies = resp.list_companies;
            this.listData = resp;
            this.listDataBK = JSON.parse(JSON.stringify(resp));
            this.listSize = resp.count;
            this.dataSource = new MatTableDataSource<CoordinateVerifyList>(
              this.listData.results
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
      ).finally(()=>{
        this.loadEventService.loadTableEvent.emit(false);
        this.loadEventService.loadEvent.emit(false);
      });
  }

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
  getListRegions(idContry: any,formFirstLoad = true) {
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
                  zoom: 10,
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
  getListCities(idCountry: any, idRegion: any,formFirstLoad = true) {
    
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
                  zoom: 10,
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
  
  locationCity(event:Event) {
    let e:any = event;
    //console.log("locationCity: ->event",e.value);
    this.searchLocation = '';
    this.searchLocation = `${this.form.value.listCountry.name}, ${this.form.value.listRegion.name}, ${this.form.value.listCity.name}`;
    this.gMapsService
      .getLocationAddress(this.searchLocation)
      .subscribe((response: GeocoderAddress) => {
        //console.log("locationCity: ->response",response);
        if (response.status === 'OK') {
          this.position = {
            lat: response.results[0].geometry.location.lat,
            lng: response.results[0].geometry.location.lng,
          };
          this.options = {
            zoom: 10,
          };
          this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
          this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
          this.company.latitude = this.position.lat;
          this.company.longitude = this.position.lng;
          this.company.city = this.form.value.listCity;
          //this.form.controls['city'].setValue(this.company.city.id);


                
        }
      });
  }
  async setCompany(company: any) {
    //console.log("company:",company);
    this.resetCompany();
    this.company = company;
    await this.getListRegions(this.company.country.id,false);
    await this.getListCities(this.company.country.id, this.company.region.id,false);
    this.createForm();
    this.companyBK = JSON.parse(JSON.stringify(company));
    this.displayConfirm = true;
    try {
      let companyStatus:any = this.listStatus.filter(item=>item.id == this.company.status_revision );
      if(companyStatus && companyStatus.length > 0){
        this.companyStatus = companyStatus[0];
      }
    } catch (error) {
    }
    this.position = {
      lat: company.latitude,
      lng: company.longitude,
    };
    //await this.getCompany();
    
  }
  resetCompany() {
    this.company = null;
    this.companyBK = null;
    this.validateNoteV = "";
    this.searchElementRef.nativeElement.value = '';
    //this.init = false;
    this.listData = JSON.parse(JSON.stringify(this.listDataBK))
    this.dataSource = new MatTableDataSource<CoordinateVerifyList>(
      this.listData.results
    );
    this.companyStatus = {
      id: '',
      name: '',
    };
    this.modelValidErr = {
      "statuValidate":{
        err:false,
        message:"",
        touched:false
      },
      "note":{
        err:false,
        message:"",
        touched:false
      }
    }
    this.list();
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
  statusValidation(event: any) {
    let id:string = "statuValidate";
    //console.log('Event:', event.value);
    if (this.company) {
      //console.log("statusValidation company:",this.company);
      this.company.status_revision = event.value.id;
      this.companyStatus.id = event.value.id;
      this.companyStatus.name = event.value.name;
      //console.log('companyStatus:', this.companyStatus);
      this.modelValidErr[id].touched =true;
      if(event.value && event.value.id){
        this.modelValidErr[id].err = false;
        this.modelValidErr[id].message = ""
      }else{
        this.modelValidErr[id].err = true;
        this.modelValidErr[id].message = "required_field"
      }
    }
  }
  noteKeyUp(){
    let id:string = "note";
    this.modelValidErr[id].touched = true;
    if(!this.validateNoteV){
      this.modelValidErr[id].err = true;
      this.modelValidErr[id].message = "required_field"
    }else{
      this.modelValidErr[id].err = false;
      this.modelValidErr[id].message = ""
    }
  }
  resetCompanyDefaultCoordenates() {
    //this.init = false;
    this.company = JSON.parse(JSON.stringify(this.companyBK));
    this.createForm();
    this.position = {
      lat: this.company.latitude,
      lng: this.company.longitude,
    };
    //console.log("position:",this.position);
  } 

  async saveValidation() {
    let saveData = (this.saveData);
    /* this.companyStatus;
    this.company; */
    saveData.supplier_capacity = this.company.supplier_capacity;
    saveData.supplier_production = this.company.supplier_production;
    saveData.purchased_volume = this.company.purchased_volume;
    saveData.certification = this.company.certification;
    saveData.latitude = this.company.latitude;
    saveData.longitude = this.company.longitude;
    saveData.country = this.company.country.id;
    saveData.region = this.company.region.id;
    saveData.city = this.company.city.id;
    saveData.year = this.company.year;
    saveData.period = this.company.period;



    let err  = 0;
    if (this.companyStatus && this.companyStatus.id && this.companyStatus.name) {
      
      this.modelValidErr["statuValidate"].err = false;
      this.modelValidErr["statuValidate"].touched = false;
      this.modelValidErr["statuValidate"].message = "";
    } else {
      this.modelValidErr["statuValidate"].err = true;
      this.modelValidErr["statuValidate"].touched = true;
      this.modelValidErr["statuValidate"].message = "required_field";
      err++;
    }
    if(!this.validateNoteV){
      this.modelValidErr["note"].err = true;
      this.modelValidErr["note"].touched = true;
      this.modelValidErr["note"].message = "required_field";
      err++;
    }else{
      this.modelValidErr["note"].err = false;
      this.modelValidErr["note"].touched = false;
      this.modelValidErr["note"].message = "";
    }
    if(err > 0){
      return;
    }
    saveData.note_validation = this.validateNoteV;
    saveData.validated = this.companyStatus.id;

    let verifyData = {   
      "verified": this.companyStatus.id,
      "verification_note":this.validateNoteV,
      "latitude" : saveData.latitude,
      "longitude" :saveData.longitude,
      "country" : saveData.country,
      "region" : saveData.region,
      "city" : saveData.city
    }
    //sendData
    //console.log('saveValidation:1', this.company);
    //console.log('saveValidation:2', this.companyStatus);
    //console.log("Sending data...",saveData);
    //confirm save
    const url = `coordinates/traceability/verify/update/${this.company.id}/`;
   
    // console.log('saveData', saveData)
    // console.log('verifyData', verifyData)
    
      this.loadEventService.loadTableEvent.emit(true);
      
      this.apiService.getResponse('PATCH', url,verifyData).then(
        async (resp: any) => {
          
          //console.log("resp",resp);
          this.resetCompany();
          this.init = false;
          await this.getListCountry();
          this.list();
          
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
/**************** */

  applyFilter(){
    this.textSearch$.next(this.textSearchMain);
  }
  applyFilterYear(){
    let year = new Date(this.year).getFullYear();
    this.year = year.toString()
    this.year$.next(this.year);
  }
  clearYear(){
    this.year = "";
    this.year$.next(this.year);
  }
  applyFilterPeriod(ev:any=null){
    this.periodo = ev;
    this.periodo$.next(this.periodo);
  }

  searchStatusRevision(event: any) {
    this.status_revision = event;
    this.statusRevision$.next(this.status_revision);
  }

  aplyStartDate(){
    this.start_date$.next(this.start_date);
  }
  
  aplyEndDate(){
    this.end_date$.next(this.end_date);
  }

  applyFilterCompanies(){
    this.selected_company$.next(this.selected_company);
  }

  clear() {

    this.year = '';
    this.periodo = null;
    this.status_revision = null;
    this.textSearchMain = '';
    this.selected_company = null;
    this.status_revision = null;
    this.start_date = '';
    this.end_date = '';
    this.list();
  }

  createForm(){
    this.is_productor = false;
    if(this.company && this.company.actor_type ){
      //console.log("createForm:",this.company.actor_type);
      this.is_productor = this.company.actor_type.is_productor;
      if(this.is_productor){
        this.markerOptions = { draggable: true };
      }else{
        this.markerOptions = { draggable: false };
      }
    }
    this.form = this.formBuilder.group({
      listCountry: [this.company?this.company.country:'', [Validators.required]],
      country: [this.company?this.company.country.id:''],
      listRegion: [this.company?this.company.region:'', [Validators.required]],
      region: [this.company?this.company.region.id:''],
      listCity: [this.company?this.company.city:'', [Validators.required]],
      city: [this.company?this.company.city.id:''],
      latitude: [this.company?this.company.latitude:'', [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ]],
      longitude: [this.company?this.company.longitude:'', [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ]]
    })
  }
  get f() {
    return this.form.controls;
  }
  setCoordinates(){
    if(!this.is_productor){
      return;
    }
    let latitude = this.form.value.latitude;
    let longitude = this.form.value.longitude
    this.position = {
      lat: Number.parseFloat(latitude) ,
      lng: Number.parseFloat(longitude) ,
    };
    this.company.latitude = latitude;
    this.company.longitude = longitude;
    //console.log("position:",this.position);
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
        let latitude:number = (place.geometry.location?.lat())?place.geometry.location?.lat():0;
        let longitude = (place.geometry.location?.lng())?place.geometry.location?.lng():0;
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
    if(!this.is_productor){
      return;
    }
    if (event.latLng != null && this.company) {
      this.position = event.latLng.toJSON();
      this.company.latitude = Number(this.position.lat).toFixed(8);
      this.company.longitude = Number(this.position.lng).toFixed(8);
      this.form.patchValue({
        latitude:this.company.latitude,
        longitude:this.company.longitude
      });
      this.createForm();
      /* this.form = this.formBuilder.group({
        latitude: [this.company?this.company.latitude:'', [Validators.required]],
        longitude: [this.company?this.company.longitude:'', [Validators.required]]
      }) */
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
    if(!this.is_productor){
      return;
    }
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

  expand(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }
  /*************Mapa*********** */
}
