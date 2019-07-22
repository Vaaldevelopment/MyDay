// import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
// import { CalendarModule, CalendarView, CalendarDateFormatter, CalendarViewPeriod } from 'angular-calendar';
// import { endOfPeriod, SchedulerEventTimesChangedEvent,  CalendarSchedulerEvent, CalendarSchedulerEventAction, SchedulerDateFormatter, SchedulerViewDay, SchedulerViewHour, SchedulerViewHourSegment } from 'angular-calendar-scheduler';
// import { Subject } from 'rxjs';
// import { endOfDay, addMonths } from 'date-fns';
// import { AppService } from '../app.service';

// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { extend, addClass } from '@syncfusion/ej2-base';
// import {
//   TimelineViewsService, AgendaService, GroupModel, EventSettingsModel, ResizeService, DragAndDropService
//   , ActionEventArgs, RenderCellEventArgs, EventRenderedArgs
// } from '@syncfusion/ej2-angular-schedule';
// import { timelineResourceData, resourceData } from './datasource';
import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid'
// import { Calendar, TimeGrid } from 'fullcalendar';
// import { ListView } from '@syncfusion/ej2-lists';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
//   styles: [`    
//     .timeline-resource-grouping.e-schedule:not(.e-device) .e-agenda-view .e-content-wrap table td:first-child {
//         width: 90px;
//     }
//     .timeline-resource-grouping.e-schedule .e-agenda-view .e-resource-column {
//         width: 100px;
//     }
//     .timeline-resource-grouping.e-schedule .e-timeline-month-view .e-work-days.project1,
// .timeline-resource-grouping.e-schedule .e-timeline-view .e-work-hours.project1 {
//     background-color: #faebd7;
// }

// .timeline-resource-grouping.e-schedule .e-timeline-month-view .e-work-days.project2,
// .timeline-resource-grouping.e-schedule .e-timeline-view .e-work-hours.project2 {
//     background-color: #deecfc;
// }

// .timeline-resource-grouping.e-schedule .e-timeline-month-view .e-work-days.project3,
// .timeline-resource-grouping.e-schedule .e-timeline-view .e-work-hours.project3 {
//     background-color: #deeeac;
// }
// .timeline-resource-grouping.e-schedule .e-timeline-month-view .e-work-days.project4,
// .timeline-resource-grouping.e-schedule .e-timeline-view .e-work-hours.project4 {
//     background-color: #faebd7;
// }
// .timeline-resource-grouping.e-schedule .e-timeline-month-view .e-work-days.project5,
// .timeline-resource-grouping.e-schedule .e-timeline-view .e-work-hours.project5 {
//    background-color: #deecfc;
// }
// .timeline-resource-grouping.e-schedule .e-timeline-month-view .e-work-days.project6,
// .timeline-resource-grouping.e-schedule .e-timeline-view .e-work-hours.project6 {
//     background-color: #deecfc;
// }

//     `],
//   encapsulation: ViewEncapsulation.None,
 
})
export class TeamViewComponent implements OnInit{

  calendarPlugins = [dayGridPlugin];
  events: any[] = [
    { title: 'Employee 1', date: '2019-07-01', color: '#56EAEF', textColor: 'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 4', date: '2019-07-05', color: '#56EAEF', textColor:'white' }
  ];

  ngOnInit(){
    // var teamCalendar = $('#calendar');
    // var calendar = new Calendar(teamCalendar,{
    //   header: { left: 'pre, next today',center: 'title', right:'month,agendaWeek,agendaDay' },
    //   events: [
    //       { title: 'Employee 1', date: '2019-07-01', color: '#56EAEF', textColor: 'white' },
    //       { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    //       { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    //       { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    //       { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    //       { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    //       { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    //       { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    //       { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    //       { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    //       { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    //       { title: 'Employee 4', date: '2019-07-05', color: '#56EAEF', textColor:'white' }
    //     ]
    // })
    // calendar.render();
  }

}
// export class TeamViewComponent {
//   onCreate(): void {
//     console.time('init');
//   }
//   onDataBinding(): void {
//     console.time('events render');
//   }
//   onDataBound(): void {
//     console.timeEnd('events render');
//     console.timeEnd('init');
//   }

