import { Component, OnInit } from '@angular/core';
import { User, Rol } from '../../../core/interfaces/user';
import { StorageService } from '../../../core/services/storage.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-forms',
  templateUrl: './list-forms.component.html',
  styleUrls: ['./list-forms.component.scss']
})
export class ListFormsComponent implements OnInit {

  role: Rol = <Rol>{};
  permissionAdd = false;
  permissionChange = false;
  permissionDelete = false;
  permissionView = false;
  type:any;
  
  constructor(
    private storageService: StorageService,
    private aRoute: ActivatedRoute
  ) {
    this.aRoute.data.subscribe((params:any)=>{
      if(params.assing){
         this.type = params.assing;
      }

    })
  }
  
  ngOnInit(): void {

        this.getDataUser();


  }

  getDataUser(){
    this.storageService.get('keyData').then((resp:User)=>{
      if(resp.groups.name =='SUPERUSUARIO' && this.type){
        this.role.name = "COLABORADOR";
      }
      else{
        this.role = resp.role!;
      }
      this.permissionAdd = resp.permissions.indexOf( "proforestform.add_proforestform") > -1; 
      this.permissionChange = resp.permissions.indexOf("proforestform.change_proforestform") > -1; 
      this.permissionDelete = resp.permissions.indexOf("proforestform.delete_proforestform") > -1; 
      this.permissionView = resp.permissions.indexOf("proforestform.view_proforestform") > -1; 
    })
  }


}
