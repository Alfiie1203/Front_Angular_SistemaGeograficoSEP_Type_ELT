import {AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild} from '@angular/core';

import {Location} from '@angular/common';
import { DattaConfig } from '../../../../app-config';
import { NavigationItem } from 'src/app/core/interfaces/navigation';
import { User, PermissionsDetail } from '../../../interfaces/user';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-nav-content',
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit, AfterViewInit {
  @Output() onNavCollapsedMob = new EventEmitter();

  public dattaConfig: any;
  public navigation: any ;
  public prevDisabled: string;
  public nextDisabled: string;
  public contentWidth: number;
  public wrapperWidth: any;
  public scrollWidth: any;
  public windowWidth: number;
  permissions: string[] = [];

  @ViewChild('navbarContent', {static: false}) navbarContent: ElementRef = <ElementRef>{};
  @ViewChild('navbarWrapper', {static: false}) navbarWrapper: ElementRef = <ElementRef>{};

  constructor(public nav: NavigationItem, private storageService: StorageService) {
    this.dattaConfig = DattaConfig.config;
    this.windowWidth = window.innerWidth;
    this.prevDisabled = 'disabled';
    this.nextDisabled = '';
    this.scrollWidth = 0;
    this.contentWidth = 0;
  }
  
  ngOnInit() {
    if (this.windowWidth < 992) {
      this.dattaConfig['layout'] = 'vertical';
      setTimeout(() => {
        document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
        (document.querySelector('#nav-ps-datta') as HTMLElement).style.maxHeight = '100%';
      }, 500);
    }
    this.getPermissions();
  }
  
  ngAfterViewInit() {
    if (this.dattaConfig['layout'] === 'horizontal') {
      this.contentWidth = this.navbarContent.nativeElement.clientWidth;
      this.wrapperWidth = this.navbarWrapper.nativeElement.clientWidth;
    }
  }
  
  async getPermissions(){
/*     await this.storageService.get('keyData').then((resp:User)=>{

      for(let key in resp.permissions_detail) {
        this.permissions.push(key);
      }
      //console.log('this.permissions', this.permissions)
    }) */
    this.navigation = this.nav.get();
  }

  scrollPlus() {
    this.scrollWidth = this.scrollWidth + (this.wrapperWidth - 80);
    if (this.scrollWidth > (this.contentWidth - this.wrapperWidth)) {
      this.scrollWidth = this.contentWidth - this.wrapperWidth + 80;
      this.nextDisabled = 'disabled';
    }
    this.prevDisabled = '';
    (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
  }

  scrollMinus() {
    this.scrollWidth = this.scrollWidth - this.wrapperWidth;
    if (this.scrollWidth < 0) {
      this.scrollWidth = 0;
      this.prevDisabled = 'disabled';
    }
    this.nextDisabled = '';
    (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
  }

  fireLeave() {
    // const sections = document.querySelectorAll('.pcoded-hasmenu');
    // for (let i = 0; i < sections.length; i++) {
    //   sections[i].classList.remove('active');
    //   sections[i].classList.remove('pcoded-trigger');
    // }

    // let current_url = this.location.path();
    // if (this.location['_baseHref']) {
    //   current_url = this.location['_baseHref'] + this.location.path();
    // }
    // const link = "a.nav-link[ href='" + current_url + "' ]";
    // const ele = document.querySelector(link);
    // if (ele !== null && ele !== undefined) {
    //   const parent = ele.parentElement;
    //   const up_parent = parent.parentElement.parentElement;
    //   const last_parent = up_parent.parentElement;
    //   if (parent.classList.contains('pcoded-hasmenu')) {
    //     parent.classList.add('active');
    //   } else if(up_parent.classList.contains('pcoded-hasmenu')) {
    //     up_parent.classList.add('active');
    //   } else if (last_parent.classList.contains('pcoded-hasmenu')) {
    //     last_parent.classList.add('active');
    //   }
    // }
  }

  navMob() {
    if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      this.onNavCollapsedMob.emit();
    }
  }

  fireOutClick() {
    // let current_url = this.location.path();
    // if (this.location['_baseHref']) {
    //   current_url = this.location['_baseHref'] + this.location.path();
    // }
    // const link = "a.nav-link[ href='" + current_url + "' ]";
    // const ele = document.querySelector(link);
    // if (ele !== null && ele !== undefined) {
    //   const parent = ele.parentElement;
    //   const up_parent = parent.parentElement.parentElement;
    //   const last_parent = up_parent.parentElement;
    //   if (parent.classList.contains('pcoded-hasmenu')) {
    //     if (this.dattaConfig['layout'] === 'vertical') {
    //       parent.classList.add('pcoded-trigger');
    //     }
    //     parent.classList.add('active');
    //   } else if(up_parent.classList.contains('pcoded-hasmenu')) {
    //     if (this.dattaConfig['layout'] === 'vertical') {
    //       up_parent.classList.add('pcoded-trigger');
    //     }
    //     up_parent.classList.add('active');
    //   } else if (last_parent.classList.contains('pcoded-hasmenu')) {
    //     if (this.dattaConfig['layout'] === 'vertical') {
    //       last_parent.classList.add('pcoded-trigger');
    //     }
    //     last_parent.classList.add('active');
    //   }
    // }
  }

}
