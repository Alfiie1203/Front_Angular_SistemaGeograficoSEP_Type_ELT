import { Component, OnInit } from '@angular/core';
import { DatePipe, Location, ViewportScroller } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { FormCompany, ListFormCompany } from 'src/app/core/interfaces/form';
import { PageEvent } from '@angular/material/paginator';
import { EventService } from 'src/app/core/services/event.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AnyObject } from 'chart.js/dist/types/basic';
import { SelectItem } from 'primeng/api';
import { trigger, state, transition, style, animate } from '@angular/animations';

export interface validatorsI {
  id: number;
  full_name: string;
  checked: boolean;
}

@Component({
  selector: 'app-verify-form-list',
  templateUrl: './verify-form-list.component.html',
  styleUrls: ['./verify-form-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class VerifyFormListComponent implements OnInit {

  constructor(
    public location: Location,
    private readonly viewport: ViewportScroller,
    private loadEventService: EventService,
    private router: Router,
    private translate: TranslateService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe
  ) {
    this.listRevisionStatus.forEach((item) => {
      this.listStatusRevision[item.id] = item.name;
    });
    
    this.getLang();
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }
  listPeriod: any[] = [];
  listStatusRevision: AnyObject = {};
  listRevisionStatus: any[] = [
    {
      id: 'VERIFIED',
      name: 'verified',
    },
    {
      id: 'INVERIFYPROCESS',
      name: 'in verify process',
    },
    {
      id: 'WITHOUTVERIFY',
      name: 'Without verfy',
    },
    {
      id: 'VALIDATE',
      name: 'validated',
    },
    {
      id: 'INVALIDATINGPROCESS',
      name: 'in validation process',
    },
    {
      id: 'WITHOUTVALIDATE',
      name: 'Without validate',
    },
    {
      id: 'NOTASSIGNED',
      name: 'Not Assigned',
    },
  ];
  proforestForms: Array<any> = [];
  revisors: Array<any> = [];

  title_name = 'assign_checker_for_form';
  textSearch = '';
  filterValue = '';
  dataSource = new MatTableDataSource<FormCompany>();
  columnsToDisplay = [
    'assigned_company',
    'name',
    'revision_status',
    // 'revisor',
    'period',
    'action',
    'more'
  ];

    idForm:any;

  pageSizeOptions: number[] = [10, 25, 100];
  selectedRowIndex = -1;
  expandedElement!: FormCompany;
  listSize = 0;
  pagination = 10;
  OFFSET: number = 0;
  pageIndex = 0;
  listData!: any;
  lang: any;
    displayConfirm2:boolean = false;

  form_search: FormGroup = <FormGroup>{};
  revision_status: string = '';
  proforestform_id: string = '';
  revisor_id: string = '';
  periodo: any = '';
  name: string = '';

  displayConfirm:boolean = false;
  loadV:boolean = false;
  validators:Array<any>  = [];
  listSizeV:any;
  validatorsCount:any;
  pageSizeV = 10;
  listSizeVal = 0;
  OFFSETV: number = 0;
  validatorsBTN: boolean = false;
  pageSizeOptionsV: number[] = [10, 25, 100];
  range_date_validation: Array<any> = [];

  ngOnInit(): void {
    this.lazyItems = Array.from({ length: 40 });
    this.getProforestForms();
    this.getPeriods();
    this.getColaborators();
    this.initFormSearch();
  }
  initFormSearch() {
    this.form_search = this.formBuilder.group({
      revision_status: [''],
      proforestform_id: [''],
      revisor_id: [''],
      periodo: [''],
      name: [''],
    });
    this.form_search.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((response) => {
        this.list();
      });
    this.list();
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.list();
  }
  paginationChangeSize(e: PageEvent) {
    let offset = e.pageIndex * this.pagination;
    if (offset >= this.listSize) {
      return;
    }
    this.OFFSET = offset;
    this.pagination = e.pageSize;
    this.list();
  }
  getProforestForms() {
    //formulario/list/proforestforms/idnames/
    const url = `formulario/list/proforestforms/idnames/?limit=50`;
    this.apiService
      .getResponse('GET', url)
      .then(
        (resp: any) => {
          if (resp && resp.count && resp.results) {
            this.proforestForms = resp.results;
          }
        },
        (error) => {
          if (Array.isArray(error)) {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          }
        }
      )
      .finally(() => {
        this.loadEventService.loadTableEvent.emit(false);
        this.loadEventService.loadEvent.emit(false);
      });
  }
  getColaborators() {
    //coordinates/general/colaborators/list/
    const url = `coordinates/general/colaborators/list/`;
    this.apiService
      .getResponse('GET', url)
      .then(
        (resp: any) => {
          if (resp && resp.count && resp.results) {
            this.revisors = resp.results;
          }
        },
        (error) => {
          if (Array.isArray(error)) {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          }
        }
      )
      .finally(() => {});
  }
  getPeriods() {
    //formulario/list/proforestforms/period/
    const url = `formulario/list/proforestforms/period/`;
    this.apiService
      .getResponse('GET', url)
      .then(
        (resp: any) => {
          if (resp && resp.count && resp.results) {
            this.listPeriod = resp.results;
          }
        },
        (error) => {
          if (Array.isArray(error)) {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          }
        }
      )
      .finally(() => {
        this.loadEventService.loadTableEvent.emit(false);
        this.loadEventService.loadEvent.emit(false);
      });
  }

  list() {
    this.listSize = 0;
    this.pageIndex = 0;
    this.loadEventService.loadTableEvent.emit(true);
    let revision_status =
      this.form_search && this.form_search.get('revision_status')?.value
        ? this.form_search.get('revision_status')?.value.id
        : '';
    let proforestform_id =
      this.form_search && this.form_search.get('proforestform_id')?.value
        ? this.form_search.get('proforestform_id')?.value.id
        : '';
    let revisor_id =
      this.form_search && this.form_search.get('revisor_id')?.value
        ? this.form_search.get('revisor_id')?.value.id
        : '';
    let periodo =
      this.form_search && this.form_search.get('periodo')?.value
        ? this.form_search.get('periodo')?.value.id
        : '';
    let name =
      this.form_search && this.form_search.get('name')
        ? this.form_search.get('name')?.value
        : '';
    const url = `formulario/verificate/list/formularios/?limit=${this.pagination}&offset=${this.OFFSET}&name=${name}&revision_status=${revision_status}&proforestform_id=${proforestform_id}&revisor_id=${revisor_id}&period=${periodo}`;
    this.apiService
      .getResponse('GET', url)
      .then(
        (resp: any) => {
          //this.title_name = resp.results[0].name;
          this.listData = resp;
          this.listSize = resp.count;
          this.dataSource = new MatTableDataSource<FormCompany>(
            this.listData.results
          );
        },
        (error) => {
          if (Array.isArray(error)) {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          }
        }
      )
      .finally(() => {
        this.loadEventService.loadTableEvent.emit(false);
        this.loadEventService.loadEvent.emit(false);
      });
  }
  errorV:any;
  errorMessageV:any;
  asignarAction(event: Event,op_en: any) {
    if (
      !this.listData ||
      (this.listData && this.listData.results.length == 0)
    ) {
      
      this.errorV = true;
      this.errorMessageV = 'no_selected_forms';
      op_en.toggle(event);
      return
    }
    this.getValidators()
    this.displayConfirm = true;
  }

  asignarAction2(event: Event,op_en: any, data:any) {
    this.getValidators()
    this.displayConfirm2 = true;
    this.idForm = data.id;
  }
 
  clearRangeDate() {
    this.range_date_validation = [];
  }
  async getValidators() {
      this.loadV = true;
      let url = `coordinates/verificators/list/?limit=${this.pageSizeV}&offset=${this.OFFSETV}`;
      this.apiService.getResponse('GET', url).then(
        (resp: any) => {
          if (resp && resp.results) {
            this.validators = [];
            let validators: Array<validatorsI> = resp.results;
            this.listSizeVal = resp.count;
            validators.forEach((item) => {
              this.validators.push({
                id: item.id,
                full_name: item.full_name,
                checked: false,
              });
            });
            this.validatorsCount = resp.count;
          }
          this.loadV = false;
        },
        (error) => {
          this.loadV = false;
          if (Array.isArray(error)) {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          }
        }
      );
  }
  confirmValidatorChange(id: number) {
    this.validatorsBTN = true;
    this.validators.forEach((e) => {
      if (id == e.id) {
        if(e.checked){
          e.checked=false;
        }else{
          e.checked=true;
        }
      }
    });
  }
  paginationValidatorsChangeSize(e: PageEvent) {
    let offset = e.pageIndex * this.pageSizeV;
    if (offset >= this.listSizeVal) {
      return;
    }
    this.OFFSETV = offset;
    this.pageSizeV = e.pageSize;
    this.getValidators();
  }
  confirmValidator(event: Event, op_en: any) {
    if (
      this.range_date_validation &&
      (!this.range_date_validation[0] || !this.range_date_validation[1])
    ) {
      this.errorV = true;
      this.errorMessageV = 'set_the_dates';
      op_en.toggle(event);
      return;
    }
    if (!this.listData && this.listData && this.listData.results.length == 0) {
      this.errorV = true;
      this.errorMessageV = 'no ha seleccionado ninguna empresa';
      op_en.toggle(event);
      return;
    }
    this.errorV = false;
    this.errorMessageV = '';
    let selectedValidator: validatorsI;
    let selectedValidator_:any=[]; 
    this.validators.forEach((el) => {
      if(el.checked == true){
        selectedValidator_.push(el.id)
      }
    });
    selectedValidator = this.validators.filter((el) => el.checked == true)[0];
    if (selectedValidator_.length>0) {
      if (this.range_date_validation) {
        if (!this.range_date_validation[0] || !this.range_date_validation[1]) {
          this.errorV = true;
          this.errorMessageV = 'set_the_dates';
          op_en.toggle(event);
          return;
        }
      } else {
        this.errorV = true;
        this.errorMessageV = 'set_the_dates';
        op_en.toggle(event);
        return;
      }
      this.saveValidator(selectedValidator_, event, op_en);
    } else {
      this.errorMessageV = 'no_selected_validator';
      op_en.toggle(event);
      this.errorV = true;
    }
  }
  async saveValidator(validator: validatorsI, event: Event, op_en: any) {
    let revision_status =
      this.form_search && this.form_search.get('revision_status')?.value
        ? this.form_search.get('revision_status')?.value.id
        : '';
    let proforestform_id =
      this.form_search && this.form_search.get('proforestform_id')?.value
        ? this.form_search.get('proforestform_id')?.value.id
        : '';
    let revisor_id =
      this.form_search && this.form_search.get('revisor_id')?.value
        ? this.form_search.get('revisor_id')?.value.id
        : '';
    let periodo =
      this.form_search && this.form_search.get('periodo')?.value
        ? this.form_search.get('periodo')?.value.id
        : '';
    let name =
      this.form_search && this.form_search.get('name')
        ? this.form_search.get('name')?.value
        : '';

    const dataSend: any = {
      name: name,
      period: periodo,
      proforestform_id: proforestform_id,
      revision_status: revision_status,
      revisor_id: revisor_id,
      assigned_validator_id:validator,
      start_date_validation: this.datepipe.transform(
        new Date(this.range_date_validation[0]),
        'yyyy-MM-dd'
      ),
      end_date_validation: this.datepipe.transform(
        new Date(this.range_date_validation[1]),
        'yyyy-MM-dd'
      ),
    };
    let paramsUrl = ``;
    let separator = `?`;
    for (let key in dataSend) {
      paramsUrl += `${separator}${key}=${dataSend[key]}`;
      separator = `&`;
    }
    
    const url = `formulario/verificate/assign/list/formularios/`;
      this.loadEventService.loadTableEvent.emit(true);
      this.apiService.getResponse('POST', url, dataSend).then(
        (resp: any) => {
          let asignado = this.translate.instant('asigned');
          if (resp && resp.results) {
            let type = resp.asignado == 0 ? 'warn' : 'success';
            this.showMessage.show(
              type,
              this.translate.instant('attention'),
              this.translate.instant('verify_assing'),
              'pi pi-exclamation-triangle'
            );
            this.cancelValidator();
            this.list();
          }
          this.errorMessageV = '';
          this.errorV = false;
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        },
        (error) => {
          this.errorMessageV = '';
          this.errorV = false;
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
          if (Array.isArray(error)) {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          }
        }
      );
    
  }

  confirmValidator2(event: Event, op_en: any) {
    if (
      this.range_date_validation &&
      (!this.range_date_validation[0] || !this.range_date_validation[1])
    ) {
      this.errorV = true;
      this.errorMessageV = 'set_the_dates';
      op_en.toggle(event);
      return;
    }
    if (!this.listData && this.listData && this.listData.results.length == 0) {
      this.errorV = true;
      this.errorMessageV = 'no ha seleccionado ninguna empresa';
      op_en.toggle(event);
      return;
    }
    this.errorV = false;
    this.errorMessageV = '';
    let selectedValidator: validatorsI;
    let selectedValidator_:any=[]; 
    this.validators.forEach((el) => {
      if(el.checked == true){
        selectedValidator_.push(el.id)
      }
    });
    selectedValidator = this.validators.filter((el) => el.checked == true)[0];
    if (selectedValidator_.length>0) {
      if (this.range_date_validation) {
        if (!this.range_date_validation[0] || !this.range_date_validation[1]) {
          this.errorV = true;
          this.errorMessageV = 'set_the_dates';
          op_en.toggle(event);
          return;
        }
      } else {
        this.errorV = true;
        this.errorMessageV = 'set_the_dates';
        op_en.toggle(event);
        return;
      }
      this.saveValidator2(selectedValidator_, event, op_en);
    } else {
      this.errorMessageV = 'no_selected_validator';
      op_en.toggle(event);
      this.errorV = true;
    }
  }
  async saveValidator2(validator: validatorsI, event: Event, op_en: any) {

    const dataSend: any = {
      revisor:validator,
      start_date_validation: this.datepipe.transform(
        new Date(this.range_date_validation[0]),
        'yyyy-MM-dd'
      ),
      end_date_validation: this.datepipe.transform(
        new Date(this.range_date_validation[1]),
        'yyyy-MM-dd'
      ),
    };
    let paramsUrl = ``;
    let separator = `?`;
    for (let key in dataSend) {
      paramsUrl += `${separator}${key}=${dataSend[key]}`;
      separator = `&`;
    }
    const url = `formulario/verificate/assign/formulario/${this.idForm}`;
      this.loadEventService.loadTableEvent.emit(true);
      this.apiService.getResponse('PATCH', url, dataSend).then(
        (resp: any) => {
          let asignado = this.translate.instant('asigned');
          // if (resp && resp.results) {
          //   let type = resp.asignado == 0 ? 'warn' : 'success';
            this.showMessage.show(
              'success',
              this.translate.instant('attention'),
              this.translate.instant('verify_assing'),
              'pi pi-exclamation-triangle'
            );
            this.cancelValidator();
            this.list();
          // }
          this.errorMessageV = '';
          this.errorV = false;
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        },
        (error) => {
          this.errorMessageV = '';
          this.errorV = false;
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
          if (Array.isArray(error)) {
            error.forEach((element: any) => {
              this.showMessage.show(
                'error',
                this.translate.instant('attention'),
                element,
                'pi pi-exclamation-triangle'
              );
            });
          }
        }
      );
    
  }
  cancelValidator() {
    this.displayConfirm = false;
    this.displayConfirm2 = false;
    this.idForm = undefined;
    this.clearRangeDate();
    this.validators.forEach((e) => {
      e.checked = false;
    });
  }


  /*****Lazy Load */
  loading: boolean = false;
  loadLazyTimeout: any;
  lazyItems!: SelectItem[];
  selectedItem2: any;
  lazy:any = null;
  virtualScrollOptions:any = { showLoader: true, loading: (this.loading ) ,  delay: 250 }
  onLazyLoad(event:any) {
    const { first, last } = event;
    //this.loading = true;
    if (this.loadLazyTimeout) {
        clearTimeout(this.loadLazyTimeout);
    }
    if(!this.lazy){
      //this.loading = true;
      this.lazy = event;
     // console.log("!onLazyLoad:",this.lazy);
      //this.loading = false;
      
      this.loadLazyTimeout = setTimeout(() => {
        //this.loading = true;
        
        this.lazy = event;
        const lazyItems = [...this.lazyItems];
        
        for (let i = first; i < last; i++) {
            lazyItems[i] = { label: `Item #${i}`, value: i };
        }

        this.lazyItems = lazyItems;
        this.loading = false;
    }, Math.random() * 1000 + 250);
    }else /* if(this.lazy.last != last) */{
      //this.loading = true;
      const { first, last } = event;
     // console.log("onLazyLoad:",this.lazy);
     // console.log("onLazyLoad: event",event);
      this.loadLazyTimeout = setTimeout(() => {
       
        this.lazy = event;
        const lazyItems = [...this.lazyItems];

        for (let i = first; i < last; i++) {
            lazyItems[i] = { label: `Item #${i}`, value: i };
        }

        this.lazyItems = lazyItems;
       // console.log("onLazyLoad: update:",this.lazyItems);
        this.loading = false;
    },Math.random() * 1000 + 250);
    }
    

    //imitate delay of a backend call
    
}

expand(element:any){
  this.expandedElement = this.expandedElement === element ? null : element
}
  /*****Lazy Load */

  applyFilterRevision(data:any){
    this.form_search.get('revision_status')?.setValue(data);

  }
  searchPeriod(data:any){
    this.form_search.get('periodo')?.setValue(data);

  }

  clear(){
    this.form_search.get('revision_status')?.setValue('');
    this.form_search.get('proforestform_id')?.setValue('');
    this.form_search.get('revisor_id')?.setValue('');
    this.form_search.get('periodo')?.setValue('');
    this.form_search.get('name')?.setValue('');
    // this.form_search = this.formBuilder.group({
    //   revision_status: [''],
    //   proforestform_id: [''],
    //   revisor_id: [''],
    //   periodo: [''],
    //   name: [''],
    // });
    // this.list();
  }
}
