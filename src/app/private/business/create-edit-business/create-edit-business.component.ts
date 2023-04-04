import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Commodity, ListCommodity } from 'src/app/core/interfaces/business';
import { ApiService } from 'src/app/core/services/api.service';
import { ListActorType, ActorType, BusinessGroup, ListBusinessGroup, Business } from '../../../core/interfaces/business';
import { Country, Goecode } from 'src/app/core/interfaces/cities';
import { Region, City, GeocoderAddress } from '../../../core/interfaces/cities';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { GooglemapsService } from '../../../core/services/googlemaps.service';
import { GeocoderResponse } from '../../../core/interfaces/maps';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { User } from 'src/app/core/interfaces/user';

@Component({
  selector: 'app-create-business',
  templateUrl: './create-edit-business.component.html',
  styleUrls: ['./create-edit-business.component.scss']
})
export class CreateEditBusinessComponent implements OnInit, AfterViewInit {

  select:any;
  options: google.maps.MapOptions;
  position:any
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  form: FormGroup = <FormGroup>{};
  displayConfirm = false;
  listCommodity!:Commodity[];
  listActorType!: ActorType[];
  listBusinessGroup!: BusinessGroup[];
  listCountry!: Country[];
  listRegions!: Region[];
  listCities!: City[];
  dataBusiness!: Business;
  update=false;
  loading=false;
  listSuggestion:[] = [];
  loadSuggestion=false;
  lang:any
  dataUser!: User;
  searchLocation = '';
  hideData=false;
  displayConfirmRegister=false;
  
