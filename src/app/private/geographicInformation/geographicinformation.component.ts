import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-geographicinformation',
  templateUrl: './geographicinformation.component.html',
  styleUrls: ['./geographicinformation.component.scss']
})
export class GeographicinformationComponent implements OnInit {

  role:any;
  permissionAdd:boolean = false;
  permissionMake:boolean = false;
  constructor(
    private storageService: StorageService
  ) {
    this.getDataUser()
  }

  ngOnInit(): void {
   
  }

  getDataUser(){
    /* "company.can_assign_validator",
    "company.can_view_validation",
    "company.can_make_a_validation" */
    this.storageService.get('keyData').then((resp:User)=>{
      this.role = resp.role!;
      this.permissionAdd = resp.permissions.indexOf( "company.can_assign_validationcompany") > -1;
      this.permissionMake = resp.permissions.indexOf( "company.can_change_validationcompany") > -1; 
    })
  }

}
