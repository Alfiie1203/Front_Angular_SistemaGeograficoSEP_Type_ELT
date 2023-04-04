import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-load-table',
  templateUrl: './load-table.component.html',
  styleUrls: ['./load-table.component.scss']
})
export class LoadTableComponent implements OnInit {

  visible = false;
  constructor(private loadEventService: EventService) {
    this.loadEventService.loadTableEvent.subscribe((show)=>{
      if(show)
        this.visible = true
      else
        this.visible=false;
    })
  }

  ngOnInit(): void {
  }
}
