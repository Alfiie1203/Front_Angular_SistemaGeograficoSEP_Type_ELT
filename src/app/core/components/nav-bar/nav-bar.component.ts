import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { DattaConfig } from '../../../app-config';
import { StorageService } from '../../services/storage.service';
import { User } from '../../interfaces/user';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  @Output() onNavCollapsedMob = new EventEmitter();
  public dattaConfig: any;
  public navCollapsedMob;
  public headerStyle: string;
  public menuClass: boolean;
  public collapseStyle: string;
  dataUser!:User;
  loadData=false;
  constructor(
    private loadEventService: EventService,
    private storageService: StorageService
  ) {
    this.dattaConfig = DattaConfig.config;
    this.navCollapsedMob = false;
    this.headerStyle = '';
    this.menuClass = false;
    this.collapseStyle = 'none';
    this.loadEventService.loadData.subscribe(()=> {this.loadData=true;this.getUser()})
  }

  ngOnInit() {
    if(!this.loadData)
      this.getUser();
  }

  getUser(){
    this.storageService.get('keyData').then((resp:User)=>{this.dataUser=resp})
  }

  toggleMobOption() {
   // console.log('this.menuClass', this.menuClass)
    this.menuClass = !this.menuClass;
    this.headerStyle = (this.menuClass) ? 'none' : '';
    this.collapseStyle = (this.menuClass) ? 'block' : 'none';
  }

}
