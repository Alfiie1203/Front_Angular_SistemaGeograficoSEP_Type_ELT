import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ShowMessageService {

  constructor(
    private messageService: MessageService
  ) { }

  show(type: string, title: string, message: string, icon: string = ''){
    this.messageService.add({severity: type, summary: title, detail: message, icon: icon});
  }


}
