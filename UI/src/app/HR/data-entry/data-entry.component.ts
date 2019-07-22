import { Component, OnInit, Input } from '@angular/core';
// import { OptionsInput } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { CalendarComponent } from '@fullcalendar/angular';
import * as $ from 'jquery';
import * as moment from 'moment';
import 'fullcalendar';

@Component({
  selector: 'app-data-entry',
  templateUrl: './data-entry.component.html',
  styleUrls: ['./data-entry.component.scss']
})
export class DataEntryComponent implements OnInit {

  @Input()
  set configurations(config: any) {
    if (config) {
      this.defaultConfigurations = config;
    }
  }
  @Input() eventData: any;

  defaultConfigurations: any;
  constructor() {
    this.defaultConfigurations = {
      editable: true,
      eventLimit: true,
      titleFormat: 'MMM D YYYY',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      buttonText: {
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day'
      },
      views: {
        agenda: {
          eventLimit: 2
        }
      },
      allDaySlot: false,
      slotDuration: moment.duration('00:15:00'),
      slotLabelInterval: moment.duration('01:00:00'),
      firstDay: 1,
      selectable: true,
      selectHelper: true,
      events: this.eventData,

      dayClick: (date, jsEvent, activeView) => {
        this.dayClick(date, jsEvent, activeView);
     },
     
     eventDragStart: (timeSheetEntry, jsEvent, ui, activeView) => {
        this.eventDragStart(
            timeSheetEntry, jsEvent, ui, activeView
        );
     },
eventDragStop: (timeSheetEntry, jsEvent, ui, activeView) => {
        this.eventDragStop(
           timeSheetEntry, jsEvent, ui, activeView
        );
     },
    };
    this.eventData = [
      {
        title: 'event1',
        start: new Date()
      },
      {
        title: 'event2',
        start: moment().calendar,
        end: moment().add(2, 'days')
      },
    ];
    
  }
  ngOnInit() {
    $('#full-calendar').fullCalendar(
      this.defaultConfigurations
    );
  }
  dayClick(date, jsEvent, activeView) {
    console.log('day click');
 }
 eventDragStart(timeSheetEntry, jsEvent, ui, activeView) {
    console.log('event drag start');
 }
 eventDragStop(timeSheetEntry, jsEvent, ui, activeView) {
    console.log('event drag end');
 }
}