  @ViewChild('search') public searchElementRef!: ElementRef; 
  @ViewChild(GoogleMap) public map!: GoogleMap; 
  
  
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
    private storageService: StorageService,
    private el: ElementRef
  ) {
    this.createForm();
    this.options = {
      center: {lat: 4.6482837, lng: -74.2478938},
      zoom: 7
    };
    this.aR.queryParams.subscribe((params:any)=>{
      if(params.id){
        this.storageService.get('keyData').then((resp:User)=>{
          this.dataUser=resp;
          this.getBusiness(params.id);
        })
        this.update=true;
      }
      // if(params.id!=undefined)
    })

    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
    })

   }

  ngOnInit(): void {
    // this.getDataUser();
    this.getLang()
    this.getCurrentLocation();
    this.getListCommodity();
    this.getListBusinessGroup();
    this.getListCountry();

  }

  getDataUser(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.dataUser=resp;
    })
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  ngAfterViewInit(): void {
    this.boxSearch();

    this.el.nativeElement.querySelector('#lat').addEventListener('keypress', function (evt: any) {
      if (evt.which != 8 && evt.which != 0 && evt.which < 44 || evt.which > 57)          
        evt.preventDefault();
    });

    this.el.nativeElement.querySelector('#lng').addEventListener('keypress', function (evt: any) {
      if (evt.which != 8 && evt.which != 0 && evt.which < 44 || evt.which > 57)
        evt.preventDefault();
    });
    
  }
  
  registerBusiness(){
    this.validateForm();
    if(this.form.valid){
      this.displayConfirmRegister=false;
      this.form.patchValue({
        commodity: this.form.value.listCommodity.id,
        company_group: this.form.value.listbusiness_group!=null&&this.form.value.listbusiness_group!=undefined?this.form.value.listbusiness_group.id:'',
        actor_type: this.form.value.listType_actor.id,
        country: this.form.value.listCountry.id,
        region: this.form.value.listRegion.id,
        city: this.form.value.listCity.id
      })
      this.loading=true;
      if(this.update){
        this.apiService.getResponse('PUT', `company/company/update/${this.dataBusiness.id}/`, this.form.value)
        .then(()=>{
          this.createForm();
          this.loading=false;
           this.listSuggestion =[]
          this.displayConfirm=true;
        }, error =>{
          this.loading = false;
            if(Array.isArray(error)){
              error.forEach((element:any) => {
                this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
              });
            }
        })
      }else{
        this.apiService.getResponse('POST', 'company/company/create/', this.form.value)
        .then(()=>{
          this.createForm();
          this.loading=false;
           this.listSuggestion =[]
          this.displayConfirm=true;
        }, error =>{
          this.loading = false;
            if(Array.isArray(error)){
              error.forEach((element:any) => {
                this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
              });
            }
        })
      }
    }else{
      this.validateForm();
      this.displayConfirmRegister=false;
    }    
  }

  getBusiness(id:any){
    this.loadEventService.loadEvent.emit(true);
    this.apiService.getResponse('GET', `company/company/view/${id}/`)
    .then(async (resp:Business)=>{
      this.dataBusiness = resp;
      await this.getListActorType(this.dataBusiness.commodity.id)
      if(this.dataBusiness.country){
        await this.getListRegions(this.dataBusiness.country.id);
        await this.getListCities(this.dataBusiness.country.id, this.dataBusiness.region.id);
      }
      this.assignData();
      if(this.dataUser.role?.name=='CLIENTE'){
        // setTimeout(() => {
        //   this.form.get('listbusiness_group')?.disable()
         // this.form.get('nit')?.disable()
        //   this.form.get('listCommodity')?.disable()
        //   this.form.get('listType_actor')?.disable()
        // }, 100);
        this.hideData=true
      }
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      this.loading = false;
      this.loadEventService.loadEvent.emit(false);
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  listBusiness(){
    this.router.navigateByUrl('business/list-business')
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
    }, error =>{
      this.loading = false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getListBusinessGroup(){
    this.apiService.getResponse('GET','company/companygroup/list-create-company-form/?status=true')
    .then( (resp:ListBusinessGroup) =>{
      this.listBusinessGroup = resp.results;
    }, error =>{
      this.loading = false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getListCountry(){
    this.apiService.getResponse('GET','cities/countries/')
    .then( (resp:Country[]) =>{
      this.listCountry = resp;
    }, error =>{
      this.loading = false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getListRegions(idContry:any){
    this.searchLocation = '';
    this.apiService.getResponse('GET', `cities/countries/${idContry}/regions/`)
    .then( async (resp:Region[]) =>{
      this.listRegions = resp;
      if(!this.update){
        this.searchLocation = `${this.form.value.listCountry.name}`
        await this.gMapsService.getLocationAddress( this.searchLocation)
        .subscribe ((response:GeocoderAddress)=>{
          //console.log("Map response:",response);
          if(response.status==="OK"){
            this.position = {
              lat: response.results[0].geometry.location.lat,
              lng: response.results[0].geometry.location.lng,
            }
            this.options = {
              zoom: 6
            };
            this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
            this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
          }
        })
      }
    }, error =>{
      this.loading = false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getListCities(idCountry:any, idRegion:any ){
    this.searchLocation = '';
    this.apiService.getResponse('GET', `cities/countries/${idCountry}/regions/${idRegion}/cities/`)
    .then( async (resp:City[]) =>{
      this.listCities = resp;
      if(!this.update){
        this.searchLocation = `${this.form.value.listCountry.name}, ${this.form.value.listRegion.name}`
        await this.gMapsService.getLocationAddress(this.searchLocation)
        .subscribe ((response:GeocoderAddress)=>{
          if(response.status==="OK"){
            this.position = {
              lat: response.results[0].geometry.location.lat,
              lng: response.results[0].geometry.location.lng,
            }
            this.options = {
              zoom: 8
            };
            this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
            this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
          }
        })
      }
    }, error =>{
      this.loading = false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  locationCity(){
    this.searchLocation = '';
    this.searchLocation = `${this.form.value.listCountry.name}, ${this.form.value.listRegion.name}, ${this.form.value.listCity.name}`
    this.gMapsService.getLocationAddress(this.searchLocation)
    .subscribe ((response:GeocoderAddress)=>{
      if(response.status==="OK"){
        this.position = {
          lat: response.results[0].geometry.location.lat,
          lng: response.results[0].geometry.location.lng,
        }
        this.options = {
          zoom: 14
        };
        this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
        this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
      }
    })
  }

  formNameSubscription:Subscription | undefined;
  createForm(){
    this.form = this.formBuilder.group({
      company_group: [''],
      listbusiness_group: [''],
      name: ['', Validators.required],
      nit: ['', Validators.required],
      commodity: [''],
      listCommodity: ['', Validators.required],
      actor_type: [''],
      listType_actor: ['', Validators.required],
      identifier_global_company: [''],
      id_proforest_business: [{value: '', disabled: true}],
      country: [''],
      listCountry: [ '' , Validators.required],
      region: [''],
      listRegion: ['', Validators.required],
      city: [''],
      listCity: ['',[
        Validators.required
      ]],
      latitude: ['', [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ]],
      longitude: ['', [
        Validators.required,
        Validators.pattern('^[\+|-]?[0-9]+([.|,][0-9]{4,8})?$')
      ]],
      status: [true]
    });
    this.formNameSubscription = this.form
      .get('name')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        //this.filterList();
        this.suggestions()
      });
  }
  ngOnDestroy(){
    if(this.formNameSubscription){
      this.formNameSubscription.unsubscribe();
    }
  }
  

  assignData(){
    const tempActorType = {
      id: this.dataBusiness.actor_type.id,
      name: this.dataBusiness.actor_type.name,
      name_es: this.dataBusiness.actor_type.name_es,
      name_en: this.dataBusiness.actor_type.name_en,
      name_pt: this.dataBusiness.actor_type.name_pt,
      proforest_actortype_code: this.dataBusiness.actor_type.proforest_actortype_code,
      commodity: this.dataBusiness.actor_type.commodity,
      status: this.dataBusiness.actor_type.status,
    }
    this.form.setValue({
      company_group: this.dataBusiness.company_group!=null&&this.dataBusiness.company_group!=undefined?this.dataBusiness.company_group.id:'',
      listbusiness_group: this.dataBusiness.company_group,
      name: this.dataBusiness.name,
      nit: this.dataBusiness.nit,
      commodity: this.dataBusiness.commodity.id,
      listCommodity: this.dataBusiness.commodity,
      actor_type: this.dataBusiness.actor_type.id,
      listType_actor: tempActorType,
      identifier_global_company: this.dataBusiness.identifier_global_company,
      id_proforest_business: this.dataBusiness.identifier_proforest_company,
      country: this.dataBusiness.country?this.dataBusiness.country.id:'',
      listCountry: this.dataBusiness.country?this.dataBusiness.country:'',
      region: this.dataBusiness.region?this.dataBusiness.region.id:'',
      listRegion: this.dataBusiness.region?this.dataBusiness.region:'',
      city: this.dataBusiness.city?this.dataBusiness.city.id:'',
      listCity: this.dataBusiness.city?this.dataBusiness.city:'',
      latitude: this.dataBusiness.latitude,
      longitude: this.dataBusiness.longitude,
      status: this.dataBusiness.status
    });
    //this.form.controls['identifier_global_company'].disable();
    this.position = {
      lat: this.dataBusiness.latitude,
      lng: this.dataBusiness.longitude
    };
  }

  suggestions(){
    if(this.form.value.name.length>0){
      this.loadSuggestion = true;
      this.apiService.getResponse('GET', `company/company/search/?limit=5&name=${this.form.value.name}` )
      .then((resp:any)=>{
        this.loadSuggestion = false;
        this.listSuggestion = resp.results;
      })
    }else{
      this.listSuggestion = [];
    }
  }

  getCurrentLocation(){
    if(!this.update){
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

  asingProforestCode(){
    this.form.controls['id_proforest_business'].setValue(this.form.value.identifier_global_company);
  }

  getTemCode(){
    if(this.form.value.identifier_global_company==''){
      this.apiService.getResponse('GET', `company/company/previousproforestcode/?commodity=${this.form.value.listCommodity.id}&actor_type=${this.form.value.listType_actor.id}`)
      .then( (resp:any) =>{
        this.form.controls['id_proforest_business'].setValue(resp.ProforestCode)
      }, error =>{
        this.loading = false;
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
      })
    }
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if(event.latLng != null){
      this.position = event.latLng.toJSON();
      this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
      this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
      /* this.gMapsService.geocodeLatLng(this.position)
      .then((response:GeocoderResponse)=>{
      })  */    
       this.gMapsService.getLocation(this.position)
      .subscribe((response: Goecode)=>{
        if(response.results.length){  
          const value = response.results[0]
        }
      })
    }
  }

  addMarkerInput() {
    this.position = {
      lat:parseFloat(this.form.value.latitude),
      lng:parseFloat(this.form.value.longitude)
    }
  }


  boxSearch(){
     // Binding autocomplete to search input control
     let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );
    // Align search box to center
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
      this.searchElementRef.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        //get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();
      //console.log('place', place)

        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }

        //set latitude, longitude and zoom
        let latitude = place.geometry.location?.lat();
        let longitude = place.geometry.location?.lng();
        this.position = {
          lat: latitude,
          lng: longitude,
        };
        this.form.controls['latitude'].setValue(Number(this.position.lat).toFixed(8));
        this.form.controls['longitude'].setValue(Number(this.position.lng).toFixed(8));
      });
    });
  }

  validateForm(){
    return Object.values( this.form.controls ).forEach( control => { 
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsTouched() );
      } else {
        control.markAsTouched();
      }
    });
  }

  get f(){
    return this.form.controls;
  }

  showConfirm(){
    this.validateForm();
    if(this.form.valid)
      this.displayConfirmRegister=true
  }

}
