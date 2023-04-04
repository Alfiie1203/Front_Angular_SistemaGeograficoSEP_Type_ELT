import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit {

  visible = false;
  constructor(private loadEventService: EventService) {
    this.loadEventService.loadEvent.subscribe((show)=>{
      if(show)
        this.visible = true
      else
        this.visible=false;
    })
  }

  ngOnInit(): void {
  }

}
