import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DattaConfig } from '../app-config';
import { ApiService } from '../core/services/api.service';
import { ShowMessageService } from '../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthOnedriveService } from '../core/services/auth-onedrive.service';


@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent implements OnInit {
  public dattaConfig: any;
  public navCollapsed: boolean;
  public navCollapsedMob: boolean;
  public windowWidth: number;
  display=false;
  time_expire=3601;
  seconds=0;

  constructor( 
    private location: Location,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private auth: AuthOnedriveService
    ) {
    this.dattaConfig = DattaConfig.config;

    this.windowWidth = window.innerWidth;
    this.navCollapsed = (this.windowWidth >= 992) ? this.dattaConfig['collapse-menu'] : false;
    this.navCollapsedMob = false;
  }

  ngOnInit(): void {

  }

  navMobClick() {
    if (this.navCollapsedMob && !(document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open'))) {
      this.navCollapsedMob = !this.navCollapsedMob;
      setTimeout(() => {
        this.navCollapsedMob = !this.navCollapsedMob;
      }, 100);
    } else {
      this.navCollapsedMob = !this.navCollapsedMob;
    }
  }


}
