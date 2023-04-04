import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {

  op=0;
  request:any = {
    reset: false
  };
  requestRegister:any;;


  constructor(    
    private aRoute: ActivatedRoute,
    private router: Router
  ) {
    
    this.aRoute.queryParams.subscribe((params)=>{
      if(params['forgot']!=null&&params['forgot']!=undefined){
        this.op=2;
        this.request={
          reset: true,
          data: params['forgot']
        }
      }
      if(params['key']!=null&&params['key']!=undefined){
        this.op=1;
        this.requestRegister={
          key: params['key'],
          company: params['id'],
          name: params['name_company'],
          email: params['email']
        }
      }
    })
   }

  ngOnInit(): void {
  }

  forgotHome( ev: Event ){
    this.op = 2;
  }

  login(ev: Event){
    this.router.navigateByUrl('/home-public')
    this.op = 0;
  } 

}
