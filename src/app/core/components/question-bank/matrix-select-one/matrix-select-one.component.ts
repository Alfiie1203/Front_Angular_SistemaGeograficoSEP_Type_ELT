import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Category, Subcategory, ListCategories, Topic, ListTopics, TypeQuestion } from '../../../interfaces/form';
import { ApiService } from '../../../services/api.service';
import { ShowMessageService } from '../../../services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-matrix-select-one',
  templateUrl: './matrix-select-one.component.html',
  styleUrls: ['./matrix-select-one.component.scss']
})
export class MatrixSelectOneComponent implements OnInit {
  
  @Input() data: any;
  @Input() options!:TypeQuestion[];
  @Output() optionQuestion = new EventEmitter();
  form!: FormGroup
  arrRow:number[] = [];
  arrColumn:number[] = [];
  listCategories!:Category[];
  listSubcategories!:Subcategory[];
  listTopics!:Topic[];
  loading=false;
  language={name:'assets/images/esp.png', code: 'es'};
  allLanguage:any[];
  lang:any;
  question:any;
  tempQuestion:any;
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
        type: "matrix_select_one",
        appearance: "radio",
        label:{},
        description: {},
        rows:{},
        columns:{}
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
    const ifQuestion = JSON.parse(localStorage.getItem('tempQuestionMatrixSelectOne')!);
    if(ifQuestion && !this.update){
      this.data = ifQuestion;
      this.assingUpdate();
    }

    
  }

  assingUpdate(){
    this.question = this.data;
    this.form.get('label')?.setValue(this.question.question_data.label[this.lang.code]);
    this.form.get('description')?.setValue(this.question.question_data.description[this.lang.code]);
    const rows: FormArray = this.form.get('rowsTemp') as FormArray;
    const columns: FormArray = this.form.get('columnsTemp') as FormArray;
    for(let [keyRow, valueRow] of  Object.entries(this.question.question_data.rows)){
      const tempRows:any = valueRow;
      rows.controls[(Number(keyRow)-1)].get('option')?.setValue(tempRows[this.lang.code]);
      rows.push(this.formBuilder.group({
        option: ['']
      }));
      this.arrRow.push((Number(keyRow)-1))
    }
    for(let [keyColumn, valueColumn] of  Object.entries(this.question.question_data.columns)){
      const tempColumn:any = valueColumn;
      columns.controls[(Number(keyColumn)-1)].get('option')?.setValue(tempColumn[this.lang.code]);
      columns.push(this.formBuilder.group({
        option: ['']
      }));
      this.arrColumn.push((Number(keyColumn)-1))
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
      language:[''],
      rowsTemp: this.formBuilder.array([
        this.formBuilder.group({
          option: ['']
        })
      ]),
      rows: this.formBuilder.array([]),
      columnsTemp: this.formBuilder.array([
        this.formBuilder.group({
          option: ['']
        })
      ]),
      colunms: this.formBuilder.array([]) 
    });
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

          localStorage.removeItem('tempQuestionMatrixSelectOne');
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
          localStorage.removeItem('tempQuestionMatrixSelectOne');
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
    if(Object.keys(this.question.question_data.label).length==0){
      this.question.question_data.label[this.form.get('language')?.value.code] =  this.form.value.label;
      const rows: FormArray = this.form.get('rowsTemp') as FormArray;
      const columns: FormArray = this.form.get('columnsTemp') as FormArray;
      let i = 1;
      let j = 1;
      for (let item of rows.controls) {
        if(item.value.option!=""){
          this.question.question_data.rows[i.toString()]= {[this.form.get('language')?.value.code] : item.value.option};
          i++;
        }
      }
      for (let item of columns.controls) {
        if(item.value.option!=""){
          this.question.question_data.columns[j.toString()]= {[this.form.get('language')?.value.code] : item.value.option};
          j++;
        }
      }
    }
  }

  changeLang(){
    let i = 1;
    let j = 1;
    const rows: FormArray = this.form.get('rowsTemp') as FormArray;
    const columns: FormArray = this.form.get('columnsTemp') as FormArray;

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

    /* row */
    if(rows.value.length>1 && this.question.question_data.rows[i] && this.question.question_data.rows[i][this.form.get('language')?.value.code]){
      for (let item of rows.controls) {
        if(item.value.option!=""){
          if(this.update && !this.question.question_data.rows[i]){
            this.question.question_data.rows[i] = {[this.lang.code]: item.value.option}
            this.question.question_data.rows[i][this.form.get('language')?.value.code] = item.value.option
          }
          this.question.question_data.rows[i][this.lang.code] = item.value.option;
          item.get('option')?.setValue(this.question.question_data.rows[i][this.form.get('language')?.value.code])
          i++;
        }
      }
    }else{
      if( this.question.question_data.rows[i]){
        for (let item of rows.controls) {
          if(item.value.option!=""){
              this.question.question_data.rows[i][this.lang.code] =  item.value.option;
            i++;
          }
        }
        
      }else{
        for (let item of rows.controls) {
          if(item.value.option!=""){
              this.question.question_data.rows[i] = {[this.lang.code]: item.value.option}
            i++;
          }
        }
      }
    }

    /* colums */
    if(columns.value.length>1 && this.question.question_data.columns[j] && this.question.question_data.columns[j][this.form.get('language')?.value.code]){
      for (let item of columns.controls) {
        if(item.value.option!=""){
          if(this.update && !this.question.question_data.columns[j]){
            this.question.question_data.columns[j] = {[this.lang.code]: item.value.option}
            this.question.question_data.columns[j][this.form.get('language')?.value.code] = item.value.option
          }
          this.question.question_data.columns[j][this.lang.code] = item.value.option;
          item.get('option')?.setValue(this.question.question_data.columns[j][this.form.get('language')?.value.code])
          j++;
        }
      }
    }else{
      if( this.question.question_data.columns[j]){
        for (let item of columns.controls) {
          if(item.value.option!=""){
              this.question.question_data.columns[j][this.lang.code] =  item.value.option;
            j++;
          }
        }
        
      }else{
        for (let item of columns.controls) {
          if(item.value.option!=""){
              this.question.question_data.columns[j] = {[this.lang.code]: item.value.option}
            j++;
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

  listQuestion(){
    this.router.navigateByUrl('/question-bank')
  }

  get rowsTemp() {
    return this.form.controls["rowsTemp"] as FormArray;
  }

  get columnsTemp() {
    return this.form.controls["columnsTemp"] as FormArray;
  }

  addRow(ev: Event, index:number){
    const value = (ev.target as HTMLInputElement).value;
    if(value.length > 0){
      if(this.arrRow.indexOf(index) == -1){
        const options: FormArray = this.form.get('rowsTemp') as FormArray
        options.push(this.formBuilder.group({
          option: ['']
        }))
        this.arrRow.push(index);
      }
    }
  }

  addColumn(ev: Event, index:number){
    const value = (ev.target as HTMLInputElement).value;
    if(value.length > 0){
      if(this.arrColumn.indexOf(index) == -1){
        const options: FormArray = this.form.get('columnsTemp') as FormArray
        options.push(this.formBuilder.group({
          option: ['']
        }))
        this.arrColumn.push(index);
      }
    }
  }

  deleteRow(index:number){
    const options: FormArray = this.form.get('rowsTemp') as FormArray
    options.removeAt(index);
    delete this.question.question_data.rows[index+1];
    this.arrRow=this.arrRow.filter( item => item !== index);
  }

  deleteColumn(index:number){
    const options: FormArray = this.form.get('columnsTemp') as FormArray
    options.removeAt(index);
    delete this.question.question_data.columns[index+1];
    this.arrColumn=this.arrColumn.filter( item => item !== index);
  }

  dropRow(event: CdkDragDrop<string[]>) {
    const options = (this.form.get('rowsTemp') as FormArray).controls
    moveItemInArray(options, event.previousIndex, event.currentIndex);
    moveItemInArray(this.form.get('rowsTemp')?.value, event.previousIndex, event.currentIndex);
  }

  dropColunm(event: CdkDragDrop<string[]>) {
    const options = (this.form.get('columnsTemp') as FormArray).controls
    moveItemInArray(options, event.previousIndex, event.currentIndex);
    moveItemInArray(this.form.get('columnsTemp')?.value, event.previousIndex, event.currentIndex);
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
      localStorage.setItem('tempQuestionMatrixSelectOne', JSON.stringify(this.question))
    }
  }


}
