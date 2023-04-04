import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, HostListener, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Question, ListQuestionsBank, Category, Subcategory, Topic, ListTopics, ListCategories, ListColaborators, ListPeriod, Colaborators, Period, ViewForm } from '../../../core/interfaces/form';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../../core/services/storage.service';
import { ApiService } from '../../../core/services/api.service';
import { EventService } from '../../../core/services/event.service';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Location, ViewportScroller } from '@angular/common';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidatorsService } from 'src/app/core/services/custom-validators.service';
import { User } from '../../../core/interfaces/user';
declare var VirtualSelect:any;

@Component({
  selector: 'app-register-forms',
  templateUrl: './register-forms.component.html',
  styleUrls: ['./register-forms.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RegisterFormsComponent implements OnInit, AfterViewInit {
  title_form='Nombre del formulario'

  form!: FormGroup;
  edit=false;
  typeInput='hidden';
  questions:any = [];
  group = 1;
  listColaborators:Colaborators[] = []
  listPeriod:Period[] = []
  dataSource = new MatTableDataSource<Question>();
  columnsToDisplay = ['select','questions', 'actions'];
  selection = new SelectionModel<Question>(true, []);
  selectedRowIndex = -1;
  display=false;
  displayConfirm=false;
  displayLogicGroup=false;
  textSearch='';
  listSize = 0;
  listData!: ListQuestionsBank;
  lang!:any;
  data!:any;
  pagination=5;
  path=environment.path;
  pageIndex = 0;
  showPreview = false;
  sendData: any;
  displayRegister=false;
  displayLogic=false;
  dataQuestion:any;
  dataQuestionGroup:any;
  listQuestions:any;
  listQuestionsGroup:any;
  logicOptions:any;
  logicOptionsGroup:any;
  tempGroup:any;
  tempLogicGroup:any;
  tempPos:any;
  tempItem:any;
  tempListLogic:any =[];
  tempListLogicGroup:any;
  listCategories!:Category[];
  listSubcategories!:Subcategory[];
  listTopics!:Topic[];
  dataUser!:User;
  conditions:any;
  conditionsGroup:any;
  selectedOption:any;
  dataForm!:any;
  listGroupLogic:any;
  listGroup:any;
  temp:any;
  loading=false;
  update=false;
  idForm:any;
  auxGroup:any;
  auxGroupItem:any;
  auxItem:any;
  tempLogic:any;
  name_group:any;
  isDisabled=false;
  displayQuestion=false;
  category:any;
  subcategory:any;
  topic:any;

  deleteQ:any=[]
  

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('name') name!: ElementRef;

  @HostListener('submit', ['$event'])
  public onSubmit(event:any): void {
    if ('INVALID' === this.form.status) {
      this.viewport.scrollToPosition([0,0])
    }
  }

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
    private aRouter: ActivatedRoute
  ) {
    this.createForm();
    this.createGroup();
    this.aRouter.queryParams.subscribe((params:any)=>{
      if(params.id){
        this.update=true;
        this.idForm=params.id;
        this.getDataForm();
      }else
        this.getCode();
    });

    this.loadEventService.loadLanguage.subscribe(()=>{
      
    })

    this.name_group = {
      [this.group]: `Group name ${this.group}`
    }

  }

  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
 
    this.list();
    this.getLang();
    this.getListCategories();
    this.getListColaborators();
    this.getListPeriod();
    
  }

  ngAfterViewInit() {
    this.el.nativeElement.querySelector('#expiration_date').addEventListener('keypress', function (evt: any) {
      if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)          
        evt.preventDefault();
    });
  }

  getUser(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.dataUser=resp;
      const cola = {
          id: this.dataUser.id,
          full_name: `${this.dataUser.first_name} ${this.dataUser.second_name} ${this.dataUser.surname} ${this.dataUser.second_surname}`
      }
      if(!this.update)
        this.form.get('listColaborators')?.setValue([cola]);
    })
  }

  getDataForm(){
    this.apiService.getResponse('GET', `proforestform/view/${this.idForm}/`)
    .then((resp:ViewForm)=>{
      this.dataForm=resp;
      this.assingDataForm();
      this.isDisabled=true;
    })
  }

  assingDataForm(){
    //console.log('this.dataForm', this.dataForm)
    this.form.get('open_date')?.setValue(this.dataForm.open_date);
    this.form.get('name')?.setValue(this.dataForm.name);
    this.form.get('expiration_date')?.setValue(this.dataForm.validity_period);
    this.form.get('listColaborators')?.setValue(this.dataForm.collaborators);
    this.form.get('name')?.setValue(this.dataForm.name);
    this.form.get('code_form')?.setValue(this.dataForm.code_form);
    this.title_form = this.dataForm.name;
    this.name_group = this.dataForm.name_group;
    for(let [key, value] of Object.entries(this.dataForm.question_package)){
      if(Number(key)>1){
        this.addTemp()
      }
      const tempListQuestion:any = value;
      for(let [element, data] of Object.entries(tempListQuestion)){
        const tempDataQuestion:any = data;
        this.showPreviewQuestion(tempDataQuestion[0])
      }
    }
    
    // this.form.get('open_date')?.disable();
    // this.form.get('name')?.disable();
    // this.form.get('expiration_date')?.disable();
    // this.form.get('listColaborators')?.disable();
    // this.form.get('name')?.disable();
    // this.form.get('code_form')?.disable();
  }


  createForm(){
    this.form = this.fb.group({
      code_form: ['', [Validators.required]],
      open_date: ['', [Validators.required]],
      name: [this.title_form, [Validators.required]],
      expiration_date: ['', [Validators.required]],
      listPeriod: ['', [Validators.required]],
      period: [''],
      listColaborators: ['', [Validators.required]],
      colaborators: [[]],
      category: [''],
      subcategory: [''],
      topic: ['']
    },{
      validators: [this.validators.matchTextValidator('name', this.translate.instant('Nombre del formulario'))]
    })
  }

  register(){
    this.validateForm();
    if(this.form.valid){
        this.loading=true;
      this.assingData();
     // console.log('this.sendData', this.sendData)
      if(!this.update){
        this.apiService.getResponse('POST', 'proforestform/create/', this.sendData)
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
        this.apiService.getResponse('PATCH', `proforestform/update/${this.idForm}/`, this.sendData)
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
      }
    }else{
      this.validateForm();
    }
  }

  assingData(){
    this.sendData = {
      code_form: this.form.value.code_form,
      name: this.form.value.name,
      collaborators: this.form.value.listColaborators,
      open_date: this.form.value.open_date,
      period: this.form.value.listPeriod.id,
      validity_period: this.form.value.expiration_date,
      bank_questions: this.questions,
      name_group: this.name_group
    }
  }


  list(){
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    this.apiService.getResponse('GET', `questionbank/list/?limit=${this.pagination}&subcategory=${this.subcategory?this.subcategory.id:''}&topic=${this.topic?this.topic.id:''}&category=${this.category?this.category.id:''}`)
    .then((resp: ListQuestionsBank)=>{
      this.listData = resp;
      this.listSize = this.listData.count;
      this.dataSource = new MatTableDataSource<Question>(this.listData.results);
      this.listTreatment();
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
      setTimeout(() => {
        if(this.deleteQ.length>0){
          for(let i = 0; i< this.deleteQ.length; i++){
              if(document.getElementById(`btn_q${this.deleteQ[i]}`))
                document.getElementById(`btn_q${this.deleteQ[i]}`)!.style.display = 'inline-block';
          }
        }
        this.isAdd();
      }, 50);
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
      setTimeout(() => {
        if(this.deleteQ.length>0){
          for(let i = 0; i< this.deleteQ.length; i++){
              if(document.getElementById(`btn_q${this.deleteQ[i]}`))
                document.getElementById(`btn_q${this.deleteQ[i]}`)!.style.display = 'inline-block';
          }
        }
        this.isAdd();
      }, 10);
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
      setTimeout(() => {
        if(this.deleteQ.length>0){
          for(let i = 0; i< this.deleteQ.length; i++){
              if(document.getElementById(`btn_q${this.deleteQ[i]}`))
                document.getElementById(`btn_q${this.deleteQ[i]}`)!.style.display = 'inline-block';
          }
        }
        this.isAdd();
      }, 50);
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

  editCodeForm(){
    const input = <HTMLInputElement>this.name.nativeElement;
    input.select();
    this.typeInput='text';
    document.getElementById('name')!.style.width = `${this.form.value.name.length-2}ch`;
  }
  
  setEditCode(){
    this.typeInput='hidden';
    this.title_form = this.form.value.name;
  }
  
  widthInput(){
    document.getElementById('name')!.style.width = `${this.form.value.name.length}ch`
  }

  paginationChangeSize(e:PageEvent){
    this.viewport.scrollToPosition([0, 200]);
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

  getListColaborators(){
    this.apiService.getResponse('GET', `users/collaborators/`)
    .then((resp:ListColaborators)=>{
      this.listColaborators = resp.results.map(e => {return {id: e.id, full_name:e.full_name}});
      this.getUser();
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }

  getListPeriod(){
    this.apiService.getResponse('GET', `proforestform/periodlist/`)
    .then((resp:ListPeriod)=>{
      this.listPeriod = resp.results;
      if(this.update){
        this.form.get('listPeriod')?.setValue(this.dataForm.period);
      }
    }, error =>{
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
  })
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
    this.form.get('subcategory')?.setValue('');
    this.form.get('topic')?.setValue('');
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
    this.form.get('topic')?.setValue('');
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


  getCode(){
    this.apiService.getResponse('GET','proforestform/previouscode/')
    .then( (resp:any) =>{
      this.form.get('code_form')?.setValue(resp.ProforestFormCode);
      this.form.get('code_form')?.disable();
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  showPreviewQuestion(data:any){
    this.data = data;
    const required = data.required?data.required:false;
    const logic = data.logic;
    const logic_group = data.group_logic;
    let question:any;
    if(this.data){
      if ( this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionRatio().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type, logic: logic, logic_group: logic_group});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type});
      }
      if (this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionDropdown().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type, appearance: this.data.question_data.appearance, logic: logic, logic_group: logic_group});
        }
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type, appearance: this.data.question_data.appearance});
          const idData = this.data.id;
          setTimeout(() => {
            VirtualSelect.init({ ele: `#question_id_${idData}`, placeholder: this.translate.instant('select_option')});
          }, 100);
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionMatrizRadio().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), logic: logic, logic_group: logic_group});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')});
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionMatrizListRadio().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), logic: logic, logic_group: logic_group, appearance: this.data.question_data.appearance});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), appearance: this.data.question_data.appearance});
        const idData2 = this.data.id;
        const data2 = this.data;
        // console.log(' this.data.question_data.rows',  this.data.question_data.rows, this.data.question_data.columns)
        setTimeout(() => {
          let row = data2.question_data.rows;
          Object.keys(row).forEach(key => {
            let column = data2.question_data.columns;
            Object.keys(column).forEach(key_choices => {
              // div_select.id = `question_id_${this.data.id}_${key}_${key_choices}`
              VirtualSelect.init({ ele: `#question_id_${idData2}_${key}_${key_choices}`, placeholder: this.translate.instant('select_option')});
            });
          });
        }, 100);
      }
      
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionCheckbox().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type , logic: logic, logic_group: logic_group});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type });
      }
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionCheckboxList().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type, appearance: this.data.question_data.appearance , logic: logic, logic_group: logic_group});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, choices: this.data.question_data.choices, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), type: this.data.question_data.type, appearance: this.data.question_data.appearance });
        const idData3 = this.data.id;
        setTimeout(() => {
          VirtualSelect.init({ ele: `#question_id_${idData3}`, placeholder: this.translate.instant('select_option')});
        }, 100);
      }
      
      if (this.data.question_data.type == 'matrix_select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionMatrizCheckbox().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), logic: logic, logic_group: logic_group});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')});
      }
      
      if(this.data.question_data.type == 'open_answer'){
        question = this.questionOpen().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), logic: logic, logic_group: logic_group});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')});
      }

      if(this.data.question_data.type == 'file_upload'){
        question = this.questionFile().outerHTML;
        if(logic || logic_group){
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available'), logic: logic, logic_group: logic_group});
        }
        else
        this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), required: required, name:this.data.question_data.label[this.lang.code]?this.data.question_data.label[this.lang.code]:this.translate.instant('translation_available')});
      }
      this.showPreview = true;
      if(this.deleteQ.length>0){
        setTimeout(() => {
          const i = this.deleteQ.indexOf(Number(this.data.id))
          if(i>-1){
            this.deleteQ.splice(i, 1);  
          }
        }, 100);  
      }  
      this.isAdd();
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
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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

    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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
     if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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
     if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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
     if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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
    
    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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

    if(this.data.question_data.description&&this.data.question_data.description[this.lang.code]){
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

  clear(){
    this.category = undefined;
    this.subcategory = undefined;
    this.topic = undefined;
    this.list();
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
    return Object.values( this.form.controls ).forEach( control => { 
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsTouched() );
      } else {
        control.markAsTouched();
      }
    });
  }

  get f(){
    return this.form.controls;
  }

  setRequire(ev: Event, data:any, group:any, question:any){
    const chk = (<HTMLInputElement>ev.target).checked;
    this.questions[group][(group+1)][question].required = chk;
  }

  isAdd(){
    for(let i = 0; i< this.questions.length; i++){
      for(let j = 0; j < this.questions[i][i+1].length; j++){
        if(document.getElementById(`btn_q${this.questions[i][i+1][j].id}`))
          document.getElementById(`btn_q${this.questions[i][i+1][j].id}`)!.style.display = 'none';
      }
    }
  }

  deleteQuetion(data:any, group:any, questions:any){
    //console.log('deleteQuetion:', data)
    this.questions[group][(group+1)] = this.questions[group][(group+1)].filter((item:any)=> item.id !== data.id)
    this.deleteQ.push(data.id);
    //console.log('document.getElementById(`btn_q${data.id}`)', document.getElementById(`btn_q${data.id}`))
    if(document.getElementById(`btn_q${data.id}`))
      document.getElementById(`btn_q${data.id}`)!.style.display = 'inline-block';
  }

  createGroup(){
    this.questions.push({[this.group]: []})
  }

  add(){
    const contGroup =  this.questions.length;
    this.group=contGroup+1;
    this.questions.push({[this.group]: []});
    const idG = this.group;
    this.name_group[idG] = `Group name ${idG}`
    setTimeout(() => {
      if(<HTMLInputElement> document.getElementById(`group_${idG}`))
        (<HTMLInputElement> document.getElementById(`group_${idG}`)).checked = true
    }, 100);
  }

  addTemp(){
    const contGroup =  this.questions.length;
    this.group=contGroup+1;
    this.questions.push({[this.group]: []});
    const idG = this.group;
    // this.name_group[idG] = `Group name ${idG}`
    setTimeout(() => {
      (<HTMLInputElement> document.getElementById(`group_${idG}`)).checked = true
    }, 100);
  }

  delete(group:any, pos:any){
    this.questions.splice(pos,1)
    this.group=this.questions.length;
    let tempQuestion:any = [];
    const listGroup = group;
    
    for(let element of Object.values(listGroup)){
      const data:any = element;
      for(let e of data){
        const btnQ:any = e;
        if(document.getElementById(`btn_q${btnQ.id}`))
          document.getElementById(`btn_q${btnQ.id}`)!.style.display = 'inline-block';
      }
    }

    for (let i = 0; i < this.questions.length; i++) {
      const aux =this.questions[i]
      let elem:any;
      for(let e of Object.values(aux)){
        elem = e;
      }
      tempQuestion.push({[i+1]: elem})
    }
    this.questions = tempQuestion;

    for(let item of this.questions){
      const itemData = item;
      for(let element of Object.values(itemData)){
        const dataElement:any = element;
        for(let e of dataElement){
          const eData:any = e;
          if(eData.appearance && eData.appearance == 'dropdown_list'){
            const dropDrown:any = document.getElementsByName(`question_id_${eData.id}`)
            for(let i of dropDrown){
              setTimeout(() => {
                const iData = (<HTMLElement>i).id;
                  VirtualSelect.init({ ele: `#${iData}`, placeholder: this.translate.instant('select_option')});
              }, 100);
            }
          }

          
        }
      }
    }
    
    delete this.name_group[pos+1]
    let key = 1;
    let temp_name_group:any={};
    for(let item of Object.values(this.name_group)){
      temp_name_group[key] = item;
      key++;
    }
    this.name_group = temp_name_group;
    setTimeout(() => {
      (<HTMLInputElement> document.getElementById(`group_${this.group}`)).checked = true
    }, 100);
  }

  viewList(){
    this.displayQuestion = true;
    setTimeout(() => {
      if(this.update){
        for(let i = 0; i< this.questions.length; i++){
          for(let j = 0; j < this.questions[i][i+1].length; j++){
            if(document.getElementById(`btn_q${this.questions[i][i+1][j].id}`))
              document.getElementById(`btn_q${this.questions[i][i+1][j].id}`)!.style.display = 'none';
          }
        }
      }
      if(this.deleteQ.length>0){
        for(let i = 0; i< this.deleteQ.length; i++){
            if(document.getElementById(`btn_q${this.deleteQ[i]}`))
              document.getElementById(`btn_q${this.deleteQ[i]}`)!.style.display = 'inline-block';
        }
      }
    }, 100);
    // this.viewport.scrollToPosition([0, 200]);
  }

  drop(event: CdkDragDrop<string[]>, pos:any) {
    moveItemInArray(this.questions[pos][(pos+1)], event.previousIndex, event.currentIndex);
    // moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  showSkip(data:any, groupQuestion:any, group:any, pos:any){
    const groupListQuestion = groupQuestion.filter((element:any) => element.name!==data.name);
    this.dataQuestion=data;
    this.tempGroup = group;
    this.tempItem = pos;
    this.logicOptions = Object.values(this.dataQuestion.choices).map((element:any)=>{
      return {id: element, name: element[this.lang.code]}
    });
    if(this.dataQuestion.type && this.dataQuestion.type=='select_multiple'){
      this.conditions=[
        {id: '&&', name: this.translate.instant('and')},
        {id: '||', name: this.translate.instant('or')},
      ];
    }else{
      this.conditions=[
        {id: '==', name: this.translate.instant('equal')},
        {id: '!=', name: this.translate.instant('different')},
        {id: '>', name: this.translate.instant('higher')},
        {id: '<', name: this.translate.instant('minor')}
      ];
    }
    this.listQuestions=groupListQuestion.map((e:any)=>{
      return {id:e.id, name:e.name}
    });
    //Set Logic
    // console.log('this.dataQuestion', this.dataQuestion)
    if(this.dataQuestion.logic){
      this.tempListLogic  = 
        this.dataQuestion.logic.map((element:any)=>{
          return {
            ids:  element.ids?element.ids.map((e:any)=>{return this.listQuestions.find((el:any)=>{return e.id == el.id})}):'',
            condition: this.conditions.find((e: any) => {
              if(element.condition)
                return e.id == element.condition.id
              return '';
            }),
            option: element.option.map((el:any)=>{
              return this.logicOptions.find((e:any)=>{
                return this.isEqual(el.id ,e.id)
              })
            })
          }
        });
    }else{
      this.tempListLogic = [
        {
          ids: '',
          condition: '',
          option: []
        }
      ]
    }
    // console.log('this.tempListLogic', this.tempListLogic)
    this.questions[this.tempGroup][(this.tempGroup+1)][this.tempItem].logic = this.tempListLogic;
    this.displayLogic = true;
  }

  setLogic(ev: any, pos:any=0){
    this.tempPos = pos;
    const option = ev.value;
    if(this.dataQuestion.type && this.dataQuestion.type=='select_multiple'){
      this.questions[this.tempGroup][(this.tempGroup+1)][this.tempItem].logic[pos].option = option;
    }
    else
      this.questions[this.tempGroup][(this.tempGroup+1)][this.tempItem].logic[pos].option = [option];
  }

  setLogicCondition(ev: any, pos:any=0){
      const condition = ev.value;
      this.questions[this.tempGroup][(this.tempGroup+1)][this.tempItem].logic[pos].condition = condition;
  }

  setLogicQuestion(ev: any, pos:any){
    const questionLogic = Object.values(ev.value).map((item:any)=> {return {id: item.id,name:item.name}} );
    this.questions[this.tempGroup][(this.tempGroup+1)][this.tempItem].logic[pos].ids = questionLogic;
  }

  cancelLogic(){
    delete this.questions[this.tempGroup][(this.tempGroup+1)][this.tempItem].logic;
    this.displayLogic=false;
    this.dataQuestion=undefined; 
    this.listQuestions=undefined; 
    this.logicOptions=undefined;
    this.tempGroup = undefined;
    this.tempItem = undefined;
    this.tempListLogic = undefined;
    this.selectedOption = undefined;
  }

  addCondition(){
    this.tempListLogic.push({
      ids: '',
      condition: '',
      option: []
    });
  }

  isEqual(obj1:any, obj2:any) {
    let props1 = Object.getOwnPropertyNames(obj1);
    let props2 = Object.getOwnPropertyNames(obj2);
    if (props1.length != props2.length) {
        return false;
    }
    for (let i = 0; i < props1.length; i++) {
        let val1 = obj1[props1[i]];
        let val2 = obj2[props1[i]];
        let isObjects = this.isObject(val1) && this.isObject(val2);
        if (isObjects && !this.isEqual(val1, val2) || !isObjects && val1 !== val2) {
            return false;
        }
    }
    return true;
  }

  isObject(object:any) {
    return object != null && typeof object === 'object';
  }

  setLogicGruop(group: any, dataQuestion:any){

    const gr = group;
    this.listGroup = [...dataQuestion.slice(0, group), ...dataQuestion.slice(group + 1)];
    this.listGroupLogic = [];
    for(let element of this.listGroup){
        const dataElement:any= element;
        for(let [key, value] of Object.entries(dataElement)){
          this.listGroupLogic.push({id: key, name: `${this.translate.instant('group_')} ${key}`})
        }
    }


    const logic_group =  this.dataForm&&this.dataForm.group_logic.length>0?this.dataForm.group_logic:undefined;

    if(logic_group){
      this.tempLogic = logic_group.find((item:any) => item.source_groups == Number(gr)+1);

      if(this.tempLogic){
        let selectedGroup:any;
        for(let element of this.listGroup){
          const dataElement:any= element;
          for(let [key, value] of Object.entries(dataElement)){
            const valueKey:any = value;
            for (let e of Object.values(valueKey)) {
              const eValue:any = e;
              if(eValue.id == this.tempLogic.idQuestion.id){
                selectedGroup = key;
              }
              
            }
          }
        }
        this.tempListLogicGroup = [{
          groups: {id: selectedGroup, name: `${this.translate.instant('group_')} ${selectedGroup}`},
          idQuestion: this.tempLogic.idQuestion,
          condition: this.tempLogic.condition,
          source_groups: this.tempLogic.source_groups,
          option: this.tempLogic.option
        }];
        const temp = {value: this.tempListLogicGroup[0].groups}
        const temp2 = {value: this.tempListLogicGroup[0].idQuestion}

        this.setLogicQuestionGroup(temp, 0);
        this.setLogicQuestion2(temp2, 0);
      }else{
        this.tempListLogicGroup = [{
          groups: '',
          source_groups: Number(gr)+1,
          idQuestion: '',
          condition: '',
          option: []
        }];
      }
    }else{
      this.tempListLogicGroup = [{
        groups: '',
        source_groups: Number(gr)+1,
        idQuestion: '',
        condition: '',
        option: []
      }];
    }

    this.displayLogicGroup=true;
  }

  addConditionGroup(){
    this.tempListLogicGroup.push({
      groups: '',
      idQuestion: '',
      condition: '',
      option: []
    });
  }

  setLogicQuestionGroup(ev: any, pos:any){
    const questionLogic = ev.value;

    this.tempLogicGroup = questionLogic.id;
    for(let element of this.listGroup){
      const dataElement:any= element;
      for(let [key, value] of Object.entries(dataElement)){
        const keyData: any = key;
        const valueData: any = value;
        if(Number(keyData)==Number(questionLogic.id)){
          this.listQuestionsGroup = valueData.filter((e:any)=> e.type!=null&&e.type!=undefined).map((e:any)=>{return {id: e.id, name: e.name, type:e.type, choices: e.choices}});
        }
      }
    }

    for(let [keyItem, item] of Object.entries(this.questions)){
      const itemData:any = item;
      //console.log('itemData', itemData)
      for(let [key, value] of Object.entries(itemData)){
        if(Number(key)==Number(this.tempLogicGroup)){
          this.auxGroup = Number(keyItem);
          this.auxGroupItem = Number(key);
          return;
        }
      }
    }

  }

  setLogicQuestion2(ev: any, pos:any){
    this.dataQuestionGroup={};
    this.dataQuestionGroup=ev.value;
    this.logicOptionsGroup = Object.values(this.dataQuestionGroup.choices).map((element:any)=>{
      return {id: element, name: element[this.lang.code]}
    });
    if(this.dataQuestionGroup.type && this.dataQuestionGroup.type=='select_multiple'){
      this.conditionsGroup = [
        {id: '&&', name: this.translate.instant('and')},
        {id: '||', name: this.translate.instant('or')},
      ];
    }else{
      this.conditionsGroup=[
        {id: '==', name: this.translate.instant('equal')},
        {id: '!=', name: this.translate.instant('different')},
        {id: '>', name: this.translate.instant('higher')},
        {id: '<', name: this.translate.instant('minor')}
      ];
    }

    const tempData = this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))];
    for(let [key, value] of Object.entries(tempData)){
      const valueData:any = value;
      if(valueData.id==this.dataQuestionGroup.id){
        this.auxItem = key;
        this.tempListLogicGroup[0].idQuestion = {id: valueData.id, name: valueData.name, type:valueData.type, choices: valueData.choices};
        this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))][Number(this.auxItem)].logic_group = this.tempListLogicGroup;
        this.auxItem=key;
        return;
      }
    }

  }

  setLogicCondition2(ev: any, pos:any=0){
    const condition = ev.value;
    this.tempListLogicGroup[0].condition = condition;
    this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))][Number(this.auxItem)].logic_group = this.tempListLogicGroup;

  }
  
  setLogic2(ev: any, pos:any=0){
    this.tempPos = pos;
    const option = ev.value;
    if(this.dataQuestionGroup.type && this.dataQuestionGroup.type=='select_multiple'){
      this.tempListLogicGroup[0].option = option;
      this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))][Number(this.auxItem)].logic_group = this.tempListLogicGroup
    }
    else{
      this.tempListLogicGroup[0].option = [option];
      this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))][Number(this.auxItem)].logic_group = this.tempListLogicGroup;
    }
    if(!this.dataForm){
      this.dataForm = {group_logic : []}
    }
    const existLogic = this.dataForm.group_logic.findIndex((item:any) => item.source_groups == this.tempListLogicGroup[0].source_groups)
    if(existLogic>-1){
      this.dataForm.group_logic[existLogic] = this.tempListLogicGroup[0]
    }else{
      this.dataForm.group_logic.push(this.tempListLogicGroup[0])
    }


  }

  selectedGroup(group:any){
      this.group = group;
  }  
  

  setNameGroup(ev:Event, pos:any){
    const value = (<HTMLInputElement>ev.target).value
    this.name_group[pos]=value;
  }


  deleteExclusion(pos:any){
    this.tempListLogic.splice(Number(pos), 1)
    this.questions[this.tempGroup][(this.tempGroup+1)][this.tempItem].logic = this.tempListLogic;
  }
  
  deleteExclusionGroup(pos:any){
    this.tempListLogicGroup.splice(Number(pos), 1);
    this.tempListLogicGroup = [{
      groups: '',
      source_groups: this.auxGroup,
      idQuestion: '',
      condition: '',
      option: []
    }];
    const logic = this.questions[Number(this.auxGroup)]&&this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))][Number(this.auxItem)]?this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))][Number(this.auxItem)].logic_group:undefined;
    if(logic){
      this.questions[Number(this.auxGroup)][(Number(this.auxGroupItem))][Number(this.auxItem)].logic_group = this.tempListLogicGroup;
    }

  }

}
