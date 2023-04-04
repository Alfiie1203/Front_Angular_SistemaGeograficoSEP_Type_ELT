import {Component, Input, NgZone, OnInit} from '@angular/core';
import {NavigationItem} from '../../../../interfaces/navigation';
import {Location} from '@angular/common';
import { DattaConfig } from '../../../../../app-config';
import { ApiService } from '../../../../services/api.service';
import { EventService } from 'src/app/core/services/event.service';

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements OnInit {
  @Input() item: NavigationItem = <NavigationItem>{};
  @Input() permissions!: string[]; 
  public dattaConfig: any;
  public themeLayout: string;
  permisionStatus:any = {
    actortype: false,
    commodity: false,
    company: false,
    companygroup: false,
    proforestform: false,
    formulario: false,
    category: false,
    questionbank: false,
    subcategory: false,
    topic: false,
    traceability: false,
    user: false,
    supplybaseregister: false
  };
  isItem = false;
  

  constructor(private location: Location,
    private apiService: ApiService,
    private loadServices: EventService
    ) {
    this.dattaConfig = DattaConfig.config;
    this.themeLayout = this.dattaConfig['layout'];
    this.loadServices.loadData.subscribe(()=> this.getPermission())
  }

  ngOnInit() {
    this.getPermission();

  }

   getPermission(){
/*     this.permissions.find( (item:string) => {
      
      if(item == "formulario" ){
        this.permisionStatus.proforestform = true
      }
      if(item == "traceability" ){
        this.permisionStatus.supplybaseregister = true
      }
      if(item == this.item.id){
        this.permisionStatus[item] = true;
      }
    }); */
    if(this.item.function){
      this.permisionStatus[this.item.id] = false
      this.item.function().then( (r:any)=>{
        this.permisionStatus[this.item.id] = r.permission;
      });
    }
    if(this.permisionStatus[this.item.id]!=undefined){
      this.isItem = true;  
    }else{
      this.isItem = false;
    }

      
  }

  closeOtherMenu(event:any, item: NavigationItem) {
    if (this.dattaConfig['layout'] === 'vertical') {
      const ele = event.target;
      if (ele !== null && ele !== undefined) {
        const parent = ele.parentElement;
        const up_parent = parent.parentElement.parentElement;
        const last_parent = up_parent.parentElement;
        const sections = document.querySelectorAll('.pcoded-hasmenu');
        for (let i = 0; i < sections.length; i++) {
          sections[i].classList.remove('active');
          sections[i].classList.remove('pcoded-trigger');
        }
        if (parent.classList.contains('pcoded-hasmenu')) {
          parent.classList.add('pcoded-trigger');
          parent.classList.add('active');
        } else if (up_parent.classList.contains('pcoded-hasmenu')) {
          up_parent.classList.add('pcoded-trigger');
          up_parent.classList.add('active');
        } else if (last_parent.classList.contains('pcoded-hasmenu')) {
          last_parent.classList.add('pcoded-trigger');
          last_parent.classList.add('active');
        }
      }
      if ((document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open'))) {
        document.querySelector('app-navigation.pcoded-navbar')?.classList.remove('mob-open');
      }
    } else {
      setTimeout(() => {
        const sections = document.querySelectorAll('.pcoded-hasmenu');
        for (let i = 0; i < sections.length; i++) {
          sections[i].classList.remove('active');
          sections[i].classList.remove('pcoded-trigger');
        }
      }, 500);
    }

    if(item.title == 'exit'){
      this.apiService.logout();
    }
  }

  logout(item: NavigationItem ){
    if(item.title == 'exit'){
      this.apiService.logout();
    }
  }

}
