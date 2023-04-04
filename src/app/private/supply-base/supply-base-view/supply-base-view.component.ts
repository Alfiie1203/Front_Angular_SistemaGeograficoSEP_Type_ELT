import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/api.service';
import { EventService } from 'src/app/core/services/event.service';
import { ShowMessageService } from 'src/app/core/services/show-message.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Location } from '@angular/common';

import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';



export interface markerDataInfoI {
  marker_info: string;
  marker_type: string;
  marker_data: any;
  marker_level: number;
  reported_company?: string;
}
export interface markerDataInfoI {
  marker_info: string;
  marker_type: string;
  marker_data: any;
  marker_level: number;
  reported_company?: string;
}

export interface traceabilityResumeI {
  actor_type: string;
  estimado_alerta: number;
  estimado_compra: number;
  estimado_validacion: number;
  estimado_verificado: number;
  vol_comprado: number;
}



@Component({
  selector: 'app-supply-base-view',
  templateUrl: './supply-base-view.component.html',
  styleUrls: ['./supply-base-view.component.scss'],
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
export class SupplyBaseViewComponent implements OnInit {
  @ViewChild(GoogleMap) googleMap!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) info!: MapInfoWindow;
  dataSource = new MatTableDataSource<traceabilityResumeI>();
  displayedColumns: string[] = [
    'actor_type',
    'vol_comprado',
    'estimado_compra',
    'estimado_validacion',
    'estimado_verificado',
    'estimado_alerta',
  ];
  expandedElement:any;
  expandedElement2:any;
  /*********************Resumen*************** */
  /*resumen de trazabilidad ->traceability_percentage*/
  traceability_percentage:Array<any> = [];
  dataSourceRT = new MatTableDataSource<Array<[]>>();
  displayedColumnsRT: string[] = [
    'c1',
    'c2',
    'c3',
    'c4'
  ];
  /*resumen de trazabilidad ->traceability_percentage*/
  /*tabla de alertas ->traceability_alert*/
  traceability_alert:Array<any> = [];
  dataSourceTA = new MatTableDataSource<Array<[]>>();
  displayedColumnsTA: string[] = [
    'actor_type',
    'traceability_registered',
    'registered_supply_base',
    'alerts',
    'action',
    'more'
  ];
  traceability_resume_:Array<any> = [];
  dataSourceResume = new MatTableDataSource<Array<[]>>();
  displayedColumnsResume: string[] = [
    'supplier_name',
    'actor_type2',
    'purchased_volume',
    'action',
    'more'
  ];
  /*tabla de alertas ->traceability_alert*/
  /*********************Resumen*************** */
  /***********charts********* */
  public barChartPlugins = [
    DataLabelsPlugin
  ];

  tempPercentage:any=null;
  
  //traceability_percentage: Array<any> = [];
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
      },
      y: {
        min: 0,
        max:100
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            let label = tooltipItem.dataset.label?.replace("%","");
            return label + " " + tooltipItem.formattedValue + "%";
          },
        },
      },
      datalabels: {
        formatter: (value, ctx) => {
          let percentage = value + "%";
          return percentage;
        },
        color: '#fff',
      }
    }
  };
 
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  //public barChartPlugins = [];
  display2=false;
  loading=false;
  label1:string = "";
  label2:string = "";
  label3:string = "";
  role: string = '';
  dataPor:any=undefined;
  public barChartData!: ChartConfiguration<'bar'>['data'] ;
  
  /***********charts********* */
  _open:string = "";
  _close:string = "";

  ID: number = 0;
  data: any = null;
  lang: any;
  options: google.maps.MapOptions;
  position: any;
  traceabilities: Array<any> = [];
  registers: Array<any> = [];
  traceability_resume: Array<any> = [];
  positionList: Array<any> = [];
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private apiService: ApiService,
    private loadEventService: EventService,
    private showMessage: ShowMessageService,
    private translate: TranslateService,
    public location: Location
  ) {
    
    this.options = {
      center: { lat: 4.6482837, lng: -74.2478938 },
      zoom: 6,
    };
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

  async ngOnInit() {
    await this.getPermissions();
    this.getDetail();
  }

  async getPermissions() {
    await this.storageService.get('keyData').then((resp: any) => {
      let ROLE: any = resp.role;
      this.role = ROLE.name;
    });
    
  }
  async getDetail() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      this.loadEventService.loadTableEvent.emit(true);
      const url = `supplybase/api/detail/${this.ID}/`;
      this.apiService.getResponse('GET', url).then(
        async (resp: any) => {
         // console.log('getDetail', resp)
          if (resp && resp.id) {
            this.data = resp;
            this.position = {
              lat: this.data.company.latitude,
              lng: this.data.company.longitude,
            };
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(this.position);
            let markerOptions: google.maps.MarkerOptions = {
              draggable: false,
              title: this.data.company.name,
              icon: './assets/images/icons1.png',
            };
            this.positionList.push({
              id: this.data.id,
              type: 'company',
              name: this.data.company.name,
              position: this.position,
              markerOptions: markerOptions,
              data: this.data.company,
              level: 1,
            });
            this._open = await this.translate.instant('open');
            this._close = await this.translate.instant('close');
            this.traceabilities = this.data.traceability;

            this.traceability_percentage = this.data.traceability_percentage;
            this.dataSourceRT = new MatTableDataSource<Array<[]>>(this.traceability_percentage);

            this.traceability_alert = this.data.traceability_alert;
            this.dataSourceTA = new MatTableDataSource<Array<[]>>(this.traceability_alert);



            this.setTraceabilityPercentage(this.traceability_percentage);
            // console.log("8000 this.traceability_percentage:",this.traceability_percentage);
            this.registers = this.data.registers;
            this.traceability_resume = this.data.traceability_resume;
            this.dataSource = new MatTableDataSource<traceabilityResumeI>(this.traceability_resume);
            this.traceability_resume_ = this.data.traceability;
            this.dataSourceResume = new MatTableDataSource<any>(this.traceability_resume_);

            //this.traceability_percentage = this.data.traceability_percentage

            // console.log('8000 traceability_resume:', this.traceability_resume);
            this.traceabilities.forEach((item, _i, _array) => {
              let markerOptions: google.maps.MarkerOptions = {
                draggable: false,
                title: item.supplier_name,
                icon: {
                  url: './assets/images/icons2.png',
                  scaledSize: new google.maps.Size(30, 30),
                },
              };
              let position = {
                lat: item.latitude,
                lng: item.longitude,
              };
              bounds.extend(position);
              this.positionList.push({
                id: item.id,
                type: 'traceability',
                name: item.supplier_name,
                position: position,
                markerOptions: markerOptions,
                data: item,
                level: 1,
              });
            });

            this.googleMap.fitBounds(bounds);
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

  getLang() {
    this.lang = JSON.parse(localStorage.getItem('lang')!);
  }

  markerCloseActive: any = null;
  setMarkerDataDafault(): markerDataInfoI {
    const markerDataDafault: markerDataInfoI = {
      marker_info: '',
      marker_type: '',
      marker_data: null,
      marker_level: 0,
    };
    return markerDataDafault;
  }
  markerDataInfo: markerDataInfoI = this.setMarkerDataDafault();

  resetMarkerDetail() {
    let positionList: any = this.positionList.filter((item) => {
      return item.level != 2;
    });
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(this.position);
    this.positionList = positionList;
    this.traceabilities.forEach((item, _i, _array) => {
      let position = {
        lat: item.latitude,
        lng: item.longitude,
      };
      bounds.extend(position);
      if (_i == _array.length - 1) {
        this.googleMap.fitBounds(bounds);
      }
    });
    this.data_pattern = null;
  }
  data_pattern: any = null;
  markerDetail(markerElem: MapMarker, item: any) {
    
    this.markerDataInfo = this.setMarkerDataDafault();
    if (item.level == 1) {
      this.resetMarkerDetail();
      this.data_pattern = item;
    } else {
    }
    let data: any = null;
    this.markerDataInfo.marker_type = item.type;
    if (item.level == 2) {
      data = this.positionList.filter((_data) => {
        return (
          _data.id == item.id && item.type != 'company' && _data.level == 2
        );
      });
      this.markerDataInfo.marker_info = data[0].data.supplier_name;
      this.markerDataInfo.marker_data = data[0].data;
      this.markerDataInfo.marker_type = item.type;
      this.markerDataInfo.marker_level = 2;

      this.info.open(markerElem);
      this.markerCloseActive = this.info.closeclick.subscribe(() => {
        this.markerDataInfo = this.setMarkerDataDafault();
        if (this.markerCloseActive) this.markerCloseActive.unsubscribe();
      });
      return;
    }

    if (this.markerCloseActive) this.markerCloseActive.unsubscribe();

    if (item.type == 'company') {
      data = this.positionList.filter((data) => {
        return data.id == item.id && item.type == 'company';
      });
      this.markerDataInfo.marker_info = data[0].name;
      this.markerDataInfo.marker_data = data[0].data;
      this.markerDataInfo.marker_type = item.type;
      this.markerDataInfo.marker_level = 1;
    } else {
      
      data = this.positionList.filter((data) => {
        return data.id == item.id && item.type != 'company' && data.level == 1;
      });
      
      this.markerDataInfo.marker_info = item.data.supplier_name;
      this.markerDataInfo.marker_data = item.data;
      this.markerDataInfo.marker_level = 1;
      this.markerDataInfo.marker_type = item.type;
      this.callLevel2();
    }

    this.info.open(markerElem);
    this.markerCloseActive = this.info.closeclick.subscribe(() => {
      this.markerDataInfo = this.setMarkerDataDafault();
      if (this.markerCloseActive) this.markerCloseActive.unsubscribe();
    });
  }
  callLevel2() {
    this.obtainSupplyBase();
  }
  showLevel2() {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(this.position);
    this.traceabilities.forEach((item, _i, _array) => {
      let position = {
        lat: item.latitude,
        lng: item.longitude,
      };
      bounds.extend(position);
    });
    if (this.supplyBaseL2List.data) {
      this.supplyBaseL2List.data.forEach((_item) => {
        let item: any = _item;
        let markerOptions: google.maps.MarkerOptions = {
          draggable: false,
          title: item.supplier_name,
          icon: {
            url: './assets/images/icons3.png',
            scaledSize: new google.maps.Size(30, 30),
          },
        };
        let position = {
          lat: item.latitude,
          lng: item.longitude,
        };
        bounds.extend(position);
        let data = {
          id: item.id,
          type: 'traceability',
          name: item.supplier_name,
          position: position,
          markerOptions: markerOptions,
          data: item,
          level: 2,
        };
        this.positionList.push(data);
      });
      this.googleMap.fitBounds(bounds);
      this.info.close();
    }
  }

  supplyBaseL2List = {
    id: 0,
    data: [],
  };
  async obtainSupplyBase() {
    let getToken: any;
    await this.storageService
      .get('dataInfoKey')
      .then((key) => (getToken = key));

    if (getToken) {
      let d = {
        company_id: this.markerDataInfo.marker_data.supplier_company_id,
        year: this.markerDataInfo.marker_data.year,
        period: this.markerDataInfo.marker_data.period,
      };
      this.loadEventService.loadTableEvent.emit(true);
      const url = `supplybase/api/obtainsupplybase/location/?company_id=${d.company_id}&year=${d.year}&period=${d.period}`;
      this.supplyBaseL2List = {
        id: 0,
        data: [],
      };
      this.apiService
        .getResponse('GET', url)
        .then(
          (resp: any) => {
            if (resp && resp.results && resp.results.length) {
              this.supplyBaseL2List = {
                id: d.company_id,
                data: resp.results[0].traceability,
              };
            }
          },
          (error) => {
            if (Array.isArray(error)) {
              error.forEach((element: any) => {
                /* this.showMessage.show(
                  'error',
                  this.translate.instant('attention'),
                  element,
                  'pi pi-exclamation-triangle'
                ); */
              });
            }
          }
        )
        .finally(() => {
          this.loadEventService.loadTableEvent.emit(false);
          this.loadEventService.loadEvent.emit(false);
        });
    }
  }

  editTraceability(id:any){
    let url = ``;
    if(this.role == "CLIENTE"){
      url = `/traceability/create-edit-tracebility/${id}`;
    }else{
      url = `traceability/create-edit-traceability-admin/${id}`;
    }
    
    this.router.navigate([url]);
  }



/***********charts********* */
  async setTraceabilityPercentage(traceability_percentage:any[]){
    this.label1 = await this.translate.instant('trazabilidad_reportada');
    this.label2 = await this.translate.instant('trazabilidad_validada');
    this.label3 = await this.translate.instant('trazabilidad_verificada');
    let colors = [
      {
        color: '#00a7b0'
      },
      {
        color: '#adadad'
      },
      {
        color: '#495995'
      }
    ];
    let colorIndex = 0;
    let datasets:Array<any> = [];
    for await(let data of traceability_percentage){
      let label:string = await this.translate.instant(Object.keys(data)[0]);
      let percentage = data[Object.keys(data)[0]];
      datasets.push(
        { data: [ percentage ], label: "% "+label, backgroundColor: colors[colorIndex].color }
      )
      colorIndex++;
      if(colorIndex == colors.length){
        colorIndex = 0;
      }
    }
    this.barChartData = {
      labels: [ 'H1' ],
      datasets: datasets
    };
    //this.chart?.update();
  }
/***********charts********* */
/*********************Resumen*************** */

/*********************Resumen*************** */

  editPorcent(id:any){
    this.dataPor  = this.registers.find(e => e.actor_type_id == id);
    if(this.dataPor){
      this.tempPercentage = this.dataPor.percentage*100;
      // percentage
      this.display2 = true;
    }
  }

  sendData(){
    this.loading = true;
    const sendData:any = {percentage: this.tempPercentage/100}
    // console.log('sendData', sendData)
    this.apiService.getResponse('PATCH', `supplybase/api/update/purchasedpercentage/${this.dataPor.id}/`, sendData).then((resp:any)=>{
      this.loading = false;
      this.closeDelete();
      this.loadEventService.loadEvent.emit(true);
      this.getDetail();
    }, (error)=>{
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
    })
  }

  closeDelete(){
    this.display2 = false;
    this.dataPor=null;
    this.tempPercentage=null
  }

  expand(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }  
  expand2(element: any) {
    this.expandedElement2 = this.expandedElement2 === element ? null : element;
  }
}
