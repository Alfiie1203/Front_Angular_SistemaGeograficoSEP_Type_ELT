import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/api.service';
import { EventService } from 'src/app/core/services/event.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Location } from '@angular/common';
import { MapMarker } from '@angular/google-maps';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-supply-base',
  templateUrl: './supply-base.component.html',
  styleUrls: ['./supply-base.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class SupplyBaseComponent implements OnInit {

  permissionAdd:boolean = true;
  expandedElement:any;
  listData: any;
  listDataBK: any;
  listSize:number = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  pageSize = 10;
  displayedColumns = ['company_name','register_year', 'period', 'purchased_volume', 'actions', 'more'];
  selectedRowIndex = -1;
  periodo:any = null;
  periodo$ = new Subject<string>();
  year:any = null;
  year$ = new Subject<string>();
  textSearch:string = "";
  textSearch$ = new Subject<string>();
  
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
  pageSizeOptions: number[] = [10, 25, 100];
  OFFSET:number = 0;

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private router:Router,
    public location: Location,
  ) {
    
    this.getList();
    this.textSearch$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      this.getList()
    });
    this.year$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response) => {
      
      
      this.getList()
    });
    this.periodo$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((response:any) => {
      this.getList()
    });
  }

  ngOnDestroy(){
    if( this.periodo$){
      this.periodo$.unsubscribe()
    }
    if( this.year$){
      this.year$.unsubscribe()
    }
    if( this.textSearch$){
      this.textSearch$.unsubscribe()
    }
  }

  async getList(){
    
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

      if (getToken) {
        this.loadEventService.loadTableEvent.emit(true);
        const url = `supplybase/api/list/?limit=${this.pageSize}&offset=${this.OFFSET}&search=${this.textSearch}&year=${(this.year)?this.year:''}&period=${(this.periodo)?this.periodo.id:''}`;
        this.apiService.getResponse('GET', url).then(
          (resp: any) => {
            if (resp && resp.results) {
              this.listData = resp;
              this.listDataBK = JSON.parse(JSON.stringify(resp));
              this.listSize = resp.count;
              this.dataSource = new MatTableDataSource<any>(
                this.listData.results
              );
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

  ngOnInit(): void {
  }
  applyFilter(){
    this.textSearch$.next(this.textSearch);
  }
  applyFilterYear(){
    let year = new Date(this.year).getFullYear();
    this.year = year.toString()
    this.year$.next(this.year);
  }
  applyFilterPeriod(){
    this.periodo$.next(this.periodo);
  }

  getPeriodById(id:number):string{
    let name = "";
    let objectPeriod = this.listPeriod.filter(item=>item.id == id);
    if(objectPeriod.length > 0 ){
      name = objectPeriod[0].name
    }
    return name;
  }


  paginationChangeSize(e: PageEvent) {
    let offset = e.pageIndex * this.pageSize;
    if (offset >= this.listSize) {
      return;
    }
    this.OFFSET = offset;
    this.pageSize = e.pageSize;
    this.getList();
  }
  viewDetails(id:number){
    this.router.navigate(["supply-base/view",id]);
  }
  viewResumen(id:number){
    this.router.navigate(["supply-base/compareview/"+id+"/"]);
  }
  clearYear(){
    this.year = "";
    this.year$.next(this.year);
  }


  expand(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }
}
