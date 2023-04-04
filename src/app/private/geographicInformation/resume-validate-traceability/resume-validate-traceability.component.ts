import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { ApiService } from '../../../core/services/api.service';
import { EventService } from '../../../core/services/event.service';
import { TranslateService } from '@ngx-translate/core';
import { ShowMessageService } from '../../../core/services/show-message.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-resume-validate-traceability',
  templateUrl: './resume-validate-traceability.component.html',
  styleUrls: ['./resume-validate-traceability.component.scss']
})
export class ResumeValidateTraceabilityComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;
  listSize = 0;
  /*  Material pagination */
  length = 0;
  totalElements: number = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 100];
  OFFSET: number = 0;
  pagination: any;
  displayedColumns: string[] = ['name',"percent", 'action'];
  textSearch: string = '';
  permissionAdd = false;
  permissionView = false;
  permissionChange = false;
  permissionDelete = false;
  lang: any;
  listData: any =[];
  company: any = null;
  pageSizeV = 10;
  listSizeV = 0;
  OFFSETV: number = 0;
  pageSizeOptionsV: number[] = [10, 25, 100];
  textSearch$ = new Subject<string>();
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  companyFilter:any;
  year:any = "";
  year$ = new Subject<string>();
  displayEmail=false;
  periodo:any = "";
  periodo$ = new Subject<string>();
  listPeriod: any[] = [
    {
      id: 0,
      name: 'ANNUAL',
    },
    {
      id: 1,
      name: 'BIANNUAL_1',
    },
    {
      id: 2,
      name: 'BIANNUAL_2',
    },
  ];

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private translate: TranslateService,
    private showMessage: ShowMessageService,
  ) {

  }
  
  ngOnInit(): void {
    this.getLang();
    this.textSearch$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });
    this.periodo$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response:any) => {
      this.list()
    });
    this.year$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.list()
    });
    this.list();
  }

  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  async list() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);
      //let url = `coordinates/traceability/validate/?limit=${this.pageSize}&offset=${this.OFFSET}`;

      let url = `coordinates/traceability/validateresume/company/?limit=${this.pageSize}&offset=${this.OFFSET}&year=${this.year}&period=${(this.periodo && this.periodo.id)?this.periodo.id:''}&company_name=${this.textSearch?this.textSearch:''}`;
      this.apiService.getResponse('GET', url).then(
        (resp: any) => {
          //   this.listData = resp.array;
          //   this.listSize = resp.array.length;
          //   this.dataSource = new MatTableDataSource<any>(this.listData);
          if (resp && resp.results) {
            this.listData = resp;
            this.listSize = resp.count;
            this.dataSource = new MatTableDataSource<any>(this.listData.results);
          }
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        },
        (error) => {
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
  }

  paginationChangeSize(e: PageEvent) {
    let offset = e.pageIndex * this.pageSize;
    if (offset >= this.listSize) {
      return;
    }
    this.OFFSET = offset;
    this.pageSize = e.pageSize;
    this.list();
  }

  applyFilter(){
    this.textSearch$.next(this.textSearch);
  }

  validateSend(id:any){
    this.router.navigate(['/geographic-information/validate-traceability/'], {queryParams: {idCompany: id}})
  }

  sendEmail(id:any){
    this.apiService.getResponse('GET', `coordinates/traceability/validateresume/company/sendmail/?reported_company_id=${id}`)
    .then(()=>{
      this.displayEmail=true;
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
    });
  }

  applyFilterPeriod(ev:any=null){
    this.periodo = ev;
    this.periodo$.next(this.periodo);
  }

  applyFilterYear(){
    let year = new Date(this.year).getFullYear();
    this.year = year.toString()
    this.year$.next(this.year);
  }
  clearYear(){
    this.year = "";
    this.year$.next(this.year);
  }

  clear() {
    this.textSearch = '';
    this.year = null;
    this.periodo = null;
    this.list();
  }


}
