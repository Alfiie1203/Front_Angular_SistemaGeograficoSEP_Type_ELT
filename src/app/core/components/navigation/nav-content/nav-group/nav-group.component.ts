import {Component, Input, NgZone, OnInit} from '@angular/core';
import {NavigationItem} from '../../../../interfaces/navigation';
import {Location} from '@angular/common';
import { DattaConfig } from '../../../../../app-config';
import { PermissionsDetail } from '../../../../interfaces/user';

@Component({
  selector: 'app-nav-group',
  templateUrl: './nav-group.component.html',
  styleUrls: ['./nav-group.component.scss']
})
export class NavGroupComponent implements OnInit {
  @Input() item: NavigationItem = <NavigationItem>{};
  @Input() permissions!: string[]; 
  public dattaConfig: any;

  constructor(private zone: NgZone, private location: Location) {
    this.dattaConfig = DattaConfig.config;
  }

  ngOnInit() {
  }

}
