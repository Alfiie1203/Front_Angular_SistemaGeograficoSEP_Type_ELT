import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TypeQuestion } from 'src/app/core/interfaces/form';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { EventService } from 'src/app/core/services/event.service';
import { TranslateService } from '@ngx-translate/core';
import { ShowMessageService } from '../../../core/services/show-message.service';

@Component({
  selector: 'app-create-edit-question-bank',
  templateUrl: './create-edit-question-bank.component.html',
  styleUrls: ['./create-edit-question-bank.component.scss']
})
export class CreateEditQuestionBankComponent implements OnInit {

  title=''
  selectedOption:any;
  // selectedOption:any = {name: 'matrix_list', code: 'matrix_list', img:'assets/images/matriz_list_option.png'};
  options!:TypeQuestion[];
  data:any;
  update=false;

  constructor(
    public location: Location,
    private aRoute: ActivatedRoute,
    private apiService: ApiService,
    private loadEventService: EventService,
    private translate: TranslateService,
    private showMessage: ShowMessageService
  ) {
    setTimeout(() => {
      this.options = [
        {name: 'open_question', code: 'open_question', img:'assets/images/open_answer.png'},
        {name: 'select_one', code: 'select_one', img:'assets/images/unique_option.png'},
        {name: 'select_one_list', code: 'select_one_list', type: 'select_one', img:'assets/images/list_unique_option.png'},
        {name: 'select_multiple', code: 'select_multiple', img:'assets/images/multiple_option.png'},
        {name: 'select_multiple_list', code: 'select_one_list', type: 'select_multiple', img:'assets/images/list_unique_option.png'},
        {name: 'matrix_select_one', code: 'matrix_select_one', img:'assets/images/matriz_unique_option.png'},
        {name: 'matrix_select_multiple', code: 'matrix_select_multiple', img:'assets/images/matriz_multiple_option.png'},
        {name: 'matrix_list', code: 'matrix_list', img:'assets/images/matriz_list_option.png'},
        {name: 'upload_file', code: 'upload_file', img:'assets/images/upload_file.png'},
      ]
    }, 100);
    this.aRoute.queryParams.subscribe( (params:any) =>{
      if(params.idData){
        this.update=true;
        this.getQuestion(params.idData);
      }
    })
  }
  
  ngOnInit(): void {
  }

  setOption(){
    this.title = this.selectedOption.name;
  }

  getQuestion(id: any){
    this.loadEventService.loadEvent.emit(true);
    this.apiService.getResponse('GET', `questionbank/view/${id}/`)
    .then((resp:any) =>{
      this.data = resp;
      this.setSelectedOption();
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      // this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  setSelectedOption(){
    if (this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'radio'){
      this.selectedOption = {name: 'select_one', code: 'select_one', img:'assets/images/unique_option.png'};
      this.title = this.selectedOption.name;
    }
    if (this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'dropdown_list'){
      this.selectedOption = {name: 'select_one_list', code: 'select_one_list', type: 'select_one', img:'assets/images/list_unique_option.png'};
      this.title = this.selectedOption.name;
    }

    if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'radio'){
      this.selectedOption = {name: 'matrix_select_one', code: 'matrix_select_one', img:'assets/images/matriz_unique_option.png'};
      this.title = this.selectedOption.name;
    }

    if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'dropdown_list'){
      this.selectedOption = {name: 'matrix_list', code: 'matrix_list', img:'assets/images/matriz_list_option.png'};
      this.title = this.selectedOption.name;
    }

    if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'checkbox'){
      this.selectedOption = {name: 'select_multiple', code: 'select_multiple', img:'assets/images/multiple_option.png'};
      this.title = this.selectedOption.name;
    }

    if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'dropdown_list'){
      this.selectedOption = {name: 'select_multiple_list', code: 'select_one_list', type: 'select_multiple', img:'assets/images/list_unique_option.png'};
      this.title = this.selectedOption.name;
    }

    if (this.data.question_data.type == 'matrix_select_multiple' && this.data.question_data.appearance == 'checkbox'){
      this.selectedOption = {name: 'matrix_select_multiple', code: 'matrix_select_multiple', img:'assets/images/matriz_multiple_option.png'};
      this.title = this.selectedOption.name;
    }

    if (this.data.question_data.type == 'open_answer'){
      this.selectedOption = {name: 'open_question', code: 'open_question', img:'assets/images/open_answer.png'};
      this.title = this.selectedOption.name;
    }

    if (this.data.question_data.type == 'file_upload'){
      this.selectedOption = {name: 'upload_file', code: 'upload_file', img:'assets/images/upload_file.png'};
      this.title = this.selectedOption.name;
    }
    
  }
  
  setOptionQuestion(ev: Event){
    this.selectedOption = ev;
    this.title = this.selectedOption.name;
    this.update=false;
  }

}
