import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, HostListener, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, NgForm, FormControl, FormArray } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Question, ListQuestionsBank, CompleteForm, ResultObservation, Observation } from '../../../../../core/interfaces/form';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../../../../core/services/storage.service';
import { ApiService } from '../../../../../core/services/api.service';
import { EventService } from '../../../../../core/services/event.service';
import { ShowMessageService } from '../../../../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Location, ViewportScroller } from '@angular/common';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidatorsService } from 'src/app/core/services/custom-validators.service';
declare var VirtualSelect:any;

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent implements OnInit {
  title_form='Nombre del formulario'

  form!: FormGroup;
  edit=false;
  typeInput='hidden';
  questions:any = [];
  group = 1;
  dataSource = new MatTableDataSource<Question>();
  columnsToDisplay = ['select','questions', 'actions'];
  selection = new SelectionModel<Question>(true, []);
  selectedRowIndex = -1;
  display=false;
  displayConfirm=false;
  textSearch='';
  listSize = 0;
  listData!: ListQuestionsBank;
  lang!:any;
  data!:any;
  dataForm!:CompleteForm;
  pagination=10;
  path=environment.path;
  pageIndex = 0;
  showPreview = false;
  sendData: any;
  displayRegister=false;
  displayObservation=false;
  listQuestion: any;
  idForm:any;
  idPrev:any;
  listValidate = [{id: 'NVA', name:'no_validate'}, { id: 'ARE', name:'self_reported'}, { id: 'VAL', name:'validated'}]
  dataQuestion:any;
  listObservation!:Observation[];
  name_group:any;
  temp:any;
  loading=false;
  public windowWidth: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('name') name!: ElementRef;

  constructor(
    private fb: FormBuilder, 
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private readonly viewport: ViewportScroller,
    private sanitizer: DomSanitizer,
    private router: Router,
    private validators: CustomValidatorsService,
    public location: Location,
    private el: ElementRef,
    private aRoute: ActivatedRoute
  ) {
    this.createForm();
    this.aRoute.queryParams.subscribe((params:any)=>{
      if(params.idForm){
        this.idForm = params.idForm;
        this.idPrev = params.idPrev;
        this.list(this.idForm);
      }
    })
    
    this.windowWidth = window.innerWidth;

    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
      this.list(this.idForm);
    })
    // this.createGroup();
  }

  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
    this.getLang();
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   if(this.el.nativeElement.querySelector('.file_input'))
    //     this.el.nativeElement.querySelector('.file_input').addEventListener('change', this.uploadFile.bind(this));
    // }, 1000);
  }


  createForm(){
    this.form = this.fb.group({
      accept_data: [false, [Validators.requiredTrue]]
    })
  }

  register(){
    this.validateForm();
    if(this.form.valid){
      this.loading=true;
      this.assingData();
      // this.apiService.getResponse('PATCH', `formulario/submitformulario/${this.idForm}/`)
      this.apiService.getResponse('PATCH', `formulario/validate/submit/formulario/${this.idForm}/`)
      .then(resp=>{
        this.displayRegister=true;
        this.loading=false;
      }, error =>{
        this.loading=false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
    }else{
      this.validateForm();
    } 
  }

  saveV(){
    this.loading=true;
    this.assingData();
      // this.apiService.getResponse('PATCH', `formulario/submitformulario/${this.idForm}/`)
      this.apiService.getResponse('PATCH', `formulario/validate/submitpartial/formulario/${this.idForm}/`)
        .then(resp=>{
          this.showMessage.show('success', this.translate.instant('attention'), this.translate.instant('save_succes'), 'pi pi-exclamation-triangle');
          this.location.back();
          this.loading=false;
        }, error =>{
          this.loading=false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
      })
  }

  assingData(){
    this.sendData = {}
  }


  list(idForm:any){
    this.questions =[];
    this.apiService.getResponse('GET', `formulario/list_questions/${idForm}/`)
    .then((resp: CompleteForm)=>{
      this.dataForm = resp;
      this.name_group = this.dataForm.name_group;
      this.listQuestion = this.dataForm.question_package;
      for(let [key, item] of Object.entries(this.listQuestion)){
        this.questions.push({[key]: []})
        const tempItem:any = item;
        for(let element of tempItem){
          this.showPreviewQuestion(element[0], key);
          this.setStyleSelect(element);
        }
      }
      this.changesFile();
      this.loadEventService.loadEvent.emit(false);
    }, error =>{
      this.loadEventService.loadEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  changesFile(){
    setTimeout(() => {
      const downloadFile =  this.el.nativeElement.querySelectorAll('.label_import');
      for(let item of downloadFile){
        item.addEventListener('click', this.downloadFile.bind(this));
      }
     }, 100);
  }

  
  setStyleSelect(element:any){
    setTimeout(() => {
    if(element[0].question_data.type ==  'select_one' && element[0].question_data.appearance == 'dropdown_list'){
      VirtualSelect.init({ ele: `#option_${element[0].id}`,id: `#option_${element[0].id}`, placeholder: this.translate.instant('select_option'), disabled: true, hideClearButton: true});
      if(element[0].response){
        (<any>document.querySelector(`#option_${element[0].id}`)).setValue(element[0].response);
        (<any>document.querySelector(`#option_${element[0].id}`)).disable();
      }
    }
    if (element[0].question_data.type == 'matrix_select_one' && element[0].question_data.appearance == 'dropdown_list'){
        let row = element[0].question_data.rows;
        Object.keys(row).forEach(key => {
          let column = element[0].question_data.columns;
          Object.keys(column).forEach(key_choices => {
            VirtualSelect.init({ ele: `#option_${element[0].id}_${key}_${key_choices}`, placeholder: this.translate.instant('select_option'), disabled: true, hideClearButton: true});
            if(element[0].response && element[0].response[`${key}_${key_choices}`]){
              (<any>document.querySelector(`#option_${element[0].id}_${key}_${key_choices}`)).setValue(element[0].response[`${key}_${key_choices}`]);
            }
          });
        });
    } 
    if (element[0].question_data.type ==  'select_multiple' && element[0].question_data.appearance == 'dropdown_list'){
        VirtualSelect.init({ ele: `#option_${element[0].id}`, placeholder: this.translate.instant('select_option'), disabled: true, hideClearButton: true});
        if(element[0].response){
          (<any>document.querySelector(`#option_${element[0].id}`)).setValue(element[0].response);
        }
      }
    }, 100);
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

  listForms(){
    this.displayRegister=false;
    this.router.navigateByUrl('forms/list-forms')
  }


  getLang(){
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }



  paginationChangeSize(e:PageEvent){
    this.viewport.scrollToPosition([0, 200]);
    if(e.pageSize != this.pagination){
      this.pagination = e.pageSize;
      // this.list();
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

  showPreviewQuestion(data:any, key:any){
    this.data = data;
    this.group = key;
    let question:any;
    const file_exclude = data.file_exclude
    const reviewer_observations = data.reviewer_observations
    const validation = this.setValidate(data.validation)
    if(this.data){
      if ( this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionRatio().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }
      if (this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionDropdown().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionMatrizRadio().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionMatrizListRadio().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }
      
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionCheckbox().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionCheckboxList().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }
      
      if (this.data.question_data.type == 'matrix_select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionMatrizCheckbox().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }
      
      if(this.data.question_data.type == 'open_answer'){
        question = this.questionOpen().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude});
      }

      if(this.data.question_data.type == 'file_upload'){
        question = this.questionFile().outerHTML;
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), label: this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), file_exclude: file_exclude})
      }
      this.form.addControl(`validate${this.data.id}`, new FormControl(validation?validation:{id: 'ARE', name:'self_reported'}));
      this.form.addControl(`description${this.data.id}`, new FormControl(reviewer_observations?reviewer_observations:''));
      this.showPreview = true;
    }
  }


  questionRatio(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    const response = this.data.response
    const div_question = document.createElement('fieldset')
    const div_title = document.createElement('div');
    let div_required:any;
    div_title.classList.add('line-question')
    // div_title.setAttribute('formGroupName', `question_${this.data.id}`)
    const label_question = document.createElement('legend')
    if (required){
      label_question.innerHTML =`${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code] :this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label_question.innerHTML = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    }
    label_question.classList.add('font-14')
    label_question.classList.add('fw-semibold')
    label_question.classList.add('mb-0')
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
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
      const input = document.createElement('input');
      input.classList.add('form-check-input');
      input.classList.add('me-2');
      input.setAttribute('type', appearance);
      input.name = `option_${this.group}_${this.data.id}`
      input.setAttribute('formControlName', `option_${this.data.id}`)
      input.id = `option_${this.data.id}_${optionPos}`
      input.value = choices[key][this.lang.code]
      input.classList.add('mt-0');
      input.classList.add('select_one-radio');
      input.disabled = true;
      if(response && response == input.value){
        input.setAttribute('checked', 'true');
      }
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
    if(div_required)
      div_question.appendChild(div_required);
    return div_question;
  }

  questionCheckbox(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    const response = this.data.response
    const div_question = document.createElement('fieldset')
    const div_title = document.createElement('div');
    let div_required:any;
    div_title.classList.add('line-question')
    // div_title.setAttribute('formGroupName', `question_${this.data.id}`)
    const label_question = document.createElement('legend')
    label_question.classList.add('font-14')
    label_question.classList.add('fw-semibold')
    label_question.classList.add('mb-0')
    // label_question.innerHTML = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    if (required){
      label_question.innerHTML =`${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code] :this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label_question.innerHTML = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    }

    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
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
      
      input.name = `option_${this.group}_${this.data.id}`
      input.id = `option_${this.data.id}_${optionPos}`
      input.setAttribute('formControlName', `option_${this.data.id}`)
      input.classList.add('form-check-input')
      input.classList.add('me-2')
      input.value = choices[key][this.lang.code]
      input.classList.add('mt-0');
      input.classList.add('select_multiple-dropdown_list');
      input.disabled = true;
      if(response){
        const existValue = response.indexOf(input.value) > - 1;
        if(existValue){
          input.setAttribute('checked', 'true');
        }
      }
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
    if(div_required)
      div_question.appendChild(div_required);;
  
    return div_question;
  }

  questionDropdown(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    const div_question = document.createElement('div')
    let div_required:any;
    const div_select = document.createElement('select')
    div_select.id = `option_${this.data.id}`
    div_select.name = `option_${this.group}_${this.data.id}`;
    div_select.setAttribute('formControlName', `option_${this.data.id}`)
    div_select.setAttribute('data-search', 'false');
    div_select.setAttribute('data-silent-initial-value-set', 'false');
    div_select.classList.add('select_one-dropdown_list');
    const div_title = document.createElement('div');
    div_title.classList.add('line-question')
    const label_option = document.createElement('h3')
    if(required){
      label_option.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label_option.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')}`
    }
    label_option.classList.add('font-14')
    label_option.classList.add('mb-0')
    label_option.classList.add('fw-semibold')
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
      // label_option.appendChild(label_question) 
      div_title.appendChild(label_option);
      div_title.appendChild(des);
      div_question.appendChild(div_title);
    }else{
      // label_option.appendChild(label_question)
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
    if(div_required)
        div_question.appendChild(div_required);
  return div_question
  }
 
  questionCheckboxList(){
    const appearance = this.data.question_data.appearance;
    const required = this.data.required;
    const div_question = document.createElement('div')
    let div_required:any;
    const div_select = document.createElement('select')
    div_select.id = `option_${this.data.id}`
    div_select.name = `option_${this.group}_${this.data.id}`;
    div_select.setAttribute('data-search', 'false');
    div_select.setAttribute('data-silent-initial-value-set', 'false');
    div_select.setAttribute('formControlName', `option_${this.data.id}`)
    div_select.multiple = true;
    const div_title = document.createElement('div');
    div_title.classList.add('line-question');
    div_select.classList.add('select_one-dropdown_list');
    const label_option = document.createElement('h3')
    if(required){
      label_option.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label_option.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')}`
    }
    // const label_question = document.createTextNode(this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'))
    label_option.classList.add('font-14')
    label_option.classList.add('fw-semibold')
    label_option.classList.add('mb-0')

    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
       const des = document.createElement('span');
       const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
       des.classList.add('font-12');
       des.appendChild(des_question);
       // const br = document.createElement('br');
      // label_option.appendChild(label_question)
      div_title.appendChild(label_option);
      div_title.appendChild(des);
      div_question.appendChild(div_title);
    }else{
      // label_option.appendChild(label_question)
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
    if(div_required)
      div_question.appendChild(div_required);
  return div_question

  }

  
  questionMatrizRadio(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    const response = this.data.response
    let div_matrix   = document.createElement("div")
    let label_matrix   = document.createElement("h3")
    const div_title = document.createElement('div');
    let div_required:any;
    this.form.addControl(`question_${this.data.id}`, this.fb.group({}))
    // div_matrix.setAttribute('formGroupName', `question_${this.data.id}`)
    div_title.classList.add('line-question')
    label_matrix.classList.add('font-14')
    label_matrix.classList.add('fw-semibold')
    label_matrix.classList.add('mb-0')
    if(required){
      label_matrix.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label_matrix.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')}`
    }
    // label_matrix.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
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
        // celda_answer.id = answers[key][this.lang.code]?answers[key][this.lang.code]:this.translate.instant('translation_available');
        celda_answer.appendChild(textoCelda)
        tr_title.appendChild(celda_answer);
      });

    tblBody.appendChild(tr_title);

    //creo la fila de la pregunta  
    let posRow = 0;
    Object.keys(questions).forEach(key => {
      let tr_option = document.createElement('tr')
      var celda_question = document.createElement("td");
      celda_question.classList.add('font-12')
      let textoCelda = document.createTextNode(questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available'))
      celda_question.appendChild(textoCelda)
      tr_option.appendChild(celda_question);
      let pos =0;
      Object.keys(answers).forEach(key_q => {
        var celda_answer = document.createElement("td")
        celda_answer.classList.add('text-center')
        const input = document.createElement('input')
        input.setAttribute('type', appearance)
        input.name = `question_${this.group}_${this.data.id}_${posRow}_${questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available')}`;
        input.id = `question_${this.data.id}_${posRow}_${pos}`;
        input.classList.add('option_matriz_one')
        input.value = answers[key_q][this.lang.code]?answers[key_q][this.lang.code]:this.translate.instant('translation_available');
        input.classList.add('form-check-input');
        input.disabled = true;
        if(response && response[textoCelda.nodeValue!] == input.value){
          input.setAttribute('checked', 'true');
        }
        celda_answer.appendChild(input)
        tr_option.appendChild(celda_answer);
        pos++;
      });

      tblBody.appendChild(tr_option);
      posRow++;
      
    });

    tabla.appendChild(tblBody);
    tabla.setAttribute("border", "0");
    if(div_required)
    div_matrix.appendChild(div_required);
    return div_matrix
  }

  questionMatrizCheckbox(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    const response = this.data.response
    let div_matrix   = document.createElement("div")
    let label_matrix   = document.createElement("h3")
    const div_title = document.createElement('div');
    let div_required:any;
    this.form.addControl(`question_${this.data.id}`, this.fb.group({}))
    // div_matrix.setAttribute('formGroupName', `question_${this.data.id}`)
    div_title.classList.add('line-question')
    label_matrix.classList.add('font-14')
    label_matrix.classList.add('fw-semibold')
    label_matrix.classList.add('mb-0')
    if(required){
      label_matrix.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label_matrix.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')}`
    }
    // label_matrix.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
     if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
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

    let posRow = 0;
    Object.keys(questions).forEach(key => {
      const tempArr = this.form.get(`question_${this.data.id}`) as FormGroup;
      // if(required){
      //   tempArr.addControl(`question_${this.data.id}_${posRow}`, this.fb.array([], [Validators.required]));
      // }else{
      //   tempArr.addControl(`question_${this.data.id}_${posRow}`, this.fb.array([]))
      // }
      let tr_option = document.createElement('tr')
      var celda_question = document.createElement("td");
      celda_question.classList.add('font-12')
      let textoCelda = document.createTextNode(questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available'))
      celda_question.appendChild(textoCelda)
      tr_option.appendChild(celda_question);
      let pos=0;
      Object.keys(answers).forEach(key_q => {
        var celda_answer = document.createElement("td")
        celda_answer.classList.add('text-center')
        const input = document.createElement('input');
        input.setAttribute('type', appearance)
        input.name = `question_${this.group}_${this.data.id}_${posRow}_${questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available')}`;
        input.id = `question_${this.data.id}_${posRow}_${pos}`;
        input.value = answers[key_q][this.lang.code]?answers[key_q][this.lang.code]:this.translate.instant('translation_available');
        input.classList.add('option_matriz_checkbox');
        input.disabled = true;
        // input.name = `question_${this.group}_${this.data.id}_${posRow}_${questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available')}`;
        // input.id = `question_${this.data.id}_${posRow}_${pos}`;
        input.classList.add('form-check-input')
        if(response && response[textoCelda.nodeValue!]){
          const existValue = response[textoCelda.nodeValue!].indexOf(input.value) > - 1;
          if(existValue){
            input.setAttribute('checked', 'true');
          }
        }
        celda_answer.appendChild(input)
        tr_option.appendChild(celda_answer);
        pos++;
      });

      tblBody.appendChild(tr_option);
      posRow++;
    });

    tabla.appendChild(tblBody);
    tabla.setAttribute("border", "0");
    if(div_required)
    div_matrix.appendChild(div_required);

    return div_matrix;
  }

  questionMatrizListRadio(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    let div_matrix   = document.createElement("div")
    let label_matrix   = document.createElement("h3")
    const div_title = document.createElement('div');
    let div_required:any;
    this.form.addControl(`question_${this.data.id}`, this.fb.group({}))
    // div_matrix.setAttribute('formGroupName', `question_${this.data.id}`)
    div_title.classList.add('line-question')
    label_matrix.classList.add('font-14')
    label_matrix.classList.add('fw-semibold')
    label_matrix.classList.add('mb-0')
    if(required){
      label_matrix.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label_matrix.innerHTML= `${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')}`
    }
    // label_matrix.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
     if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
      const des = document.createElement('span');
      const des_question = document.createTextNode(this.data.question_data.description[this.lang.code]?this.data.question_data.description[this.lang.code]:this.translate.instant('translation_available'))
      des.classList.add('font-12');
      des.appendChild(des_question);
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
    
    //         table_responsive.appendChild(tabla);
    // div_matrix.appendChild(table_responsive)
    if(this.windowWidth <= 576){
      table_responsive.appendChild(tabla);
      div_matrix.appendChild(table_responsive)
    }else{
      div_matrix.appendChild(tabla)
    }
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
      celda_question.classList.add('text-pf-primary')
      celda_question.appendChild(textoCelda);
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
      Object.keys(column_choices).forEach(key_choices => {
        var celda_dropdown = document.createElement("td");
        celda_dropdown.classList.add('align-middle')
        const div_select_global = document.createElement('div');
        let div_select = document.createElement('select');
        div_select_global.appendChild(div_select);
        div_select.id = `option_${this.data.id}_${key}_${key_choices}`
        // input.name = `question_${this.group}_${this.data.id}_${posRow}_${questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available')}`;

        div_select.name = `option_${this.group}_${this.data.id}_${key}_${key_choices}`;
        div_select.classList.add('dropdown_list_matriz');
        div_select.setAttribute('data-search', 'false');
        div_select.setAttribute('data-silent-initial-value-set', 'false');
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
      if(div_required)
    div_matrix.appendChild(div_required);

      return div_matrix
  }

  questionOpen(){
    const required = this.data.required
    const appearance = this.data.question_data.appearance
    const div_question = document.createElement('div')
    const response = this.data.response
    const div_title = document.createElement('div');
    let div_required:any;
    div_title.classList.add('line-question')
    const label = document.createElement('h3');
    label.classList.add('font-14')
    label.classList.add('fw-semibold')
    if (required){
      label.innerHTML =`${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code] :this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label.innerHTML = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    }
    // label.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
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
      input_div.classList.add('open_answer')
      input_div.id = `option_${this.data.id}`;
      input_div.name = `option_${this.group}_${this.data.id}`;
      input_div.placeholder = this.translate.instant('write_answer');
      input_div.setAttribute("type", appearance);
      input_div.setAttribute('formControlName', `question_${this.data.id}`)
      input_div.readOnly = true;
      if(response){
        input_div.setAttribute("value",response);
      }

    }else{
      input_div = document.createElement("input")
      input_div.classList.add('form-control');
      input_div.classList.add('question-des-input');
      input_div.classList.add('question-input');
      input_div.classList.add('open_answer')
      input_div.id = `option_${this.data.id}`;
      input_div.name = `option_${this.group}_${this.data.id}`;
      input_div.placeholder = this.translate.instant('write_answer');
      input_div.setAttribute("type", appearance);
      input_div.setAttribute('formControlName', `question_${this.data.id}`)
      input_div.readOnly = true;
      if(response){
        input_div.setAttribute("value",response);
      }
    }

    div_question.appendChild(input_div)
    if(div_required)
    div_question.appendChild(div_required);
    return div_question
  }

  questionFile(){
    const required = this.data.required
    const appearance = this.data.question_data.appearance
    const response = this.data.response
    const div_question = document.createElement('div')
    const div_title = document.createElement('div');
    let div_required:any;
    div_title.classList.add('line-question')
    const label = document.createElement('h3');
    label.classList.add('font-14');
    label.classList.add('fw-semibold');
    label.classList.add('mb-0');
    if (required){
      label.innerHTML =`${this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code] :this.translate.instant('translation_available')} <span class="text-danger">*</span>`
    }else{
      label.innerHTML = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')
    }
    // label.innerText = this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')

    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]!=''){
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
    span_file_2.innerText = response?response.name:this.translate.instant('upload_to_file');
    span_file.appendChild(span_file_2);
    const span_delete = document.createElement('span');
    span_delete.id=`file_delete_${this.data.id}`
    span_delete.classList.add('d-none');
    const img_delete = document.createElement('img')
    img_delete.src = 'assets/images/delete.png'
    img_delete.width=15;
    img_delete.classList.add('cursor-pointer')
    img_delete.classList.add('delete-file')
    img_delete.classList.add('mx-2')
    img_delete.id = `img_delete_${this.group}_${this.data.id}`
    span_delete.appendChild(img_delete);
    const input_file = document.createElement('input');
    input_file.id = `option_${this.data.id}`;
    input_file.name = `option_${this.group}_${this.data.id}`;
    input_file.classList.add(`file_input`);
    input_file.type = 'file';
    input_file.classList.add("w-100");
    let label_file:any;
    if(response){
      label_file = document.createElement("label");
      label_file.id = `option_${this.group}_${this.data.id}_`;
      label_file.innerText = this.translate.instant('download');
      label_file.classList.add(`label_import`);

    }
     div_file.appendChild(span_file);
     div_file.appendChild(span_delete);
     div_file.appendChild(input_file);
     if(response){
       div_file.appendChild(label_file);
     }
    div_question.appendChild(div_file);
    if(div_required)
    div_question.appendChild(div_required);
    return div_question
  }


  listTreatment(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  checked(element:any){
    this.selection.clear();
    this.selection.toggle(element);
    this.selectedRowIndex = element.id;
    this.data = element;
    setTimeout(() => {
      // this.showPreviewQuestion();
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

  validateForm(){
    for(let [key, item] of Object.entries(this.listQuestion)){
      // this.questions.push({[key]: []})
      const tempItem:any = item;
      for(let element of tempItem){
        if(this.form.get(`question_${element[0].id}`) && this.form.get(`question_${element[0].id}`)?.invalid){
          document.getElementsByClassName(`require_question_${element[0].id}`)[0]?.classList.remove('d-none');
        }
        
      }
    }
    return Object.values( this.form.controls ).forEach( control => { 
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control =>control.markAsTouched() );
      } else {
        control.markAsTouched();
      }
    });
  }

  get f(){
    return this.form.controls;
  }



  viewList(){
    this.viewport.scrollToPosition([0, 200]);
  }

  drop(event: CdkDragDrop<string[]>, pos:any) {
    moveItemInArray(this.questions[pos][(pos+1)], event.previousIndex, event.currentIndex);
    // moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  sendCommit(id:any){
    const sendData={
      "reviewer_observations": this.form.get(`description${id}`)?.value,
      "validation": this.form.get(`validate${id}`)?.value.id
    };
    (<HTMLButtonElement>document.getElementById(`btnSend${id}`)).disabled = true;
    this.apiService.getResponse('PATCH', `formulario/response_answer/${id}/`, sendData)
    .then( resp =>{
      // this.form.get(`description${id}`)?.setValue('');
      this.showMessage.show('success', this.translate.instant('attention'), this.translate.instant('observation_success'), 'pi pi-exclamation-triangle');
      // (<HTMLButtonElement>document.getElementById(`btnSend${id}`)).disabled = true;
       (<HTMLTextAreaElement>document.getElementById(`description${id}`)).disabled = true;
       (<HTMLInputElement>document.getElementById(`validate${id}`)).disabled = true;
    }, error =>{
      (<HTMLButtonElement>document.getElementById(`btnSend${id}`)).disabled = false;
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  moreObservation(data:any){
    this.dataQuestion = data;
    this.apiService.getResponse('GET', `formulario/history_answer/${this.dataQuestion.id}/`)
    .then( (resp:ResultObservation) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET', `formulario/history_answer/${this.dataQuestion.id}/?limit=${resp.count}`)
        .then( (resp:ResultObservation) =>{
          this.listObservation = resp.results;
          this.displayObservation=true;
        });
      }else{
        this.displayObservation=true;
        this.listObservation=[];
      }
      // this.showMessage.show('success', this.translate.instant('attention'), 'observation_success', 'pi pi-exclamation-triangle');
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  setValidate(validate:any){
    // {id: 'NVA', name:'no_validate'}, { id: 'ARE', name:'self_reported'}, { id: 'VAL', name:'validated'}
    if( validate == 'NVA')
      return {id: 'NVA', name:'no_validate'};
    if( validate == 'ARE')
      return { id: 'ARE', name:'self_reported'};
    if( validate == 'VAL')
      return {id: 'VAL', name:'validated'};
    return null;
  }

  downloadFile(ev:any){

    const target:any = ev.target.id.split('_')

    const group = target[1];
    const id = target[2];

    const question = this.listQuestion[group].find((item:any)=> item[0].id == id);

    if(question[0].response){
      window.open(question[0].response.url)
    }
  }

}
