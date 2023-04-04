import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Category, Subcategory, ListCategories, Topic, ListTopics, TypeQuestion } from '../../../interfaces/form';
import { ApiService } from '../../../services/api.service';
import { ShowMessageService } from '../../../services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-multiple',
  templateUrl: './select-multiple.component.html',
  styleUrls: ['./select-multiple.component.scss']
})
export class SelectMultipleComponent implements OnInit {

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
  question:any = {};
  tempQuestion:any;
  displayConfirm = false;
  displayAddQuestion = false;
  selectedOption:any;
  update=false;
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
        type: "select_multiple",
        appearance: "checkbox",
        label:{},
        description: {},
        choices:{}
      }
    }
    this.createForm();
    this.allLanguage = [
      {name:'assets/images/esp.png', code: 'es'},
      {name:'assets/images/eng.png', code: 'en'},
      {name:'assets/images/bra.png', code: 'pt'}
    ]
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

    
    const ifQuestion = JSON.parse(localStorage.getItem('tempQuestionSelectMultiple')!);
    if(ifQuestion && !this.update){
      this.data = ifQuestion;
      this.assingUpdate();
    }
  }

  assingUpdate(){
    this.question = this.data;
    this.form.get('label')?.setValue(this.question.question_data.label[this.lang.code]);
    this.form.get('description')?.setValue(this.question.question_data.description[this.lang.code]);
    const options: FormArray = this.form.get('optionsTemp') as FormArray;
    for(let [key, value] of  Object.entries(this.question.question_data.choices)){
      const tempData:any = value;
      options.controls[(Number(key)-1)].get('option')?.setValue(tempData[this.lang.code]);
      options.push(this.formBuilder.group({
        option: ['']
      }));
      this.arrOption.push((Number(key)-1))
    }
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

  createQuestion(){
    this.validateForm();
    if(this.form.valid){
      this.loading=true;
      this.assingQuestion();
      this.changeLang();
      if(!this.update){
        this.apiService.getResponse("POST", `questionbank/create/`, this.question)
        .then( resp =>{        
          this.loading=false;
          // this.createForm();
          this.displayConfirm=true;
          localStorage.removeItem('tempQuestionSelectMultiple');
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
          localStorage.removeItem('tempQuestionSelectMultiple');
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


  createForm(){
    this.form = this.formBuilder.group({
      listCategories: ['', [Validators.required]],
      listSubcategories: ['', [Validators.required]],
      listTopics: ['', [Validators.required]],
      label: ['', [Validators.required]],
      description: [''],
      language:[''],
      optionsTemp: this.formBuilder.array([
        this.formBuilder.group({
          option: ['']
        })
      ]),
      options: this.formBuilder.array([]) 
    });
  }


  assingQuestion(){
    this.question.category = this.form.get('listCategories')?.value.id;
    this.question.subcategory = this.form.get('listSubcategories')?.value.id;
    this.question.topic = this.form.get('listTopics')?.value.id;
    if(Object.keys(this.question.question_data.label).length==0){
      this.question.question_data.label[this.form.get('language')?.value.code] =  this.form.value.label;
      const optionsTemp: FormArray = this.form.get('optionsTemp') as FormArray;
      let i = 1;
      for (let item of optionsTemp.controls) {
        if(item.value.option!=""){
          this.question.question_data.choices[i.toString()]= {[this.form.get('language')?.value.code] : item.value.option};
          i++;
        }
      }
    }
  }

  changeLang(){
    let i = 1;
    const optionsTemp: FormArray = this.form.get('optionsTemp') as FormArray;

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

    /* Options */
    if(optionsTemp.value.length>1 && this.question.question_data.choices[i] && this.question.question_data.choices[i][this.form.get('language')?.value.code]){
      for (let item of optionsTemp.controls) {
        if(item.value.option!=""){
          if(this.update && !this.question.question_data.choices[i]){
            this.question.question_data.choices[i] = {[this.lang.code]: item.value.option}
            this.question.question_data.choices[i][this.form.get('language')?.value.code] = item.value.option
          }
            this.question.question_data.choices[i][this.lang.code] = item.value.option;
            item.get('option')?.setValue(this.question.question_data.choices[i][this.form.get('language')?.value.code])
          i++;
        }
      }
    }else{
      if( this.question.question_data.choices[i]){
        for (let item of optionsTemp.controls) {
          if(item.value.option!=""){
              this.question.question_data.choices[i][this.lang.code] =  item.value.option;
            i++;
          }
        }
        
      }else{
        for (let item of optionsTemp.controls) {
          if(item.value.option!=""){
              this.question.question_data.choices[i] = {[this.lang.code]: item.value.option}
            i++;
          }
        }
      }
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

  listQuestion(){
    this.router.navigateByUrl('/question-bank')
  }

  deleteOption(index:number){
    const options: FormArray = this.form.get('optionsTemp') as FormArray
    options.removeAt(index);
    delete this.question.question_data.choices[index+1];
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

  sendOption(){
    if(this.selectedOption){
      this.router.navigateByUrl('/question-bank/create-edit-question-bank')
      this.optionQuestion.emit(this.selectedOption);
      this.displayAddQuestion=false;
    }
  }


  get f(){
    return this.form.controls;
  }

    ngOnDestroy() {
      if(!this.saveQuestion){
      this.changeLang();
      localStorage.setItem('tempQuestionSelectMultiple', JSON.stringify(this.question))
    }
  }

}
