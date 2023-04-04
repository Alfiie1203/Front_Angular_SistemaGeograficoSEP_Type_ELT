import { Component, OnInit } from '@angular/core';
import { Business } from '../../../core/interfaces/business';
import { ApiService } from '../../../core/services/api.service';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-business',
  templateUrl: './delete-business.component.html',
  styleUrls: ['./delete-business.component.scss']
})
export class DeleteBusinessComponent implements OnInit {

  textSearch='';
  showDetail = false;
  dataCompany!:Business;
  lang:any
  loading=false;
  loadingDelete=false;
  displayDelete=false;

  constructor(
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getLang();
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  search(){
    this.loading=true;
    this.showDetail = false;
    this.apiService.getResponse('GET',`company/deletebycode/?id_proforest_company=${this.textSearch}`)
    .then( (resp:Business) =>{
      this.dataCompany = resp
      this.loading= false;
      this.showDetail = true;
    }, error =>{
      this.loading= false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  delete(){
    this.loadingDelete=true;
    this.apiService.getResponse('POST',`company/deletebycode/?id_proforest_company=${this.textSearch}`)
    .then( (resp:Business) =>{
      this.loadingDelete= false;
      this.displayDelete=true;
    }, error =>{
      this.loadingDelete= false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  reset(){
    this.showDetail = false;
    this.textSearch = '';
    setTimeout(() => {
      this.dataCompany = <Business>{};
    }, 100);
    this.displayDelete = false;
  }

}
