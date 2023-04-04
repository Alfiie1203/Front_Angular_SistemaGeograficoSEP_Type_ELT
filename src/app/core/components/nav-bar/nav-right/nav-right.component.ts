import {Component, DoCheck, Input, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import { DattaConfig } from '../../../../app-config';
import { User } from '../../../interfaces/user';
import { EventService } from '../../../services/event.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('300ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({transform: 'translateX(100%)'}))
      ])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate('300ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({transform: 'translateX(-100%)'}))
      ])
    ])
  ]
})
export class NavRightComponent implements OnInit, DoCheck {
  
  @Input() dataUser!:User;

  public visibleUserList: boolean;
  public chatMessage: boolean;
  public friendId: boolean=<boolean>{};
  public dattaConfig: any;
  language:any;
  allLanguage:any[];

  constructor(
    private eventService: EventService,
    private translate: TranslateService
  ) {
    this.visibleUserList = false;
    this.chatMessage = false;
    this.dattaConfig = DattaConfig.config;
    this.allLanguage = [
      {name:'assets/images/esp.png', code: 'es'},
      {name:'assets/images/eng.png', code: 'en'},
      {name:'assets/images/bra.png', code: 'pt'}
    ]
  }

  ngOnInit() {
    this.getLanguage();
  }

  getLanguage(){
    if(localStorage.getItem('lang')){
      this.language = JSON.parse(localStorage.getItem('lang')!);
    }else{
      this.language = {
        name: 'assets/images/esp.png',
        code: 'es'
      }
      localStorage.setItem('lang', JSON.stringify(this.language))
    }
  }

  setLanguage(){
    localStorage.setItem('lang', JSON.stringify(this.language))
    this.translate.use(this.language.code);
    this.eventService.loadLanguage.emit();
    // if(this.translate.currentLang == 'es'){
    //   localStorage.setItem("lang", 'en');
    // }else{
    //   localStorage.setItem("lang", 'es');
    //   this.translate.use('es');
    // }
  }

  onChatToggle(friend_id:any) {
    this.friendId = friend_id;
    this.chatMessage = !this.chatMessage;
  }

  ngDoCheck() {
    if (document.querySelector('body')?.classList.contains('datta-rtl')) {
      this.dattaConfig['rtl-layout'] = true;
    } else {
      this.dattaConfig['rtl-layout'] = false;
    }
  }
}
