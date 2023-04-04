import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { StorageService } from 'src/app/core/services/storage.service';
import { User } from '../../core/interfaces/user';
import { ApiService } from '../../core/services/api.service';
import { ListQuestionsBank, Question, Category, Subcategory, Topic, ListCategories, ListTopics } from '../../core/interfaces/form';
import { EventService } from 'src/app/core/services/event.service';
import { ShowMessageService } from '../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
// import * as  VirtualSelect from 'node_modules/virtual-select-plugin/dist/virtual-select.min.js'
import { ViewportScroller } from '@angular/common';
import { environment } from '../../../environments/environment';
declare var VirtualSelect:any;

@Component({
  selector: 'app-question-bank',
  templateUrl: './question-bank.component.html',
  styleUrls: ['./question-bank.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class QuestionBankComponent implements OnInit {

  dataSource = new MatTableDataSource<Question>();
  columnsToDisplay = ['select', 'questions','state', 'actions'];
  selection = new SelectionModel<Question>(true, []);
  selectedRowIndex = -1;
  display=false;
  displayConfirm=false;
  textSearch='';
  listSize = 0;
  listData!: ListQuestionsBank;
  lang!:any;
  data!:any;
  pagination=5;
  path=environment.path;
  pageIndex = 0;

  listCategories!:Category[];
  listSubcategories!:Subcategory[];
  listTopics!:Topic[];

  category:any;
  subcategory:any;
  topic:any;

  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private readonly viewport: ViewportScroller
  ) { 
    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
      setTimeout(() => {
        this.showPreviewQuestion();
      }, 100);
    })
  }

  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
    this.list();
    this.getPermissions();
    this.getLang();
    this.getListCategories()
    // setTimeout(() => {
    //   VirtualSelect.init({ ele: '#aaa'});
    // }, 5000);
  }

  list(){
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    this.apiService.getResponse('GET', `questionbank/list/?limit=${this.pagination}&subcategory=${this.subcategory?this.subcategory.id:''}&topic=${this.topic?this.topic.id:''}&category=${this.category?this.category.id:''}`)
    .then((resp: any)=>{
     // console.log('resp', resp)
      this.listData = resp;
      this.listSize = this.listData.count;
      this.dataSource = new MatTableDataSource<Question>(this.listData.results);
      this.listTreatment();
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  listPaginationNext(){
    this.loadEventService.loadTableEvent.emit(true);
    const urlTemp = this.listData.next.replace(this.path,'');
    this.apiService.getResponse('GET',`${urlTemp}`)
    .then( (resp:ListQuestionsBank) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Question>(this.listData.results);
      this.loadEventService.loadTableEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  listPaginationBack(){
    this.loadEventService.loadTableEvent.emit(true);
    const urlTemp = this.listData.previous.replace(this.path,'');
    this.apiService.getResponse('GET',`${urlTemp}`)
    .then( (resp:ListQuestionsBank) =>{
      this.listData = resp;
      this.dataSource = new MatTableDataSource<Question>(this.listData.results);
      this.loadEventService.loadTableEvent.emit(false);
    }, error =>{
      this.loadEventService.loadTableEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.permissionAdd = resp.permissions.indexOf( "questionsbank.add_questionbank") > -1; 
      this.permissionChange = resp.permissions.indexOf("questionsbank.change_questionbank") > -1; 
      this.permissionDelete = resp.permissions.indexOf("questionsbank.delete_questionbank") > -1; 
      this.permissionView = resp.permissions.indexOf("questionsbank.view_questionbank") > -1; 
    })
  }

  paginationChangeSize(e:PageEvent){
    this.viewport.scrollToPosition([0, 100]);
    if(e.pageSize != this.pagination){
      this.pagination = e.pageSize;
      this.list();
    }else{
      if(e.pageIndex > this.pageIndex){
        this.pageIndex = e.pageIndex;
        this.listPaginationNext();
      }else{
        this.pageIndex = e.pageIndex;
        this.listPaginationBack();
      }
    }
  }

  getListCategories(){
    this.apiService.getResponse('GET','questionbank/category/list/?status=true')
    .then( (resp:ListCategories) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET',`questionbank/category/list/?status=true&limit=${resp.count}`)
        .then( (res:ListCategories) =>{
          this.listCategories = res.results;
        })
      }else{
        this.listCategories = []
      }
      
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getListSubcategories(){
    this.subcategory = undefined;
    this.topic=undefined;
    this.apiService.getResponse('GET',`questionbank/category/view/${this.category.id}/`)
    .then( (resp:Category) =>{
      this.listSubcategories = resp.subcategory;
      this.list();
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getListTopics(){
    this.topic=undefined;
    this.apiService.getResponse('GET',`questionbank/topic/list/simple/?status=true&category=${this.category.id}&subcategory=${this.subcategory.id}`)
    .then( (resp:ListTopics) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET',`questionbank/topic/list/simple/?status=true&category=${this.category.id}&subcategory=${this.subcategory.id}&limit=${resp.count}`)
        .then( (res:ListTopics) =>{
          this.listTopics = res.results;
          this.list();
        }, error =>{
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
        })
      }else{
        this.listTopics = []
      }
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getList_Topic(){
    this.list();
  }

  disableEnable(data: any){
    data.status = !data.status;
    const question = data;
    this.apiService.getResponse("PATCH", `questionbank/update/${question.id}/`, question)
    .then( resp =>{        
      // this.loading=false;
      // this.createForm();
      // this.displayConfirm=true;
      this.list();
    }, error =>{
      // this.loading=false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    });
  }

  clear(){
    this.category = undefined;
    this.subcategory = undefined;
    this.topic = undefined;
    this.listSubcategories = [];
    this.listTopics = [];
    this.list();
  }

  showPreviewQuestion(){
    const div_questions:any = document.getElementById('preview');
    if( (<HTMLDivElement>div_questions))
      (<HTMLDivElement>div_questions).innerHTML= '';
    let question:any;
    if(this.data){
      if ( this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionRatio();
        div_questions.appendChild(question)
      }
      if (this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionDropdown();
        div_questions.appendChild(question)
        setTimeout(() => {
          VirtualSelect.init({ ele: `#question_id_${this.data.id}`, placeholder: this.translate.instant('select_option'), hideClearButton: true});
        }, 100);
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionMatrizRadio();
        div_questions.appendChild(question)
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionMatrizListRadio();
        div_questions.appendChild(question);
        setTimeout(() => {
          let row = this.data.question_data.rows;
          Object.keys(row).forEach(key => {
            let column = this.data.question_data.columns;
            Object.keys(column).forEach(key_choices => {
              // div_select.id = `question_id_${this.data.id}_${key}_${key_choices}`
              VirtualSelect.init({ ele: `#question_id_${this.data.id}_${key}_${key_choices}`, placeholder: this.translate.instant('select_option'), hideClearButton: true});
            });
          });
        }, 100);
      }
      
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionCheckbox();
        div_questions.appendChild(question)
      }
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionCheckboxList();
        div_questions.appendChild(question);
        setTimeout(() => {
          VirtualSelect.init({ ele: `#question_id_${this.data.id}`, placeholder: this.translate.instant('select_option')});
        }, 100);
      }
      
      if (this.data.question_data.type == 'matrix_select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionMatrizCheckbox()
        div_questions.appendChild(question)
      }
      
      if(this.data.question_data.type == 'open_answer'){
        question = this.questionOpen();
        div_questions.appendChild(question)
      }

      if(this.data.question_data.type == 'file_upload'){
        question = this.questionFile();
        div_questions.appendChild(question)
      }
      // div_questions.appendChild(question)
    }
  }

  questionRatio(){
    const appearance = this.data.question_data.appearance
    const required = this.data.question_data.required
    const div_question = document.createElement('fieldset')
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    const label_question = document.createElement('legend')
    label_question.innerHTML = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    label_question.classList.add('font-14')
    label_question.classList.add('fw-semibold')
    label_question.classList.add('mb-0')
    if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      div_title.appendChild(label_question);
      div_title.appendChild(des);
      label_question.classList.add('mb-0');
      div_question.appendChild(div_title);
    }else{
      div_title.appendChild(label_question);
      div_question.appendChild(div_title);
    }
    // div_question.appendChild(label_question)
    let choices = this.data.question_data.choices
    let optionPos = 0;
    Object.keys(choices).forEach(key => {
      const div_option = document.createElement('div')
      div_option.classList.add('my-2');
      div_option.classList.add('d-flex');
      div_option.classList.add('align-items-center');
      div_option.classList.add('w-100');
      const input = document.createElement('input')
      input.classList.add('form-check-input')
      input.classList.add('me-2')
      input.setAttribute('type', appearance)
      if (required){
        input.setAttribute('required', '')
      }
      input.name = `question_id_${this.data.id}`
      input.id = `question_id_${this.data.id}_${optionPos}`
      input.value = choices[key][this.lang.code]
      input.classList.add('mt-0');
      div_option.appendChild(input)
      const label_option = document.createElement('label')
      label_option.setAttribute('for', input.id);
      label_option.classList.add('font-12');
      label_option.classList.add('w-100');
      const text_option = document.createTextNode(choices[key][this.lang.code]?choices[key][this.lang.code]:this.translate.instant('translation_available'))
      label_option.appendChild(text_option)
      div_option.appendChild(label_option)
      div_question.appendChild(div_option)
      optionPos++;
    });
    return div_question;
  }

  questionCheckbox(){
    const appearance = this.data.question_data.appearance
    const required = this.data.question_data.required
    const div_question = document.createElement('fieldset')
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    const label_question = document.createElement('legend')
    label_question.classList.add('font-14')
    label_question.classList.add('fw-semibold')
    label_question.classList.add('mb-0')
    label_question.innerHTML = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')

    if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      div_title.appendChild(label_question);
      div_title.appendChild(des);
      label_question.classList.add('mb-0');
      div_question.appendChild(div_title);
    }else{
      div_title.appendChild(label_question);
      div_question.appendChild(div_title);
    }

    const check_box_group = document.createElement('div')
    check_box_group.className += " checkbox-group"
    if (required){
      check_box_group.className += " required"
      }

    let choices = this.data.question_data.choices
    let optionPos = 0;
    Object.keys(choices).forEach(key => {
      const div_option = document.createElement('div')
      const input = document.createElement('input')
      div_option.classList.add('my-2');
      div_option.classList.add('d-flex');
      div_option.classList.add('align-items-center');
      div_option.classList.add('w-100');
      input.setAttribute('type', appearance)
      
      input.name = `question_id_${this.data.id}`
      input.id = `question_id_${this.data.id}_${optionPos}`
      input.classList.add('form-check-input')
      input.classList.add('me-2')
      input.value = choices[key][this.lang.code]
      input.classList.add('mt-0');
      div_option.appendChild(input)
      const label_option = document.createElement('label')
      const text_option = document.createTextNode(choices[key][this.lang.code]?choices[key][this.lang.code]:this.translate.instant('translation_available'))
      label_option.appendChild(text_option);
      label_option.setAttribute('for', input.id);
      label_option.classList.add('font-12');
      label_option.classList.add('w-100');
      div_option.appendChild(label_option)
      check_box_group.appendChild(div_option)
      div_question.appendChild(check_box_group)
      optionPos++;
    });
  
    return div_question;
  }

  questionDropdown(){
    const appearance = this.data.question_data.appearance
    const required = this.data.question_data.required
    const div_question = document.createElement('div')
    const div_select = document.createElement('select')
    div_select.id = `question_id_${this.data.id}`
    div_select.name = `question_id_${this.data.id}`;
    div_select.setAttribute('data-search', 'false');
    div_select.setAttribute('data-silent-initial-value-set', 'false');
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    const label_option = document.createElement('h3')
    const label_question = document.createTextNode(this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'))
    label_option.classList.add('font-14')
    label_option.classList.add('mb-0')
    label_option.classList.add('fw-semibold')
    

    // const des = document.createElement('span');
    // const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
    // des.classList.add('font-12');

    if (required){
      div_select.setAttribute('required','')
    }
    if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      label_option.appendChild(label_question)
      div_title.appendChild(label_option);
      div_title.appendChild(des);
      div_question.appendChild(div_title);
    }else{
      label_option.appendChild(label_question)
      div_title.appendChild(label_option);
      div_question.appendChild(div_title);
    }
    let choices = this.data.question_data.choices

    let option = document.createElement('option')
    option.value = ''
    option.innerHTML = this.translate.instant('select_option');
    // option.selected = true;
    //option.disabled = true;
    div_select.appendChild(option) 
    //Renderchoices
    Object.keys(choices).forEach(key => {
      option = document.createElement('option')
      option.value = choices[key][this.lang.code]
      option.innerHTML = choices[key][this.lang.code]
      div_select.appendChild(option)
    });
    div_question.appendChild(div_select)
  return div_question
  }
 
  questionCheckboxList(){
    const appearance = this.data.question_data.appearance
    const required = this.data.question_data.required
    const div_question = document.createElement('div')
    const div_select = document.createElement('select')
    div_select.id = `question_id_${this.data.id}`
    div_select.name = `question_id_${this.data.id}`;
    div_select.setAttribute('data-search', 'false');
    div_select.setAttribute('data-silent-initial-value-set', 'false');
    div_select.multiple = true;
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    const label_option = document.createElement('h3')
    const label_question = document.createTextNode(this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'))
    label_option.classList.add('font-14')
    label_option.classList.add('fw-semibold')
    label_option.classList.add('mb-0')

    if (required){
      div_select.required = true;
    }
     if(this.data.question_data.description[this.lang.code]!=''){
       const des = document.createElement('span');
       const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
       des.classList.add('font-12');
       des.appendChild(des_question);
       // const br = document.createElement('br');
      label_option.appendChild(label_question)
      div_title.appendChild(label_option);
      div_title.appendChild(des);
      div_question.appendChild(div_title);
    }else{
      label_option.appendChild(label_question)
      div_title.appendChild(label_option);
      div_question.appendChild(div_title);
    }
    
    // div_question.appendChild(label_option)
    let choices = this.data.question_data.choices

    let option = document.createElement('option')
    //Renderchoices
    Object.keys(choices).forEach(key => {
      option = document.createElement('option')
      option.value = choices[key][this.lang.code]
      option.innerHTML = choices[key][this.lang.code]
      div_select.appendChild(option)
    });
    div_question.appendChild(div_select)
  return div_question

  }

  questionMatrizRadio(){
    const appearance = this.data.question_data.appearance
    const required = this.data.question_data.required
    let div_matrix   = document.createElement("div")
    let label_matrix   = document.createElement("h3")
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    label_matrix.classList.add('font-14')
    label_matrix.classList.add('fw-semibold')
    label_matrix.classList.add('mb-0')
    label_matrix.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      // const br = document.createElement('br');
     div_title.appendChild(label_matrix);
     div_title.appendChild(des);
     div_matrix.appendChild(div_title);
   }else{
     div_title.appendChild(label_matrix);
     div_matrix.appendChild(div_title);
   }
    // div_matrix.appendChild(label_matrix)
    const table_responsive = document.createElement('div');
       table_responsive.classList.add('table-responsive')
    let tabla   = document.createElement("table");
    tabla.classList.add('border-0')
    tabla.classList.add('table')
    let questions = this.data.question_data.rows
    let answers = this.data.question_data.columns
    let tblBody = document.createElement("tbody");
    
                table_responsive.appendChild(tabla);
    div_matrix.appendChild(table_responsive)
    //creo la fila del encabezado 
    let tr_title = document.createElement('tr')
    var celda_title = document.createElement("td");
    let textoCelda = document.createTextNode("")
    celda_title.appendChild(textoCelda)
    tr_title.appendChild(celda_title);

    Object.keys(answers).forEach(key => {
        var celda_answer = document.createElement("td")
        let textoCelda = document.createTextNode(answers[key][this.lang.code]?answers[key][this.lang.code]:this.translate.instant('translation_available'))
        celda_answer.classList.add('font-12')
        celda_answer.classList.add('text-pf-primary')
        celda_answer.classList.add('text-center')
        celda_answer.appendChild(textoCelda)
        tr_title.appendChild(celda_answer);
      });

    tblBody.appendChild(tr_title);

    //creo la fila de la pregunta  

    Object.keys(questions).forEach(key => {
      
      let tr_option = document.createElement('tr')
      var celda_question = document.createElement("td");
      celda_question.classList.add('font-12')
      let textoCelda = document.createTextNode(questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available'))
      celda_question.appendChild(textoCelda)
      tr_option.appendChild(celda_question);

      Object.keys(answers).forEach(key_q => {
        var celda_answer = document.createElement("td")
        celda_answer.classList.add('text-center')
        const input = document.createElement('input')
        if (required){
          input.setAttribute('required', '')
        }
        input.setAttribute('type', appearance)
        input.name = `question_id_${key}`
        input.value = answers[key_q][this.lang.code]?answers[key_q][this.lang.code]:this.translate.instant('translation_available')
        input.classList.add('form-check-input')
        celda_answer.appendChild(input)
        tr_option.appendChild(celda_answer);
      });

      tblBody.appendChild(tr_option);
      
    });

    tabla.appendChild(tblBody);
    tabla.setAttribute("border", "0");

    return div_matrix
  }

  questionMatrizCheckbox(){
    const appearance = this.data.question_data.appearance
    const required = this.data.question_data.required
    let div_matrix   = document.createElement("div")
    let label_matrix   = document.createElement("h3")
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    label_matrix.classList.add('font-14')
    label_matrix.classList.add('fw-semibold')
    label_matrix.classList.add('mb-0')
    label_matrix.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    // div_matrix.appendChild(label_matrix)
     if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      // const br = document.createElement('br');
     div_title.appendChild(label_matrix);
     div_title.appendChild(des);
     div_matrix.appendChild(div_title);
   }else{
     div_title.appendChild(label_matrix);
     div_matrix.appendChild(div_title);
   }
    // Obtener la referencia de los elementos de la tabla
    let questions = this.data.question_data.rows
    let answers = this.data.question_data.columns
    const table_responsive = document.createElement('div');
       table_responsive.classList.add('table-responsive')
    let tabla   = document.createElement("table");
    tabla.classList.add('table')
    tabla.classList.add('border-0')
    let tblBody = document.createElement("tbody");
    
                table_responsive.appendChild(tabla);
    div_matrix.appendChild(table_responsive)
    //creo la fila del encabezado 
    let tr_title = document.createElement('tr')
    var celda_title = document.createElement("td");
    let textoCelda = document.createTextNode("")
    celda_title.appendChild(textoCelda)
    tr_title.appendChild(celda_title);

    Object.keys(answers).forEach(key => {
        var celda_answer = document.createElement("td")
        celda_answer.classList.add('font-12')
        celda_answer.classList.add('text-pf-primary')
        celda_answer.classList.add('text-center')
        let textoCelda = document.createTextNode(answers[key][this.lang.code]?answers[key][this.lang.code]:this.translate.instant('translation_available'))
        celda_answer.appendChild(textoCelda)
        tr_title.appendChild(celda_answer);
      });

    tblBody.appendChild(tr_title);

    //creo la fila de la pregunta  

    Object.keys(questions).forEach(key => {
      let tr_option = document.createElement('tr')
      var celda_question = document.createElement("td");
      celda_question.classList.add('font-12')
      let textoCelda = document.createTextNode(questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available'))
      celda_question.appendChild(textoCelda)
      tr_option.appendChild(celda_question);

      Object.keys(answers).forEach(key_q => {
        var celda_answer = document.createElement("td")
        celda_answer.classList.add('text-center')
        const input = document.createElement('input')
        if (required){
          input.setAttribute('required', '')
        }
        input.setAttribute('type', appearance)
        input.name = `question_id_${key}`
        input.value = answers[key_q][this.lang.code]?answers[key_q][this.lang.code]:this.translate.instant('translation_available')
        input.classList.add('form-check-input')
        celda_answer.appendChild(input)
        tr_option.appendChild(celda_answer);
      });

      tblBody.appendChild(tr_option);
      
    });

    tabla.appendChild(tblBody);
    tabla.setAttribute("border", "0");

    return div_matrix;
  }

  questionMatrizListRadio(){
    const appearance = this.data.question_data.appearance
    const required = this.data.question_data.required
    let div_matrix   = document.createElement("div")
    let label_matrix   = document.createElement("h3")
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    label_matrix.classList.add('font-14')
    label_matrix.classList.add('fw-semibold')
    label_matrix.classList.add('mb-0')
    label_matrix.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    // div_matrix.appendChild(label_matrix)
     if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      // const br = document.createElement('br');
     div_title.appendChild(label_matrix);
     div_title.appendChild(des);
     div_matrix.appendChild(div_title);
   }else{
     div_title.appendChild(label_matrix);
     div_matrix.appendChild(div_title);
   }
   const table_responsive = document.createElement('div');
       table_responsive.classList.add('table-responsive')
    let tabla   = document.createElement("table");
    tabla.classList.add('border-0')
    tabla.classList.add('table')
    let tblBody = document.createElement("tbody");
    
                table_responsive.appendChild(tabla);
    div_matrix.appendChild(table_responsive)
    //creo la fila del encabezado 
    let tr_title = document.createElement('tr')
    var celda_title = document.createElement("td");
    let textoCelda = document.createTextNode("")
    celda_title.appendChild(textoCelda)
    tr_title.appendChild(celda_title);

    let questions = this.data.question_data.columns
    Object.keys(questions).forEach(key => {
        var celda_question = document.createElement("td")
        let textoCelda = document.createTextNode(questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available'))
        celda_question.classList.add('font-12')
        celda_question.classList.add('text-pf-primary')
        celda_question.appendChild(textoCelda)
        tr_title.appendChild(celda_question);
      });

    tblBody.appendChild(tr_title);

      //creo la fila de la pregunta  
    let rows = this.data.question_data.rows;
    let column_choices = this.data.question_data.column_choices;

    Object.keys(rows).forEach(key => {
      let tr_option = document.createElement('tr')
      var celda_question = document.createElement("td");
      celda_question.classList.add('align-middle');
      let textoCelda = document.createTextNode(rows[key][this.lang.code]?rows[key][this.lang.code]:this.translate.instant('translation_available'))
      celda_question.appendChild(textoCelda)
      celda_question.classList.add('font-12')
      tr_option.appendChild(celda_question);
      // const column_choices = rows[key].column_choices
      Object.keys(column_choices).forEach(key_choices => {
        var celda_dropdown = document.createElement("td");
        celda_dropdown.classList.add('align-middle')
        const div_select_global = document.createElement('div');
        let div_select = document.createElement('select');
        div_select_global.appendChild(div_select);
        div_select.id = `question_id_${this.data.id}_${key}_${key_choices}`
        div_select.name = `question_id_${this.data.id}`;
        div_select.setAttribute('data-search', 'false');
        div_select.setAttribute('data-silent-initial-value-set', 'false');
        if (required){
          div_select.setAttribute('required','')
        }
        let option = document.createElement('option')
        option.value = ''
        option.innerHTML = this.translate.instant('select_option');
        div_select.appendChild(option)
        const options = column_choices[key_choices]

        Object.keys(options).forEach(key_options => {
          option = document.createElement('option')
          option.value = options[key_options][this.lang.code]?options[key_options][this.lang.code]:this.translate.instant('translation_available')
          option.innerHTML = options[key_options][this.lang.code]?options[key_options][this.lang.code]:this.translate.instant('translation_available')
          div_select.appendChild(option)
        })
        celda_dropdown.appendChild(div_select)
        tr_option.appendChild(celda_dropdown)
      });

      tblBody.appendChild(tr_option);
      
    });

      tabla.appendChild(tblBody);

      return div_matrix
  }

  questionOpen(){
    const required = this.data.question_data.required
    const appearance = this.data.question_data.appearance
    const div_question = document.createElement('div')
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    const label = document.createElement('h3');
    label.classList.add('font-14')
    label.classList.add('fw-semibold')
    label.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    
    if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      div_title.appendChild(label);
      div_title.appendChild(des);
      label.classList.add('mb-0');
      div_question.appendChild(div_title);
    }else{
      div_title.appendChild(label);
      div_question.appendChild(div_title);
    }
    let input_div:any;
    if(appearance!='date'){
      input_div = document.createElement("input")
      input_div.classList.add('form-control');
      input_div.classList.add('question-des-input');
      input_div.classList.add('question-input');
      input_div.id = `open_question_${this.data.id}`;
      input_div.name = `open_question_${this.data.id}`;
      input_div.placeholder = this.translate.instant('write_answer');
      input_div.setAttribute("type", appearance)
      if (required){
        input_div.setAttribute('required', '')
      }
    }else{
      input_div = document.createElement("input")
      input_div.classList.add('form-control');
      input_div.classList.add('question-des-input');
      input_div.classList.add('question-input');
      input_div.id = `open_question_${this.data.id}`;
      input_div.name = `open_question_${this.data.id}`;
      input_div.placeholder = this.translate.instant('write_answer');
      input_div.setAttribute("type", appearance)
      if (required){
        input_div.setAttribute('required', '')
      }
    }

    div_question.appendChild(input_div)
    return div_question
  }

  questionFile(){
    const required = this.data.question_data.required
    const appearance = this.data.question_data.appearance
    const div_question = document.createElement('div')
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    const label = document.createElement('h3');
    label.classList.add('font-14');
    label.classList.add('fw-semibold');
    label.classList.add('mb-0');
    label.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')

    if(this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      div_title.appendChild(label);
      div_title.appendChild(des);
      label.classList.add('mb-0');
      div_question.appendChild(div_title);
    }else{
      div_title.appendChild(label);
      div_question.appendChild(div_title);
    }
    const div_file = document.createElement('div');
    div_file.classList.add("d-flex");
    div_file.classList.add("mb-2");
    div_file.classList.add("div-input");
    div_file.classList.add("align-items-center");
    const span_file = document.createElement('span');
    span_file.classList.add("w-100");
    span_file.classList.add("font-12");
    const span_file_2 = document.createElement('span');
    span_file_2.id=`file_name_${this.data.id}`
    span_file_2.innerText = this.translate.instant('upload_to_file');
    span_file.appendChild(span_file_2);
    const input_file = document.createElement('input');
    input_file.id = `file_input_${this.data.id}`
    input_file.classList.add(`file_input`);
    input_file.accept = "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    input_file.classList.add("w-100");
    const label_file = document.createElement("label");
    label_file.id = `file_input_${this.data.id}`;
    label_file.classList.add(`file_input`);
    label_file.innerText = this.translate.instant('import');
    div_file.appendChild(span_file);
    div_file.appendChild(input_file);
    div_file.appendChild(label_file);
    div_question.appendChild(div_file);
    return div_question
  }

  listTreatment(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    // this.filterValue = (event.target as HTMLInputElement).value;
    // this.filterValue$.next(this.filterValue );
  }


  checked(element:any){
    this.selection.clear();
    this.selection.toggle(element);
    this.selectedRowIndex = element.id;
    this.data = element;
    setTimeout(() => {
      this.showPreviewQuestion();
    }, 100);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
    this.selection.clear() :
    this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }


}