//   onActionBegin(args: ActionEventArgs): void {
//     if (args.requestType === 'dateNavigate' || args.requestType === 'viewNavigate') {
//       console.time('init');
//       console.time('navigate');
//     }
//   }
//   onActionComplete(args: ActionEventArgs): void {
//     if (args.requestType === 'dateNavigate' || args.requestType === 'viewNavigate') {
//       console.timeEnd('navigate');
//     }
//   }
//   onRenderCell(args: RenderCellEventArgs): void {
//     if ((args.element.classList.contains('e-work-hours') || args.element.classList.contains('e-work-cells'))) {
//       addClass([args.element], ['resource', 'project1', 'project2', 'project3', 'resource', 'project4', 'project5', 'resource', 'project6'][parseInt(args.element.getAttribute('data-group-index'), 10)]);
//     }
//   }
//   public generateEventData(startDate: Date, endDate: Date, eventCount: number): Object[] {
//     let data: Object[] = [];
//     let names: string[] = [
//       'Bering Sea Gold', 'Technology', 'Maintenance', 'Meeting', 'Travelling', 'Annual Conference', 'Birthday Celebration',
//       'Farewell Celebration', 'Wedding Aniversary', 'Alaska: The Last Frontier', 'Deadest Catch', 'Sports Day',
//       'MoonShiners', 'Close Encounters', 'HighWay Thru Hell', 'Daily Planet', 'Cash Cab', 'Basketball Practice',
//       'Rugby Match', 'Guitar Class', 'Music Lessons', 'Doctor checkup', 'Brazil - Mexico', 'Opening ceremony', 'Final presentation'
//     ];
//     let msPerHour: number = 1000 * 60 * 60;
//     let id: number = 1;
//     let i: number = 1;
//     let j: number = 1;
//     let incMs: number = (msPerHour * 24) * 1;
//     let generate: Function = () => {
//       i++;
//       let start: number = startDate.getTime();
//       let end: number = endDate.getTime();
//       for (let a: number = start; a < end; a += incMs) {

//         let count: number = Math.floor((Math.random() * 9) + 1);
//         for (let b: number = 0; b < count; b++) {
//           j++;
//           let hour: number = Math.floor(Math.random() * 100) % 24;
//           let minutes: number = Math.round((Math.floor(Math.random() * 100) % 60) / 5) * 5;
//           let nCount: number = Math.floor(Math.random() * names.length);
//           let startDate: Date = new Date(new Date(a).setHours(hour, minutes));
//           let endDate: Date = new Date(startDate.getTime() + (msPerHour * 2.5));
//           data.push({
//             Id: id,
//             Subject: names[nCount],
//             StartTime: startDate,
//             EndTime: endDate,
//             IsAllDay: (id % 10) ? false : true,
//             ProjectId: i,
//             TaskId: j
//           });
//           if (data.length >= eventCount) {
//             return;
//           }
//           id++;
//           if (i > 3) { i = 1; } if (j > 6) { j = 1; }
//         }
//       }
//     }
//     while (data.length < eventCount) {
//       generate();
//     }
//     return data;
//   };


//   public selectedDate: Date = new Date(2019, 6, 10);
//   public currentView: string = "TimelineMonth";
//   public group: GroupModel = {

//     resources: ['Projects', 'Categories']
//   };
//   // public projectDataSource: Object[] = [
//   //   { text: 'Akhil Ben', id: 1, color: '#cb6bb2', HospitalGroupId: 1 },
//   //   { text: 'Akhil Raj', id: 2, color: '#56ca85', HospitalGroupId: 2 },
//   //   { text: 'Akhilesh Pn', id: 3, color: '#df5286', HospitalGroupId: 3 }
//   // ];
//   public categoryDataSource: Object[] = [
//     { text: 'Employee-1', id: 1, color: '#df5286', DoctorGroupId: 1, startHour: '09:00', endHour: '19:00' },
//     { text: 'Employee-2', id: 2, color: '#7fa900', DoctorGroupId: 1, startHour: '10:00', endHour: '16:00' },
//     { text: 'Employee-3', id: 3, color: '#7fa900', DoctorGroupId: 1, startHour: '07:00', endHour: '18:00' },
//     { text: 'Employee-4', id: 4, color: '#df5286', DoctorGroupId: 2, startHour: '02:00', endHour: '19:00' },
//     { text: 'Employee-5', id: 5, color: '#7fa900', DoctorGroupId: 2, startHour: '10:00', endHour: '15:00' },
//     { text: 'Employee-6', id: 6, color: '#7fa900', DoctorGroupId: 3, startHour: '06:00', endHour: '12:00' },
//   ];

//   public allowMultiple: Boolean = true;
//   public eventData: Object[] = this.generateEventData(new Date(2019, 6, 1), new Date(2019, 6, 31), 1000);


//   public eventSettings: EventSettingsModel = {
//     dataSource: <Object[]>extend([], this.eventData, null, true)
//   };
// }