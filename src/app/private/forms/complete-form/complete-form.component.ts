import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, HostListener, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, NgForm, FormControl, FormArray } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Question, ListQuestionsBank, CompleteForm } from '../../../core/interfaces/form';
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
import { AuthOnedriveService } from 'src/app/core/services/auth-onedrive.service';
import { User } from '../../../core/interfaces/user';
import { GetAllFolder, SesionUpload, UploadFile } from 'src/app/core/interfaces/one-drive';

declare var VirtualSelect:any;


@Component({
  selector: 'app-complete-form',
  templateUrl: './complete-form.component.html',
  styleUrls: ['./complete-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CompleteFormComponent implements OnInit, AfterViewInit {
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
  listQuestion: any;
  idForm:any;
  dataUser!:User;
  dataDrive:any;
  idFileTemp:any;
  name_group:any;
  temp:any;
  loading=false;
  disableQuestion=false;
  displayObservation=false;
  observations:any;
  dataOneDrive:any=environment.oneDrive;
  permissionFill=false;
  
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
    private aRoute: ActivatedRoute,
    private oneDrive: AuthOnedriveService
  ) {
    this.createForm();
    this.aRoute.queryParams.subscribe((params:any)=>{
      if(params.idForm){
        this.idForm = params.idForm;
        this.list(this.idForm);
        // this.getPermissions();
      }
      if(params.view){
        this.disableQuestion = true;
      }
    })
    this.windowWidth = window.innerWidth;

    this.loadEventService.loadLanguage.subscribe(()=>{
      this.getLang();
      // this.getPermissions();
      this.list(this.idForm);
    })
    // this.createGroup();
  }

  ngOnInit(): void {
    this.loadEventService.loadEvent.emit(true);
    this.getLang();
  }

  getPermissions(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.permissionFill = resp.permissions.indexOf("formulario.fill_out_forms") > -1; 
      this.list(this.idForm);
    })
  }

  

  ngAfterViewInit() {
  }


  getDataUser(){
    this.storageService.get('keyData').then((resp:User)=>{
      this.dataUser = resp;
      this.loadEventService.loadEvent.emit(false);
      // this.obtainToken();
    })
  }

  obtainToken(){
    this.apiService.getResponse('GET','onedrive/token/')
    .then((resp:any)=>{
      // console.log('obteinToken', resp.access_token);
      localStorage.setItem('token_onedrive', resp.access_token);
      // this.readFolder();
    },error =>{
      this.loading=false;
    if(Array.isArray(error)){
      error.forEach((element:any) => {
        this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
      });
    }
  })
  }

  readFolder(){
    const filter = `${this.dataUser.id.toString()}_${this.dataUser.first_name.replace(' ', '')}_${this.dataUser.surname.replace(' ', '')}`;
   // console.log('filter', filter)
    this.oneDrive.getResponseOneDrive('GET', `users/${this.dataOneDrive.userId}/drive/root/search(q='{${filter}}')`).then((resp:GetAllFolder) => {
      if(resp.value.length>0){
        this.dataDrive = {
          drive_id: resp.value[0].parentReference.driveId,
          item_id: resp.value[0].id
        }
        this.loadEventService.loadEvent.emit(false);
      }else{
        this.createFolder(filter);
      }
    }, (err:any )=>{       
      this.loadEventService.loadEvent.emit(false);
     console.log('readFolder err:',err)
    }
    )
  }

  createFolder(data:string){
    const file = {
      "name": data,
      "folder": {
      }
    }
    this.oneDrive.getResponseOneDrive('POST', `users/${this.dataOneDrive.userId}/drive/root/children`, file)
    .then((resp:any)=>{
      this.loadEventService.loadEvent.emit(false);
      //console.log("createFolder: Success", resp);
    }, (err:any)=>{
      this.loadEventService.loadEvent.emit(false);
      //console.log('createFolder: Error', err);
    })
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
      this.apiService.getResponse('PATCH', `formulario/finishformulario/${this.dataForm.id}/`, this.sendData)
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

  save(){
    // this.validateForm();
    // if(this.form.valid){
    if(this.dataForm && this.dataForm.status_form == 'ACTIVE'){
        this.assingData();
        this.apiService.getResponse('PATCH', `formulario/submitformulario/${this.dataForm.id}/`, this.sendData)
        .then(resp=>{
        }, error =>{
          this.loading=false;
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
      })
    }
    // }else{
    //   this.validateForm();
    // } 
  }

  assingData(){
    this.sendData = {
      respuesta: this.questions
    }
  }


  list(idForm:any){
    this.questions =[];
    this.apiService.getResponse('GET', `formulario/list_questions/${idForm}/`)
    .then((resp: any)=>{
    //  console.log('resp', resp)
      this.dataForm = resp;
      this.name_group = this.dataForm.name_group;
      this.listQuestion = this.dataForm.question_package;
      for(let [key, item] of Object.entries(this.listQuestion)){
        this.questions.push({[key]: []})
        const tempItem:any = item;
        for(let element of tempItem){
          this.showPreviewQuestion(element[0], key);
          this.setStyleSelect(element, key);
        }
      }
      this.changesFile();
      this.getDataUser();
    }, error =>{
      this.loadEventService.loadEvent.emit(false);
      if(Array.isArray(error)){
        error.forEach((element:any) => {
          this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
        });
      }
    })
  }
  
  setStyleSelect(element:any, key:any){
    setTimeout(() => {
    if (element[0].question_data.type ==  'select_one' && element[0].question_data.appearance == 'dropdown_list'){
        VirtualSelect.init({ ele: `#option_${element[0].id}`,id: `#option_${element[0].id}`, placeholder: this.translate.instant('select_option'), hideClearButton: true, zIndex: 9999});
        if(element[0].response){
          (<any>document.querySelector(`#option_${element[0].id}`)).setValue(element[0].response);
          if(this.disableQuestion){
            (<any>document.querySelector(`#option_${element[0].id}`)).disable();
          }
          const optionsArr = this.form.get(`question_${element[0].id}`) as FormArray
          optionsArr.push(new FormControl(element[0].response));
        }
        if(element[0].logic){
          for(let item of Object.values(element[0].logic)){
            const dataItem:any = item;
            for(let elementAux of Object.values(dataItem.ids)){
              const dataId:any = elementAux;
              if(element[0].response){
                if( eval(`'${dataItem.option[0].id[this.lang.code]}'${dataItem.condition.id}'${element[0].response}'`)){
                  document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                  document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                }
              }
            }
         }
        }
        
        if(element[0].logic_group){
          for(let elem of Object.values(element[0].logic_group)){
            const dataElem:any = elem;
            for(let e of Object.values(dataElem)){
              const dataE:any = e;
              if(eval(`'${dataE.option[0].id[this.lang.code]}'${dataE.condition.id}'${element[0].response}'`)){
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeOut')
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeIn')
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-block')
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-none') 
              }else{
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-block')
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeIn')
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeOut')
                document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-none') 
              } 
            }
            
          }
        }
    }
    if (element[0].question_data.type == 'matrix_select_one' && element[0].question_data.appearance == 'dropdown_list'){
        let row = element[0].question_data.rows;
        Object.keys(row).forEach(key => {
          let column = element[0].question_data.columns;
          Object.keys(column).forEach(key_choices => {
            VirtualSelect.init({ ele: `#option_${element[0].id}_${key}_${key_choices}`, placeholder: this.translate.instant('select_option'), hideClearButton: true, zIndex: 9999});
            if(element[0].response && element[0].response[`${key}_${key_choices}`]){
              (<any>document.querySelector(`#option_${element[0].id}_${key}_${key_choices}`)).setValue(element[0].response[`${key}_${key_choices}`]);
              if(this.disableQuestion){
                (<any>document.querySelector(`#option_${element[0].id}_${key}_${key_choices}`)).disable();
              }
              const questionG = this.form.get(`question_${element[0].id}`) as FormGroup;
              const optionArr = questionG.get(`question_${element[0].id}_${key}_${key_choices}`) as FormArray;
              optionArr.push(new FormControl(`${key}_${key_choices}`));
            }
          });
        });

    } 
    if (element[0].question_data.type ==  'select_multiple' && element[0].question_data.appearance == 'dropdown_list'){
        VirtualSelect.init({ ele: `#option_${element[0].id}`, placeholder: this.translate.instant('select_option'),  hideClearButton: true, zIndex: 9999});
        if(element[0].response){
          (<any>document.querySelector(`#option_${element[0].id}`)).setValue(element[0].response);
          if(this.disableQuestion){
            (<any>document.querySelector(`#option_${element[0].id}`)).disable();
          }
          const optionsArr = this.form.get(`question_${element[0].id}`) as FormArray
          optionsArr.push(new FormControl(element[0].response));
        }
        if(element[0].logic){
          if(element[0].response){
            for(let item of Object.values(element[0].logic)){
              const dataItem:any = item;
              const tempArr = [];
              for(let itemJ of Object.values(dataItem.option)){
                const itemValue:any=itemJ
                tempArr.push(itemValue.id['es'])
              }
              const arrRes = tempArr.map(item=>{
                return element[0].response.indexOf(item) !==-1;
              })
            
              let responseLogic!:boolean;
              
              if(dataItem.condition.id=='&&'){
                responseLogic =  arrRes.indexOf(false)==-1;
                for(let elementAux of Object.values(dataItem.ids)){
                  const dataId:any = elementAux;
                  if(responseLogic){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }
                }
              }
              
              if(dataItem.condition.id=='||'){
                responseLogic =  arrRes.indexOf(true)!=-1;
                for(let elementAux of Object.values(dataItem.ids)){
                  const dataId:any = elementAux;
                  if(responseLogic){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }
                }
              }
            }
          }
        }
        if(element[0].logic_group){
          if(element[0].response){
            for(let item of Object.values(element[0].logic_group)){
              const dataItem:any = item;
              const tempArr = [];
              for(let itemJ of Object.values(dataItem[0].option)){
                const itemValue:any=itemJ
                tempArr.push(itemValue.id[this.lang.code])
              }
              const arrRes = tempArr.map(item=>{
                return element[0].response.indexOf(item) !==-1;
              })
            
              let responseLogic!:boolean;
              
              if(dataItem[0].condition.id=='&&'){
                responseLogic =  arrRes.indexOf(false)==-1;
                // for(let elementAux of Object.values(dataItem[0].ids)){
                //   const dataId:any = elementAux;
                  if(responseLogic){
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.add('d-none')
                  // }
                }
              }
              
              if(dataItem[0].condition.id=='||'){
                responseLogic =  arrRes.indexOf(true)!=-1;
                // for(let elementAux of Object.values(dataItem[0].ids)){
                //   const dataItem[0]:groupy = elementAux;
                  if(responseLogic){
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataItem[0].group}`)?.classList.add('d-none')
                  }
                // }
              }
            }
          }
        }
      }
    }, 100);
  }

  changesFile(){
    setTimeout(() => {
      const importFile =  this.el.nativeElement.querySelectorAll('.file_input');
      for(let item of importFile){
        item.addEventListener('change', this.uploadFile.bind(this));
      }
      const deleteFile =  this.el.nativeElement.querySelectorAll('.delete-file');
      for(let item of deleteFile){
        item.addEventListener('click', this.deleteFile.bind(this));
      }
      const optionRadio =  this.el.nativeElement.querySelectorAll('.select_one-radio');
      for(let item of optionRadio){
        item.addEventListener('change', this.detectedSelectOneRadio.bind(this));
      }
      const optionList =  this.el.nativeElement.querySelectorAll('.select_one-dropdown_list');
      for(let item of optionList){
        item.addEventListener('change', this.detectedSelectOneList.bind(this));
      }
      const chk =  this.el.nativeElement.querySelectorAll('.select_multiple-checkbox');
      for(let item of chk){
        item.addEventListener('change', this.detectedMultipleCheckbox.bind(this));
      }
      const chkList =  this.el.nativeElement.querySelectorAll('.select_multiple-dropdown_list');
      for(let item of chkList){
        item.addEventListener('change', this.detectedMultipleCheckboxList.bind(this));
      }
      const openQuestion =  this.el.nativeElement.querySelectorAll('.open_answer');
      for(let item of openQuestion){
        item.addEventListener('change', this.detectedOpenQuestion.bind(this));
      }
      const optionMatrizOne =  this.el.nativeElement.querySelectorAll('.option_matriz_one');
      for(let item of optionMatrizOne){
        item.addEventListener('change', this.detectedMatrizOneQuestion.bind(this));
      }
      const optionMatrizCheckbox =  this.el.nativeElement.querySelectorAll('.option_matriz_checkbox');
      for(let item of optionMatrizCheckbox){
        item.addEventListener('change', this.detectedMatrizCkeckboxQuestion.bind(this));
      }
      const optionMatrizList =  this.el.nativeElement.querySelectorAll('.dropdown_list_matriz');
      for(let item of optionMatrizList){
        item.addEventListener('change', this.detectedMatrizListQuestion.bind(this));
      }
      if(this.disableQuestion){
        const downloadFile =  this.el.nativeElement.querySelectorAll('.label_import');
        for(let item of downloadFile){
          item.addEventListener('click', this.downloadFile.bind(this));
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
    if(this.data){
      if ( this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionRatio().outerHTML;
        if(this.data.response || this.data.logic || this.data.logic_group)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response, logic:this.data.logic, logic_group: this.data.logic_group})
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question)})
          
      }
      if (this.data.question_data.type ==  'select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionDropdown().outerHTML;
        if(this.data.response || this.data.logic || this.data.logic_group)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response, logic:this.data.logic, logic_group: this.data.logic_group})
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question)})
          
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'radio'){
        question = this.questionMatrizRadio().outerHTML;
        if(this.data.response)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response});
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question)})
          
      }
      if (this.data.question_data.type == 'matrix_select_one' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionMatrizListRadio().outerHTML;
        if(this.data.response)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response});
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question)});
          
      }
      
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionCheckbox().outerHTML;
        if(this.data.response || this.data.logic || this.data.logic_group)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response: this.data.response, logic:this.data.logic, logic_group: this.data.logic_group});
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response: []})
          
      }
      if (this.data.question_data.type ==  'select_multiple' && this.data.question_data.appearance == 'dropdown_list'){
        question = this.questionCheckboxList().outerHTML;
        if(this.data.response || this.data.logic || this.data.logic_group)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response, logic:this.data.logic, logic_group: this.data.logic_group});
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response: []});
          
      }
      
      if (this.data.question_data.type == 'matrix_select_multiple' && this.data.question_data.appearance == 'checkbox'){
        question = this.questionMatrizCheckbox().outerHTML;
        if(this.data.response)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response})
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question)})
          
      }
      
      if(this.data.question_data.type == 'open_answer'){
        question = this.questionOpen().outerHTML;
        if(this.data.response)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response})
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question)})
          
      }

      if(this.data.question_data.type == 'file_upload'){
        // console.log('this.data', this.data)
        question = this.questionFile().outerHTML;
        if(this.data.response)
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), response:this.data.response, type: this.data.question_data.type})
        else
          this.questions[(this.group - 1)][this.group].push( {id: this.data.id, html: this.sanitizer.bypassSecurityTrustHtml(question), type: this.data.question_data.type})
          
      }
      this.showPreview = true;
    }
  }


  
  questionRatio(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    const response = this.data.response
    const logicSkip = this.data.logic;
    const logic_group = this.data.logic_group;
    const div_question = document.createElement('fieldset')
    const div_title = document.createElement('div');
    let div_required:any;
    if (required){
      this.form.addControl(`question_${this.data.id}`, this.fb.array([], [Validators.required]))
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }else{
      this.form.addControl(`question_${this.data.id}`, this.fb.array([]))
    }
    div_title.classList.add('line-question')
    div_title.setAttribute('formGroupName', `question_${this.data.id}`)
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
      if(this.disableQuestion){
        input.disabled = true;
      }
      if(response && response == input.value){
        input.setAttribute('checked', 'true');
        const optionsArr = this.form.get(`question_${this.data.id}`) as FormArray;
        optionsArr.push(new FormControl(input.value));
        setTimeout(() => {
          if(logicSkip){
            for(let item of Object.values(logicSkip)){
              const dataItem:any = item;
              for(let element of Object.values(dataItem.ids)){
                const dataId:any = element;
                if(eval(`'${dataItem.option[0].id[this.lang.code]}'${dataItem.condition.id}'${response}'`)){
                  document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                  document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                }
              }
            }
          }
    
          if(logic_group){
            for(let elem of Object.values(logic_group)){
              const dataElem:any = elem;
              for(let e of Object.values(dataElem)){
                const dataE:any = e;
                if(eval(`'${dataE.option[0].id[this.lang.code]}'${dataE.condition.id}'${response}'`)){
                  document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeOut')
                  document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeIn')
                  document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-block')
                  document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-none') 
                }
              }
            }
          }
        }, 100);
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
    const logicSkip = this.data.logic
    const logic_group = this.data.logic_group
    const div_question = document.createElement('fieldset')
    const div_title = document.createElement('div');
    let div_required:any;
    if (required){
      this.form.addControl(`question_${this.data.id}`, this.fb.array([], [Validators.required]))
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }else{
      this.form.addControl(`question_${this.data.id}`, this.fb.array([]))
    }
    div_title.classList.add('line-question')
    div_title.setAttribute('formGroupName', `question_${this.data.id}`)
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
      if(this.disableQuestion){
        input.disabled = true;
      }
      if(response){
        const existValue = response.indexOf(input.value) > - 1;
        if(existValue){
          input.setAttribute('checked', 'true');
          const optionsArr = this.form.get(`question_${this.data.id}`) as FormArray;
          optionsArr.push(new FormControl(input.value));
        }
      }
      setTimeout(() => {
        if(logicSkip){
          for(let item of Object.values(logicSkip)){
            const dataItem:any = item;
            const tempArr = [];
            for(let itemJ of Object.values(dataItem.option)){
              const itemValue:any=itemJ
              tempArr.push(itemValue.id[this.lang.code])
            }
            const arrRes = tempArr.map(item=>{
              return response.indexOf(item) !==-1;
            })
            let responseLogic!:boolean;
            
            if(dataItem.condition.id=='&&'){
              responseLogic =  arrRes.indexOf(false)==-1;
              for(let elementAux of Object.values(dataItem.ids)){
                const dataId:any = elementAux;
                if(responseLogic){
                  document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                  document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                }
                // else{
                //   document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                //   document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                //   document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                //   document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                // } 
              }
            }
            
            if(dataItem.condition.id=='||'){
              responseLogic =  arrRes.indexOf(true)!=-1;
              for(let elementAux of Object.values(dataItem.ids)){
                const dataId:any = elementAux;
                if(responseLogic){
                  document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                  document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                }else{
                  document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                  document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                  document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                } 
              }
            }
          }
        }

        // const logic_group = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic_group;
        if(logic_group){
          for(let elem of Object.values(logic_group)){
            const dataElem:any = elem;
            const tempArrGroup = [];
            for(let eJ of Object.values(dataElem[0].option)){
              const eValue:any=eJ
              tempArrGroup.push(eValue.id[this.lang.code])
            }
            // const responseGroup = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
            const arrResGroup = tempArrGroup.map(item=>{
              return response.indexOf(item) !==-1;
            })
            let responseLogicGroup!:boolean;
            
            if(dataElem[0].condition.id=='&&'){
              responseLogicGroup =  arrResGroup.indexOf(false)==-1;
                if(responseLogicGroup){
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                }else{
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                } 
            }
            
            if(dataElem[0].condition.id=='||'){
              responseLogicGroup =  arrResGroup.indexOf(true)!=-1;
                if(responseLogicGroup){
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                }else{
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                  document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                } 
            }
          }
        }
      }, 100);
     
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
      div_question.appendChild(div_required);
  
    return div_question;
  }

  questionDropdown(){
    const appearance = this.data.question_data.appearance
    const required = this.data.required
    const div_question = document.createElement('div')
    let div_required:any;
    if (required){
      this.form.addControl(`question_${this.data.id}`, this.fb.array([], [Validators.required]))
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }else{
      this.form.addControl(`question_${this.data.id}`, this.fb.array([]))
    }
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
    let choices = this.data.question_data.choices;
    let option = document.createElement('option');
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
    if (required){
      this.form.addControl(`question_${this.data.id}`, this.fb.array([], [Validators.required]))
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }else{
      this.form.addControl(`question_${this.data.id}`, this.fb.array([]))
    }
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
    if (required){
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }
    this.form.addControl(`question_${this.data.id}`, this.fb.group({}))
    div_matrix.setAttribute('formGroupName', `question_${this.data.id}`)
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
      const tempArr = this.form.get(`question_${this.data.id}`) as FormGroup;
      if(required){
        tempArr.addControl(`question_${this.data.id}_${posRow}`, this.fb.array([], [Validators.required]));
      }else{
        tempArr.addControl(`question_${this.data.id}_${posRow}`, this.fb.array([]))
      }
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
        input.classList.add('form-check-input')
        if(this.disableQuestion){
          input.disabled = true;
        }
        if(response && response[textoCelda.nodeValue!] == input.value){
            input.setAttribute('checked', 'true');
            const questionG = this.form.get(`question_${this.data.id}`) as FormGroup;
            const optionArr = questionG.get(`question_${this.data.id}_${posRow}`) as FormArray;
            optionArr.push(new FormControl(input.value));
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
    if (required){
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }
    this.form.addControl(`question_${this.data.id}`, this.fb.group({}))
    div_matrix.setAttribute('formGroupName', `question_${this.data.id}`)
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
      if(required){
        tempArr.addControl(`question_${this.data.id}_${posRow}`, this.fb.array([], [Validators.required]));
      }else{
        tempArr.addControl(`question_${this.data.id}_${posRow}`, this.fb.array([]))
      }
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
        // input.name = `question_${this.group}_${this.data.id}_${posRow}_${questions[key][this.lang.code]?questions[key][this.lang.code]:this.translate.instant('translation_available')}`;
        // input.id = `question_${this.data.id}_${posRow}_${pos}`;
        input.classList.add('form-check-input')
        if(this.disableQuestion){
          input.disabled = true;
        }
        if(response && response[textoCelda.nodeValue!]){
          const existValue = response[textoCelda.nodeValue!].indexOf(input.value) > - 1;
          if(existValue){
            input.setAttribute('checked', 'true');
            const questionG = this.form.get(`question_${this.data.id}`) as FormGroup;
            const optionArr = questionG.get(`question_${this.data.id}_${posRow}`) as FormArray;
            // const optionsArr = this.form.get(`question_${this.data.id}`) as FormArray;
            optionArr.push(new FormControl(input.value));
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
    if (required){
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }
    this.form.addControl(`question_${this.data.id}`, this.fb.group({}))
    div_matrix.setAttribute('formGroupName', `question_${this.data.id}`)
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
        const tempArr = this.form.get(`question_${this.data.id}`) as FormGroup;
        if(required){
          tempArr.addControl(`question_${this.data.id}_${key}_${key_choices}`, this.fb.array([], [Validators.required]));
        }else{
          tempArr.addControl(`question_${this.data.id}_${key}_${key_choices}`, this.fb.array([]))
        }
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
    const response = this.data.response
    const div_question = document.createElement('div')
    const div_title = document.createElement('div');
    let div_required:any;
    if (required){
      this.form.addControl(`question_${this.data.id}`, new FormControl('',[Validators.required]));
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }else{
      this.form.addControl(`question_${this.data.id}`, new FormControl(''))
    }
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
      if(response){
        input_div.setAttribute("value",response);
        this.form.get(`question_${this.data.id}`)?.setValue(input_div.value);
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
      if(response){
        input_div.setAttribute("value",response);
        this.form.get(`question_${this.data.id}`)?.setValue(input_div.value);
      }
      
    }
    if(this.disableQuestion){
      input_div.disabled = true;
    }

    div_question.appendChild(input_div)
    if(div_required)
    div_question.appendChild(div_required);
    return div_question
  }

  questionFile(){
    const required = this.data.required
    const appearance = this.data.question_data.appearance
    const div_question = document.createElement('div')
    const response = this.data.response
    const div_title = document.createElement('div');
    let div_required:any;
    if (required){
      this.form.addControl(`question_${this.data.id}`, new FormControl('',[Validators.required]));
      div_required = document.createElement('div');
      div_required.classList.add('text-danger');
      div_required.classList.add(`require_question_${this.data.id}`);
      div_required.classList.add('ps-2');
      div_required.classList.add('pt-1');
      div_required.classList.add('font-12');
      div_required.classList.add('d-none');
      const small = document.createElement('small');
      small.classList.add('block');
      small.innerText = this.translate.instant('required_question');
      div_required.appendChild(small);
    }else{
      this.form.addControl(`question_${this.data.id}`, new FormControl(''))
    }
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
    // if(!this.disableQuestion){
      const span_file_2 = document.createElement('span');
      span_file_2.id=`file_name_${this.data.id}`
      span_file_2.innerText = response?response.name:this.translate.instant('upload_to_file');
      span_file.appendChild(span_file_2);

    // }
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
    input_file.type = 'file'
    // input_file.accept = "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    input_file.classList.add("w-100");
    const label_file = document.createElement("label");


    if(this.disableQuestion&&response){
      // label_file.htmlFor = `option_${this.data.id}_`;
      label_file.id = `option_${this.group}_${this.data.id}_`;
      label_file.classList.add(`label_import`);
      label_file.innerText = this.translate.instant('download');
    }else{
      label_file.htmlFor = `option_${this.data.id}`;
      label_file.classList.add(`label_import`);
      label_file.innerText = this.translate.instant('import');

    }
    div_file.appendChild(span_file);
    div_file.appendChild(span_delete);
    div_file.appendChild(input_file);
    div_file.appendChild(label_file);
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

  async uploadFile(ev: Event){
    const target = ev.target as HTMLInputElement;
    const id = target.id.split('_')[1];
    const questionGroup = target.name.split('_')[1];
    const tempQuestion= this.listQuestion[questionGroup].find((item:any) => item[0].id == id);
    const id_drivefolder = tempQuestion[0].id_drivefolder;
    // console.log(' target.files![0]',  target.files![0])
    if(target.files![0].size>104857600){
      this.showMessage.show('error', this.translate.instant('attention'), this.translate.instant('exceeded_size'), 'pi pi-exclamation-triangle');
      return
    }
    // document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
    document.getElementById(`file_name_${id}`)!.innerText = this.translate.instant('please_await');
    // document.getElementById(`file_delete_${id}`)!.classList.remove('d-none');
    // document.getElementById(`file_delete_${id}`)!.classList.add('d-block');
    this.uploadOneDrive(target.files![0].name, target.files![0], questionGroup, id, id_drivefolder);

  }

  uploadOneDrive(name:string, file:File, questionGroup:string, id:string, drive_id:any){
    // console.log('name', name)
    // console.log('file', file)
    this.apiService.getResponse('GET','onedrive/token/')
    .then((resp:any)=>{
      localStorage.setItem('token_onedrive', resp.access_token);
      // console.log('resp.access_token', resp.access_token)
      this.oneDrive.getResponseOneDrive('GET', `users/${this.dataOneDrive.userId}/drive/items/${drive_id}/children`).then((respFolder:any) => {
        if(respFolder.value.length>0){
          const filesOneDrive = respFolder.value.find((item:any) => item.name == name);
          if(filesOneDrive){
            respFolder.name_file = filesOneDrive?.name;
            // console.log('respFolder', filesOneDrive)
            const info = respFolder;
            // console.log('info', info)
            this.apiService.getResponse('POST', 'formulario/checkversion/', info)
            .then((response:any)=>{
              // console.log('response', response)
              const nameValue = response.data.name;
              let nameVersion;
              if(nameValue==name){
                nameVersion = `version_02_${name}`;
              }else{
                // let version = '0'
                let version = nameValue.split('_')[1]
                nameVersion = `version_0${Number(version)+1}_${name}`
              }
              this.oneDrive.getResponseOneDrive('PUT', `drives/${this.dataOneDrive.uploadId}/items/${drive_id}:/${nameVersion}:/content`, file)
              .then((respUploadFile:UploadFile) => {
                document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
                document.getElementById(`file_name_${id}`)!.innerText = name;
                // document.getElementById(`file_delete_${id}`)!.classList.remove('d-none');
                // document.getElementById(`file_delete_${id}`)!.classList.add('d-block');
                this.form.get(`question_${id}`)?.setValue(file);
                const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
                if(indexOption > -1){
                  this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {id: respUploadFile.id ,name: name, url: respUploadFile['@microsoft.graph.downloadUrl']};
                }
                this.showMessage.show('success', this.translate.instant('upload_file_'), name, 'pi pi-exclamation-triangle');
                this.save();
              }, (err:any )=>{ 
            //  console.log('uploadOneDrive err:',err)
              }) 
            })
          }else{
            this.oneDrive.getResponseOneDrive('PUT', `drives/${this.dataOneDrive.uploadId}/items/${drive_id}:/${name}:/content`, file)
              .then((respUploadFile:UploadFile) => {
                document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
                document.getElementById(`file_name_${id}`)!.innerText = name;
                // document.getElementById(`file_delete_${id}`)!.classList.remove('d-none');
                // document.getElementById(`file_delete_${id}`)!.classList.add('d-block');
                this.form.get(`question_${id}`)?.setValue(file);
                const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
                if(indexOption > -1){
                  this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {id: respUploadFile.id ,name: name, url: respUploadFile['@microsoft.graph.downloadUrl']};
                }
                this.showMessage.show('success', this.translate.instant('upload_file_'), name, 'pi pi-exclamation-triangle');
                this.save();
              }, (err:any )=>{ 
            //  console.log('uploadOneDrive err:',err)
              }) 
          }
        }else{
          this.oneDrive.getResponseOneDrive('PUT', `drives/${this.dataOneDrive.uploadId}/items/${drive_id}:/${name}:/content`, file)
          .then((respUploadFile0:UploadFile) => {
            document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
            document.getElementById(`file_name_${id}`)!.innerText = name;
            // document.getElementById(`file_delete_${id}`)!.classList.remove('d-none');
            // document.getElementById(`file_delete_${id}`)!.classList.add('d-block')
            this.form.get(`question_${id}`)?.setValue(file);
            const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
            if(indexOption > -1){
              this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {id: respUploadFile0.id ,name: name, url: respUploadFile0['@microsoft.graph.downloadUrl']};
            }
            this.showMessage.show('success', this.translate.instant('upload_file_'), name, 'pi pi-exclamation-triangle');
            this.save();
          }, (err:any )=>{ 
          //  console.log('uploadOneDrive err:',err)
          })
        }
      },(error:any) =>{
        // console.log('error', error)
        // this.loading=false;
        // if(Array.isArray(error)){
        //   error.forEach((element:any) => {
          document.getElementById(`file_name_${id}`)!.innerText = this.translate.instant('upload_to_file');
            this.showMessage.show('error', this.translate.instant('attention'), this.translate.instant('no_upload_file'), 'pi pi-exclamation-triangle');
          // });
        // }
      })
    },(error:any) =>{
      // console.log('error', error)
      this.loading=false;
    if(Array.isArray(error)){
      error.forEach((element:any) => {
        this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
      });
    }
  })
/*     this.oneDrive.getResponseOneDrive('GET', `users/${this.dataOneDrive.userId}/drive/root/search(q='{${name}}')`).then((resp:GetAllFolder) => {

      if(resp.value.length>0){
        resp.name_file = name;
        const info = resp;
        this.apiService.getResponse('POST', 'formulario/checkversion/', info)
        .then((response:any)=>{
          const nameValue = response.data.name;
          let nameVersion;
          if(nameValue==name){
            nameVersion = `version_02_${name}`;
          }else{
            const version = nameValue.split('_')[1]
            nameVersion = `version_0${Number(version)+1}_${name}`
          }
          this.oneDrive.getResponseOneDrive('PUT', `drives/${this.dataDrive.drive_id}/items/${this.dataDrive.item_id}:/${nameVersion}:/content`, file)
          .then((resp:UploadFile) => {
            this.form.get(`question_${id}`)?.setValue(file);
            const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
            if(indexOption > -1){
              this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {id: resp.id ,name: name, url: resp['@microsoft.graph.downloadUrl']};
            }
            this.save();
          }, (err:any )=>{ 
          //  console.log('uploadOneDrive err:',err)
          }
          ) 
        })
      }else{
        this.oneDrive.getResponseOneDrive('PUT', `drives/${this.dataDrive.drive_id}/items/${this.dataDrive.item_id}:/${name}:/content`, file)
        .then((resp:UploadFile) => {
          this.form.get(`question_${id}`)?.setValue(file);
          const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
          if(indexOption > -1){
            this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {id: resp.id ,name: name, url: resp['@microsoft.graph.downloadUrl']};
          }
          this.save();
        }, (err:any )=>{ 
        //  console.log('uploadOneDrive err:',err)
        }
        )
      }
    }, (err:any )=>{       
      this.loadEventService.loadEvent.emit(false);
    //  console.log('readFolder err:',err)
      }
    ); */
  }

  createSesionUploadOneDrive(name:string, file:File){
    this.oneDrive.getResponseOneDrive('POST', `drives/${this.dataDrive.drive_id}/items/${this.dataDrive.item_id}:/${name}:/createUploadSession`)
    .then((resp:SesionUpload) => {
      this.oneDrive.uploadFileSesion(file, resp.uploadUrl)
      .then(resp=>console.log(resp))
      .catch(err => console.log(err))
    }, (err:any )=>{ 
     // console.log('uploadOneDrive err:',err)
    }
    )
  }

  async deleteFile(ev: Event){
    const delete_file =  (<HTMLInputElement> ev.target);
    const id = delete_file!.id.split('_')[3];
    const questionGroup = delete_file.id.split('_')[2];
    await this.deleteOneDrive(questionGroup, id);
    document.getElementsByClassName(`require_question_${id}`)[0]?.classList.remove('d-none');
    document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-block');
    document.getElementById(`file_name_${id}`)!.innerText = this.translate.instant('upload_to_file');
    (<HTMLInputElement> document.getElementById(`option_${id}`))!.value = '';
    document.getElementById(`file_delete_${id}`)!.classList.remove('d-block');
    document.getElementById(`file_delete_${id}`)!.classList.add('d-none')
  }

  deleteOneDrive(questionGroup:string, id:string){
    const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
    this.oneDrive.getResponseOneDrive('DELETE', `drives/${this.dataDrive.drive_id}/items/${this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response.id}`)
    .then((resp:any) => {
      this.form.get(`question_${id}`)?.setValue('');
      if(indexOption > -1){
        delete this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
      }
      
    }, (err:any )=>{ 
    //  console.log('deleteOneDrive err:',err)
    }
    )
  }

  detectedSelectOneRadio(ev: Event){
    const option = (<HTMLInputElement>ev.target)
    const id = option.id.split('_')[1];
    const questionGroup = option.name.split('_')[1];
    document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
    const optionsArr = this.form.get(`question_${id}`) as FormArray;
    optionsArr.removeAt(0)
    optionsArr.push(new FormControl(option.value));
    const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
    if(indexOption > -1){
      const logicSkip = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic;
      if(logicSkip){
        for(let item of Object.values(logicSkip)){
          const dataItem:any = item;
          for(let element of Object.values(dataItem.ids)){
            const dataId:any = element;
            if(eval(`'${dataItem.option[0].id[this.lang.code]}'${dataItem.condition.id}'${option.value}'`)){
              document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
              document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
              document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
              document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
              // return;
            }else{
              document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
              document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
              document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
              document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
              // return;
            } 
          }
        }
      }
      const logic_group = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic_group;
     // console.log('logic_group', logic_group)
      if(logic_group){
        for(let elem of Object.values(logic_group)){
          const dataElem:any = elem;
         // console.log('dataElem', dataElem)
          for(let e of Object.values(dataElem)){
            const dataE:any = e;
           // console.log('dataE',dataE)
           // console.log('eval',`${dataE.option[0].id[this.lang.code]}'${dataE.condition.id}'${option.value}`)
            if(eval(`'${dataE.option[0].id[this.lang.code]}'${dataE.condition.id}'${option.value}'`)){
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeOut')
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeIn')
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-block')
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-none') 
            }else{
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-block')
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeIn')
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeOut')
              document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-none') 
            } 
          }
        }
      }
      this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = option.value;
    }
    this.save();
  }

  detectedMatrizOneQuestion(ev: Event){
    const option = (<HTMLInputElement>ev.target)
    const id = option.id.split('_')[1];
    const questionGroup = option.name.split('_')[1];
    const idRow = option.name.split('_')[3];
    const valueRow = option.name.split('_')[4];
    document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
    const questionG = this.form.get(`question_${id}`) as FormGroup;
    const optionArr = questionG.get(`question_${id}_${idRow}`) as FormArray;
    const ifOption = optionArr.controls.findIndex(item => item.value == option.value)
    optionArr.removeAt(0)
    optionArr.push(new FormControl(option.value));
    const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
    if(indexOption > -1){
      if(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response){
        for(let [key, value] of Object.entries(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response)){
          if(key == valueRow){
            this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response[key] = option.value;
          }else{
            Object.assign(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response, {[valueRow]: option.value});
          }
        }
      }else{
        this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {[valueRow]: option.value};
      }
    }
    this.save();
  }

  detectedMatrizListQuestion(ev: Event){
    const option = (<HTMLInputElement>ev.target)
    if(option.value){
      const id = option.id.split('_')[1];
      const questionGroup = option.name.split('_')[1];
      const posRow = option.name.split('_')[3];
      const posColumn = option.name.split('_')[4];
      document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
      const questionG = this.form.get(`question_${id}`) as FormGroup;
      const optionArr = questionG.get(`question_${id}_${posRow}_${posColumn}`) as FormArray;
      optionArr.removeAt(0)
      optionArr.push(new FormControl(option.value));
      const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
      if(indexOption > -1){
        if(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response){
          for(let [key, value] of Object.entries(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response)){
            if(key == `${posRow}_${posColumn}`){
              this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response[key] = option.value;
            }else{
              Object.assign(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response, {[`${posRow}_${posColumn}`]: option.value});
            }
          }
        }else{
          this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {[`${posRow}_${posColumn}`]: option.value};
        }
      }
      this.save();
    }
  }


  detectedSelectOneList(ev: Event){
    const option = (<HTMLInputElement>ev.target)
    if(option.value && option.value.length>0){
      const tempValue:any = option.value;
      const id = option.id.split('_')[1];
      const questionGroup = option.name.split('_')[1];
      document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
      const optionsArr = this.form.get(`question_${id}`) as FormArray
      const ifOption = optionsArr.controls.findIndex(item => item.value == option.value);
      if(ifOption > -1){
        optionsArr.removeAt(ifOption)
        optionsArr.push(new FormControl(option.value));
        const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
        if(indexOption > -1){
          this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = option.value;
          const logicSkip = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic;
          if(logicSkip){
            for(let item of Object.values(logicSkip)){
              const dataItem:any = item;
              if(dataItem.condition.id=="&&" || dataItem.condition.id=="||"){
                  const dataItem:any = item;
                  const tempArr = [];
                  for(let itemJ of Object.values(dataItem.option)){
                    const itemValue:any=itemJ
                    tempArr.push(itemValue.id[this.lang.code])
                  }
                  const response = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
                  const arrRes = tempArr.map(item=>{
                    return response.indexOf(item) !==-1;
                  })
                  let responseLogic!:boolean;
                  
                  if(dataItem.condition.id=='&&'){
                    responseLogic =  arrRes.indexOf(false)==-1;
                    for(let elementAux of Object.values(dataItem.ids)){
                      const dataId:any = elementAux;
                      if(responseLogic){
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                      }else{
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                      } 
                    }
                  }
                  
                  if(dataItem.condition.id=='||'){
                    responseLogic =  arrRes.indexOf(true)!=-1;
                    for(let elementAux of Object.values(dataItem.ids)){
                      const dataId:any = elementAux;
                      if(responseLogic){
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                      }else{
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                      } 
                    }
                  }
              }else{
                for(let element of Object.values(dataItem.ids)){
                  const dataId:any = element;
                  if( eval(`'${dataItem.option[0].id[this.lang.code]}'${dataItem.condition.id}'${option.value}'`)){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                  } 
                }
              }
            }
          }

          const logic_group = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic_group;

          if(logic_group){
            for(let elem of Object.values(logic_group)){
              const dataElem:any = elem;
              if(dataElem[0].condition.id=="&&" || dataElem[0].condition.id=="||" ){

                const tempArrGroup = [];
                for(let eJ of Object.values(dataElem[0].option)){
                  const eValue:any=eJ
                  tempArrGroup.push(eValue.id[this.lang.code])
                }
                const responseGroup = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
                const arrResGroup = tempArrGroup.map(item=>{
                  return responseGroup.indexOf(item) !==-1;
                })
                let responseLogicGroup!:boolean;
                
                if(dataElem[0].condition.id=='&&'){
                  responseLogicGroup =  arrResGroup.indexOf(false)==-1;
                    if(responseLogicGroup){
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                    }else{
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                    } 
                }
                
                if(dataElem[0].condition.id=='||'){
                  responseLogicGroup =  arrResGroup.indexOf(true)!=-1;
                    if(responseLogicGroup){
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                    }else{
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                    } 
                }
              }else{
                for(let e of Object.values(dataElem)){
                  const dataE:any = e;
                  if(eval(`'${dataE.option[0].id[this.lang.code]}'${dataE.condition.id}'${option.value}'`)){
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-none') 
                  }else{
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-block')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-none') 
                  } 
                }
              }
            }
          }
          
        }
      }else{
        optionsArr.push(new FormControl(option.value));
        const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
        if(indexOption > -1){
          this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = option.value;
          const logicSkip = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic;
          if(logicSkip){
            for(let item of Object.values(logicSkip)){
              const dataItem:any = item;
              if(dataItem.condition.id=="&&" || dataItem.condition.id=="||"){
                  const dataItem:any = item;
                  const tempArr = [];
                  for(let itemJ of Object.values(dataItem.option)){
                    const itemValue:any=itemJ
                    tempArr.push(itemValue.id[this.lang.code])
                  }
                  const response = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
                  const arrRes = tempArr.map(item=>{
                    return response.indexOf(item) !==-1;
                  })
                  let responseLogic!:boolean;
                  
                  if(dataItem.condition.id=='&&'){
                    responseLogic =  arrRes.indexOf(false)==-1;
                    for(let elementAux of Object.values(dataItem.ids)){
                      const dataId:any = elementAux;
                      if(responseLogic){
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                      }else{
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                      } 
                    }
                  }
                  
                  if(dataItem.condition.id=='||'){
                    responseLogic =  arrRes.indexOf(true)!=-1;
                    for(let elementAux of Object.values(dataItem.ids)){
                      const dataId:any = elementAux;
                      if(responseLogic){
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                      }else{
                        document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                        document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                        document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                      } 
                    }
                  }
              }else{
                for(let element of Object.values(dataItem.ids)){
                  const dataId:any = element;
                  if( eval(`'${dataItem.option[0].id[this.lang.code]}'${dataItem.condition.id}'${option.value}'`)){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                  } 
                }
              }
            }
          }
          const logic_group = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic_group;

          if(logic_group){
            for(let elem of Object.values(logic_group)){
              const dataElem:any = elem;
              if(dataElem[0].condition.id=="&&" || dataElem[0].condition.id=="||" ){

                const tempArrGroup = [];
                for(let eJ of Object.values(dataElem[0].option)){
                  const eValue:any=eJ
                  tempArrGroup.push(eValue.id[this.lang.code])
                }
                const responseGroup = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
                const arrResGroup = tempArrGroup.map(item=>{
                  return responseGroup.indexOf(item) !==-1;
                })
                let responseLogicGroup!:boolean;
                
                if(dataElem[0].condition.id=='&&'){
                  responseLogicGroup =  arrResGroup.indexOf(false)==-1;
                    if(responseLogicGroup){
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                    }else{
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                    } 
                }
                
                if(dataElem[0].condition.id=='||'){
                  responseLogicGroup =  arrResGroup.indexOf(true)!=-1;
                    if(responseLogicGroup){
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                    }else{
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                      document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                    } 
                }
              }else{
                for(let e of Object.values(dataElem)){
                  const dataE:any = e;
                  if(eval(`'${dataE.option[0].id[this.lang.code]}'${dataE.condition.id}'${option.value}'`)){
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-none') 
                  }else{
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('d-block')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`group_question_${dataE.source_groups}`)?.classList.remove('d-none') 
                  } 
                }
              }
            }
          }
        }
      } 
      this.save();
    }
  }

  detectedMultipleCheckbox(ev: Event){
    const option = (<HTMLInputElement>ev.target)
    const id = option.id.split('_')[1];
    const questionGroup = option.name.split('_')[1];
    document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
    const optionsArr = this.form.get(`question_${id}`) as FormArray;
    if(option.checked){
      optionsArr.push(new FormControl(option.value));
      const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
      if(indexOption > -1){
        this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response.push(option.value);
      }
    }else{
      const ifOption = optionsArr.controls.findIndex(item => item.value == option.value);
      const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
      if(indexOption > -1){
        this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response.splice(ifOption, 1);
      }
      optionsArr.removeAt(ifOption)
    }
    this.save();
  }

  detectedMatrizCkeckboxQuestion(ev: Event){
    const option = (<HTMLInputElement>ev.target);
    const id = option.id.split('_')[1];
    const questionGroup = option.name.split('_')[1];
    const idRow = option.name.split('_')[3];
    const valueRow = option.name.split('_')[4];
    document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
    const questionG = this.form.get(`question_${id}`) as FormGroup;
    const optionArr = questionG.get(`question_${id}_${idRow}`) as FormArray;
    if(option.checked){
      optionArr.push(new FormControl(option.value));
      const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
      if(indexOption > -1){
       
        if(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response){
          for(let [key, value] of Object.entries(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response)){
            if(key == valueRow){
              this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response[key].push(option.value);
            }else{
              Object.assign(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response, {[valueRow]: [option.value]});
            }
          }
        }else{
          this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = {[valueRow]: [option.value]};
        }
      }
    }else{
      const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
      if(indexOption > -1){
        if(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response){
          for(let [key, value] of Object.entries(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response)){
            const tempValue:any = value;
            if(key == valueRow){
              const pos = tempValue.findIndex( (item:any) => item == option.value);
              this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response[key].splice(pos, 1);
              if(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response[key].length<1){
                delete this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response[key];
              }
              optionArr.removeAt(pos)
            }
          }
        }
      }
    }
    this.save();
  }

  detectedMultipleCheckboxList(ev: Event){
    const option = (<HTMLInputElement>ev.target)
    if(option.value){
      const id = option.id.split('_')[1];
      const questionGroup = option.name.split('_')[1];
      document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
      const optionsArr = this.form.get(`question_${id}`) as FormArray;
      if(option.checked){
        optionsArr.push(new FormControl(option.value));
        const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
        if(indexOption > -1){
          if(this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response)
            this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response.push(option.value);
          else
            this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response=[option.value];
          const logicSkip = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic;
          if(logicSkip){
            for(let item of Object.values(logicSkip)){
              const dataItem:any = item;
              const tempArr = [];
              for(let itemJ of Object.values(dataItem.option)){
                const itemValue:any=itemJ
                tempArr.push(itemValue.id[this.lang.code])
              }
              const response = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
              const arrRes = tempArr.map(item=>{
                return response.indexOf(item) !==-1;
              })
              let responseLogic!:boolean;
              
              if(dataItem.condition.id=='&&'){
                responseLogic =  arrRes.indexOf(false)==-1;
                for(let elementAux of Object.values(dataItem.ids)){
                  const dataId:any = elementAux;
                  if(responseLogic){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                  } 
                }
              }
              
              if(dataItem.condition.id=='||'){
                responseLogic =  arrRes.indexOf(true)!=-1;
                for(let elementAux of Object.values(dataItem.ids)){
                  const dataId:any = elementAux;
                  if(responseLogic){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                  } 
                }
              }
            }
          }

          const logic_group = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic_group;
          if(logic_group){
            for(let elem of Object.values(logic_group)){
              const dataElem:any = elem;
              const tempArrGroup = [];
              for(let eJ of Object.values(dataElem[0].option)){
                const eValue:any=eJ
                tempArrGroup.push(eValue.id[this.lang.code])
              }
              const responseGroup = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response
              const arrResGroup = tempArrGroup.map(item=>{
                return responseGroup.indexOf(item) !==-1;
              })

              let responseLogicGroup!:boolean;
              
              if(dataElem[0].condition.id=='&&'){
                responseLogicGroup =  arrResGroup.indexOf(false)==-1;
                  if(responseLogicGroup){
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                  } 
              }
              
              if(dataElem[0].condition.id=='||'){
                responseLogicGroup =  arrResGroup.indexOf(true)!=-1;
                  if(responseLogicGroup){
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                  } 
              }
            }
          }
        }
      }else{
        const ifOption = optionsArr.controls.findIndex(item => item.value == option.value);
        const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
        if(indexOption > -1){
          this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response.splice(ifOption, 1);
          const logicSkip = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic;
          if(logicSkip){
            for(let item of Object.values(logicSkip)){
              const dataItem:any = item;
              const tempArr = [];
              for(let itemJ of Object.values(dataItem.option)){
                const itemValue:any=itemJ
                tempArr.push(itemValue.id[this.lang.code])
              }
              const response = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
              const arrRes = tempArr.map(item=>{
                return response.indexOf(item) !==-1;
              })
              let responseLogic!:boolean;
              
              if(dataItem.condition.id=='&&'){
                responseLogic =  arrRes.indexOf(false)==-1;
                for(let elementAux of Object.values(dataItem.ids)){
                  const dataId:any = elementAux;
                  if(responseLogic){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                  } 
                }
              }
              
              if(dataItem.condition.id=='||'){
                responseLogic =  arrRes.indexOf(true)!=-1;
                for(let elementAux of Object.values(dataItem.ids)){
                  const dataId:any = elementAux;
                  if(responseLogic){
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`card_${dataId.id}`)?.classList.add('d-block')
                    document.getElementById(`card_${dataId.id}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`card_${dataId.id}`)?.classList.remove('d-none')
                  } 
                }
              }
            }
          }

          const logic_group = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].logic_group;
          if(logic_group){
            for(let elem of Object.values(logic_group)){
              const dataElem:any = elem;
              const tempArrGroup = [];
              for(let eJ of Object.values(dataElem[0].option)){
                const eValue:any=eJ
                tempArrGroup.push(eValue.id[this.lang.code])
              }
              const responseGroup = this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response;
              const arrResGroup = tempArrGroup.map(item=>{
                return responseGroup.indexOf(item) !==-1;
              })
              let responseLogicGroup!:boolean;
              
              if(dataElem[0].condition.id=='&&'){
                responseLogicGroup =  arrResGroup.indexOf(false)==-1;
                  if(responseLogicGroup){
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                  } 
              }
              
              if(dataElem[0].condition.id=='||'){
                responseLogicGroup =  arrResGroup.indexOf(true)!=-1;
                  if(responseLogicGroup){
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-none')
                  }else{
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('d-block')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.add('animate__fadeIn')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('animate__fadeOut')
                    document.getElementById(`group_question_${dataElem[0].source_groups}`)?.classList.remove('d-none')
                  } 
              }
            }
          }
        }
        optionsArr.removeAt(ifOption)
      }
      this.save();
    }
  }

  detectedOpenQuestion(ev: Event){
    const option = (<HTMLInputElement>ev.target)
    const id = option.id.split('_')[1];
    if(option.value){
      const questionGroup = option.name.split('_')[1];
      document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-none');
      this.form.get(`question_${id}`)?.setValue(option.value);
      const indexOption = Object.values(this.questions[Number(questionGroup)-1][Number(questionGroup)]).findIndex((item:any) => item.id == id);
      if(indexOption > -1){
        this.questions[Number(questionGroup)-1][Number(questionGroup)][indexOption].response = option.value;
      }
    }else{
      document.getElementsByClassName(`require_question_${id}`)[0]?.classList.remove('d-none');
      document.getElementsByClassName(`require_question_${id}`)[0]?.classList.add('d-block');
    }
    this.save();

  }

  moreObservation(){

    this.loadEventService.loadEvent.emit(true);
    this.apiService.getResponse('GET', `formulario/retroalimentacionreview/${this.idForm}/`)
    .then((resp:any)=>{
      // console.log('moreObservation', Object.values(resp.question_package))
      this.displayObservation = true;
      this.observations = Object.values(resp.question_package);
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
