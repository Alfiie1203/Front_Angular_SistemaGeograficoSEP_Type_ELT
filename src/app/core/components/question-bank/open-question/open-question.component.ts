import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Category, Subcategory, ListCategories, Topic, ListTopics, TypeQuestion } from '../../../interfaces/form';
import { ApiService } from '../../../services/api.service';
import { ShowMessageService } from '../../../services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-open-question',
  templateUrl: './open-question.component.html',
  styleUrls: ['./open-question.component.scss']
})
export class OpenQuestionComponent implements OnInit {

  @Input() data: any;
  @Input() options!:TypeQuestion[];
  @Output() optionQuestion = new EventEmitter();
  form!: FormGroup
  arrOption:number[] = [];
  listCategories!:Category[];
  listSubcategories!:Subcategory[];
  listTopics!:Topic[];
  loading=false;
  language={name:'assets/images/esp.png', code: 'es'};
  allLanguage:any[];
  lang:any;
  question:any;
  tempQuestion:any;
  types!: any[];
  displayConfirm = false;
  update=false;
  displayAddQuestion = false;
  selectedOption:any;
  saveQuestion = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.question = {
      status: true,
      type: "US",
      question_data: {
        type: "open_answer",
        label:{},
        description: {}
      }
    }
    this.createForm();
    this.allLanguage = [
      {name:'assets/images/esp.png', code: 'es'},
      {name:'assets/images/eng.png', code: 'en'},
      {name:'assets/images/bra.png', code: 'pt'}
    ]
    this.types = [
      {name: 'text', value: 'text'},
      {name: 'number', value: 'number'},
      {name: 'date', value: 'date'}
    ]
    // this.form.get('language')?.setValue({name:'assets/images/esp.png', code: 'es'});
    this.form.get('type')?.setValue({name: 'text', value: 'text'});
  }

  ngOnInit(): void {
    this.getLanguage();
    if(this.data){
      this.update=true;
      this.saveQuestion=true;
      this.assingUpdate();
    }else{
      this.getListCategories();
    }
    
    const ifQuestion = JSON.parse(localStorage.getItem('tempQuestionOpenQuestion')!);
    if(ifQuestion && !this.update){
      this.data = ifQuestion;
      this.assingUpdate();
    }

  }

  assingUpdate(){
    this.question = this.data;
      this.form.get('label')?.setValue(this.question.question_data.label[this.lang.code])
      this.form.get('description')?.setValue(this.question.question_data.description[this.lang.code])
      if(this.question.question_data.appearance=="text")
        this.form.get('type')?.setValue({name: 'text', value: 'text'});
      if(this.question.question_data.appearance=="number")
        this.form.get('type')?.setValue({name: 'number', value: 'number'});
      if(this.question.question_data.appearance=="date")
        this.form.get('type')?.setValue({name: 'date', value: 'date'});
      this.getListCategories();
  }

  getLanguage(){
    if(localStorage.getItem('lang')){
      this.form.get('language')?.setValue(JSON.parse(localStorage.getItem('lang')!));
    }else{
      this.form.get('language')?.setValue({name:'assets/images/esp.png', code: 'es'});
      localStorage.setItem('lang', JSON.stringify(this.form.get('language')))
    }
    this.lang = this.form.get('language')?.value;
  }


  createForm(){
    this.form = this.formBuilder.group({
      category: [''],
      listCategories: ['', [Validators.required]],
      subcategory: [''],
      listSubcategories: ['', [Validators.required]],
      topic: [''],
      listTopics: ['', [Validators.required]],
      label: ['', [Validators.required]],
      description: [''],
      type: [''],
      language: ['']
    });
  }

  createQuestion(){
    this.validateForm();
    if(this.form.valid){
      this.loading=true;
      this.question.question_data['appearance'] = this.form.get('type')?.value.name;
      this.assingQuestion();
      this.changeLang();
      if(!this.update){
        this.apiService.getResponse("POST", `questionbank/create/`, this.question)
        .then( resp =>{        
          this.loading=false;
          // this.createForm();
          this.displayConfirm=true;
          localStorage.removeItem('tempQuestionOpenQuestion');
          this.saveQuestion=true;
        }, error =>{
          this.loading=false;
          if(Array.isArray(error)){
            error.forEach((element:any) => {
              this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
            });
          }
        })
      }else{
        this.apiService.getResponse("PATCH", `questionbank/update/${this.question.id}/`, this.question)
        .then( resp =>{        
          this.loading=false;
          localStorage.removeItem('tempQuestionOpenQuestion');
          // this.createForm();
          this.displayConfirm=true;
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

  assingQuestion(){
    this.question.category = this.form.get('listCategories')?.value.id;
    this.question.subcategory = this.form.get('listSubcategories')?.value.id;
    this.question.topic = this.form.get('listTopics')?.value.id;
  }

  changeLang(){

    /* Label */
    if(this.question.question_data.label[this.form.get('language')?.value.code] != null && this.question.question_data.label[this.form.get('language')?.value.code] != undefined){
      this.question.question_data.label[this.lang.code] = this.form.value.label;
      this.form.controls['label'].setValue(this.question.question_data.label[this.form.get('language')?.value.code]);
    }else{
      this.question.question_data.label[this.lang.code] = this.form.value.label;
    }

    /* Description */
    if(this.question.question_data.description[this.form.get('language')?.value.code] != null && this.question.question_data.description[this.form.get('language')?.value.code] != undefined){
      this.question.question_data.description[this.lang.code] = this.form.value.description;
      this.form.controls['description'].setValue(this.question.question_data.description[this.form.get('language')?.value.code]);
    }else{
      this.question.question_data.description[this.lang.code] = this.form.value.description;
    }

      
    this.lang = this.form.get('language')?.value;
  }



  getListCategories(){
    this.apiService.getResponse('GET','questionbank/category/list/?status=true')
    .then( (resp:ListCategories) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET',`questionbank/category/list/?status=true&limit=${resp.count}`)
        .then( (res:ListCategories) =>{
          this.listCategories = res.results;
          if(this.update){
            this.form.get('listCategories')?.setValue(this.question.category);
            this.getListSubcategories();
          }
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
    this.apiService.getResponse('GET',`questionbank/category/view/${this.form.value.listCategories.id}/`)
    .then( (resp:Category) =>{
      this.listSubcategories = resp.subcategory;
      if(this.update){
        this.form.get('listSubcategories')?.setValue(this.question.subcategory);
        this.getListTopics();
      }
    }, error =>{
        if(Array.isArray(error)){
          error.forEach((element:any) => {
            this.showMessage.show('error', this.translate.instant('attention'), element, 'pi pi-exclamation-triangle');
          });
        }
    })
  }

  getListTopics(){
    this.apiService.getResponse('GET',`questionbank/topic/list/simple/?status=true&category=${this.form.value.listCategories.id}&subcategory=${this.form.value.listSubcategories.id}`)
    .then( (resp:ListTopics) =>{
      if(resp.count>0){
        this.apiService.getResponse('GET',`questionbank/topic/list/simple/?status=true&category=${this.form.value.listCategories.id}&subcategory=${this.form.value.listSubcategories.id}&limit=${resp.count}`)
        .then( (res:ListTopics) =>{
          this.listTopics = res.results;
          if(this.update){
            this.form.get('listTopics')?.setValue(this.question.topic);
          }
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

  listQuestion(){
    this.router.navigateByUrl('/question-bank')
  }


  get optionsTemp() {
    return this.form.controls["optionsTemp"] as FormArray;
  }

  addOption(ev: Event, index:number){
    const value = (ev.target as HTMLInputElement).value;
    if(value.length > 0){
      if(this.arrOption.indexOf(index) == -1){
        const options: FormArray = this.form.get('optionsTemp') as FormArray
        options.push(this.formBuilder.group({
          option: ['']
        }))
        this.arrOption.push(index);
      }
    }
  }

  deleteOption(index:number){
    const options: FormArray = this.form.get('optionsTemp') as FormArray
    options.removeAt(index);
    this.arrOption=this.arrOption.filter( item => item !== index);
  }

  drop(event: CdkDragDrop<string[]>) {
    const options = (this.form.get('optionsTemp') as FormArray).controls
    moveItemInArray(options, event.previousIndex, event.currentIndex);
    moveItemInArray(this.form.get('optionsTemp')?.value, event.previousIndex, event.currentIndex);
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

  sendOption(){
    if(this.selectedOption){
      this.router.navigateByUrl('/question-bank/create-edit-question-bank')
      this.optionQuestion.emit(this.selectedOption);
      this.displayAddQuestion=false;
    }
  }

  ngOnDestroy() {
    if(!this.saveQuestion){
      this.changeLang();
      localStorage.setItem('tempQuestionOpenQuestion', JSON.stringify(this.question))
    }
  }

}