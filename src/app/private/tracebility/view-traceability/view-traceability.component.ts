import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TracebilityDetails } from 'src/app/core/interfaces/tracebility';
import { ApiService } from 'src/app/core/services/api.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from 'src/app/core/services/event.service';
import { Location } from '@angular/common';
import { StorageService } from 'src/app/core/services/storage.service';
import { User } from 'src/app/core/interfaces/user';

@Component({
  selector: 'app-view-traceability',
  templateUrl: './view-traceability.component.html',
  styleUrls: ['./view-traceability.component.scss']
})
export class ViewTraceabilityComponent implements OnInit {
  id:any = 0;
  data:TracebilityDetails | undefined;
  lang:any;
  /***UPDATE */
  role: string = '';
  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  /***UPDATE */
  listPeriod:any[] = [
    {
      id:0,
      name:"ANNUAL"
    },
    {
      id:1,
      name:"BIANNUAL_1"
    },
    {
      id:2,
      name:"BIANNUAL_2"
    }
  ]

  options: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  position:any
  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private loadEventService: EventService,
    public location:Location,
    private storageService: StorageService
  ) {
    this.options = {
      center: {lat: 4.6482837, lng: -74.2478938},
      zoom: 13
    };
    this.getLang();
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  async ngOnInit() {
    await this.getPermissions()
    this.id = this.route.snapshot.paramMap.get("id");
    if(this.id){
      this.getdata()
    }
  }

  getdata(){
    let url =`traceability/view/${this.id}/`
    this.apiService.getResponse('GET', url,).then(
      (resp: TracebilityDetails) => {
        if(resp){
          this.data = resp;
          this.position = {
            lat: this.data.latitude,
            lng: this.data.longitude,
          }
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
    );
  }

  editTraceability(){
    let url = ``;
    if(this.role == "CLIENTE"){
      url = `/traceability/create-edit-tracebility/${this.id}`;
    }else{
      url = `traceability/create-edit-traceability-admin/${this.id}`;
    }
    
    this.router.navigate([url]);
  }
  /****UPDATE */
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
  /****UPDATE */
}
