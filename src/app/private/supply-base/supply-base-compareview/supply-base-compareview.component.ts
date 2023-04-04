import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { EventService } from 'src/app/core/services/event.service';
import { ApiService } from 'src/app/core/services/api.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';


@Component({
  selector: 'app-supply-base-compareview',
  templateUrl: './supply-base-compareview.component.html',
  styleUrls: ['./supply-base-compareview.component.scss'],
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
export class SupplyBaseCompareviewComponent implements OnInit {

  expandedElement:any
  expandedElement2:any
  expandedElement3:any
  constructor(
    public location: Location,
    private loadEventService: EventService,
    private apiService: ApiService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    let id: any = this.route.snapshot.paramMap.get('id');
    if (Number.isNaN(Number(id))) {
      this.router.navigate(['/home']);
    }
    this.getLang();
    this.ID = id;
    this.loadEventService.loadLanguage.subscribe(() => {
      this.getLang();
    });
  }
  _open:string = "";
  _close:string = "";
  ID: number = 0;
  lang: any;
  data: any;
  /*****Semestre 1 */
  traceability_percentageP1: Array<any> = [];
  dataSourceRT1 = new MatTableDataSource<Array<[]>>();
  displayedColumnsRT1: string[] = ['c1', 'c2', 'c3', 'c4'];
  traceability_alert1: Array<any> = [];
  dataSourceTA1 = new MatTableDataSource<Array<[]>>();
  displayedColumnsTA1: string[] = [
    'actor_type',
    'traceability_registered',
    'registered_supply_base',
    'alerts',
    // 'more'
  ];
  /*****Semestre 2 */
  traceability_percentageP2: Array<any> = [];
  dataSourceRT2 = new MatTableDataSource<Array<[]>>();
  displayedColumnsRT2: string[] = ['c1', 'c2', 'c3', 'c4'];
  traceability_alert2: Array<any> = [];
  dataSourceTA2 = new MatTableDataSource<Array<[]>>();
  displayedColumnsTA2: string[] = [
    'actor_type',
    'traceability_registered',
    'registered_supply_base',
    'alerts',
    'more'
  ];
  /*****Anual */
  traceability_percentageP: Array<any> = [];
  dataSourceRT = new MatTableDataSource<Array<[]>>();
  displayedColumnsRT: string[] = ['c1', 'c2', 'c3', 'c4'];
  traceability_alert: Array<any> = [];
  dataSourceTA = new MatTableDataSource<Array<[]>>();
  displayedColumnsTA: string[] = [
    'actor_type',
    'traceability_registered',
    'registered_supply_base',
    'alerts',
    'more'
  ];
  ngOnInit(): void {
    this.getResumen();
  }
  async getResumen() {
    this.loadEventService.loadTableEvent.emit(true);
    const url = `supplybase/api/detail/compareview/${this.ID}/`;
    this.apiService.getResponse('GET', url).then(
      async (resp: any) => {
        if (resp && resp.id && resp.company) {
          this._open = await this.translate.instant('open');
          this._close = await this.translate.instant('close');
          this.data = resp;
          //period 1
          this.traceability_percentageP1 = this.data.traceability_percentage_1;
          this.dataSourceRT1 = new MatTableDataSource<Array<[]>>(
            this.traceability_percentageP1
          );
          this.traceability_alert1 = this.data.traceability_alert_1;
          this.dataSourceTA1 = new MatTableDataSource<Array<[]>>(
            this.traceability_alert1
          );
          //period 2
          this.traceability_percentageP2 = this.data.traceability_percentage_2;
          this.dataSourceRT2 = new MatTableDataSource<Array<[]>>(
            this.traceability_percentageP2
          );
          this.traceability_alert2 = this.data.traceability_alert_2;
          this.dataSourceTA2 = new MatTableDataSource<Array<[]>>(
            this.traceability_alert2
          );
          //period 0 annual
          this.traceability_percentageP = this.data.traceability_percentage_resume;
          this.dataSourceRT = new MatTableDataSource<Array<[]>>(
            this.traceability_percentageP
          );
          this.traceability_alert = this.data.traceability_alert_resume;
          this.dataSourceTA = new MatTableDataSource<Array<[]>>(
            this.traceability_alert
          );
        } else {
        }
      },
      (error) => {
        /* this.loadEventService.loadTableEvent.emit(false);
        this.loadEventService.loadEvent.emit(false); */
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
    ).finally(()=>{
      this.loadEventService.loadTableEvent.emit(false);
      this.loadEventService.loadEvent.emit(false);
      
    });
  }
  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  expand(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }  
  expand2(element: any) {
    this.expandedElement2 = this.expandedElement2 === element ? null : element;
  }  
  expand3(element: any) {
    this.expandedElement3 = this.expandedElement3 === element ? null : element;
  }  
}
