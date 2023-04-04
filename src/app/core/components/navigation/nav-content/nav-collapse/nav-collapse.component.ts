import {Component, Input, OnInit} from '@angular/core';
import {NavigationItem} from '../../../../interfaces/navigation';
import {animate, group, state, style, transition, trigger} from '@angular/animations';
import { DattaConfig } from '../../../../../app-config';
import { PermissionsDetail } from '../../../../interfaces/user';
import { EventService } from 'src/app/core/services/event.service';

@Component({
  selector: 'app-nav-collapse',
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)', display: 'block'}),
        animate('250ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ],
})
export class NavCollapseComponent implements OnInit {
  public visible;
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

  permisionColapse:any = {

  }

  constructor(
    private loadServices: EventService
  ) {
    this.visible = false;
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
    if(this.permisionStatus[this.item.id]!=undefined)
      this.isItem = true;     
    else
      this.isItem = false;
    
      if(this.item.function){
        this.permisionStatus[this.item.id] = false
        this.item.function().then( (r:any)=>{
          this.permisionStatus[this.item.id] = r.permission;
        });
      }


  }

  navCollapse(e:any) {
    this.visible = !this.visible;

    let parent = e.target;
    if (this.themeLayout === 'vertical') {
      parent = parent.parentElement;
    }

    const sections = document.querySelectorAll('.pcoded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] !== parent) {
        sections[i].classList.remove('pcoded-trigger');
      }
    }

    let first_parent = parent.parentElement;
    let pre_parent = parent.parentElement.parentElement;
      if (first_parent.classList.contains('pcoded-hasmenu')) {
        do {
          first_parent.classList.add('pcoded-trigger');
          // first_parent.parentElement.classList.toggle('pcoded-trigger');
          first_parent = first_parent.parentElement.parentElement.parentElement;
        } while (first_parent.classList.contains('pcoded-hasmenu'));
      } else if (pre_parent.classList.contains('pcoded-submenu')) {
        do {
          pre_parent.parentElement.classList.add('pcoded-trigger');
          pre_parent = pre_parent.parentElement.parentElement.parentElement;
        } while (pre_parent.classList.contains('pcoded-submenu'));
      }
      parent.classList.toggle('pcoded-trigger');
  }

}
