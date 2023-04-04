import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { User } from '../../core/interfaces/user';
import { ApiService } from '../../core/services/api.service';
import { EventService } from '../../core/services/event.service';
import { ShowMessageService } from '../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dataUser!:User;
  loading = false;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
  ) {
    /* this.eventService.loadData.subscribe(()=>{
      this.getUser();
    }) */
   }

  ngOnInit(): void {
    // this.getUser();
    this.loadEventService.loadEvent.emit(true);
    setTimeout(() => {
      this.getUserDetail();
    }, 1000);
  }

  getUser(){
    // this.apiService.getResponse("GET",'users/me/').then((resp:User)=>{this.dataUser=resp})
    this.storageService.get('keyData').then((resp:User)=>{this.dataUser=resp;})
  }

  getUserDetail(){
    this.apiService.getResponse('GET', 'users/me/')
    .then((resp:any)=>{
     // console.log('resp', resp)
      this.storageService.storage('keyData', resp);
      // this.loading = false;
      this.getUser();
      this.loadEventService.loadData.emit();
      this.loadEventService.loadEvent.emit(false);
      // localStorage.setItem('time_sesion', '0');
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

}
