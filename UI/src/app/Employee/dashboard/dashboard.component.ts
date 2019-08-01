import { Component, OnInit, Input } from '@angular/core';
import { UserLeaveModel } from '../../models/user-leave-model'
import { UserLeaveService } from '../../services/user-leave.service'
import dayGridPlugin from '@fullcalendar/daygrid'



// import * as $ from 'jquery';
// import * as moment from 'moment';
// import 'fullcalendar';
declare var google: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    userLeave : UserLeaveModel

  chartData: any[];
  calendarPlugins = [dayGridPlugin];
  events: any[] = [
    { title: '', date: '2019-07-01', color: '#56EAEF', textColor: 'white' },
    { title: '', date: '2019-07-02', color: '#EF7B56', textColor:'white'  },
    { title: '', date: '2019-07-03', color: '#9D56EF', textColor:'white' },
    { title: '', date: '2019-08-01', color: '#EF7B56', textColor:'white'  },
    { title: '', date: '2019-08-03', color: '#9D56EF', textColor:'white' },
    { title: '', date: '2019-07-11', color: '#EF7B56', textColor:'white'  },
  ];
  apply: boolean = true;
  edit: boolean;
  request: boolean;
  employeeCode: any;

  constructor(private userLeaveService: UserLeaveService) { 
    this.userLeave = new UserLeaveModel
  }
    
//   @Input()
//   set configurations(config: any) {
//     if (config) {
//       this.defaultConfigurations = config;
//     }
//   }
//   @Input() eventData: any;

//   defaultConfigurations: any;
//   constructor() {
//     this.defaultConfigurations = {
//       editable: true,
//       eventLimit: true,
//       titleFormat: 'MMM D YYYY',
//       header: {
//         left: 'prev,next today',
//         center: 'title',
//         right: 'month,agendaWeek,agendaDay'
//       },
//       buttonText: {
//         today: 'Today',
//         month: 'Month',
//         week: 'Week',
//         day: 'Day'
//       },
//       views: {
//         agenda: {
//           eventLimit: 2
//         }
//       },
//       allDaySlot: false,
//       slotDuration: moment.duration('00:15:00'),
//       slotLabelInterval: moment.duration('01:00:00'),
//       firstDay: 1,
//       selectable: true,
//       selectHelper: true,
//       events: this.eventData,

//       dayClick: (date, jsEvent, activeView) => {
//         this.dayClick(date, jsEvent, activeView);
//      },
     
//      eventDragStart: (timeSheetEntry, jsEvent, ui, activeView) => {
//         this.eventDragStart(
//             timeSheetEntry, jsEvent, ui, activeView
//         );
//      },
// eventDragStop: (timeSheetEntry, jsEvent, ui, activeView) => {
//         this.eventDragStop(
//            timeSheetEntry, jsEvent, ui, activeView
//         );
//      },
//     };
//     this.eventData = [
//       {
//         title: 'event1',
//         start: new Date(2019,7,5, 0,0,0,0),
//         end: new Date(2019,7,5, 0,0,0,0)
//       },
//       {
//         title: 'event2',
//         start: moment().calendar,
//         end: moment().add(2, 'days')
//       },
//     ];
    
//   }
  ngOnInit() {
    this.userLeaveList()
    this.drawChart(this.chartData);
    // $('#full-calendar').fullCalendar(
    //   this.defaultConfigurations
    // );
  }
//   dayClick(date, jsEvent, activeView) {
//     console.log('day click');
//  }
//  eventDragStart(timeSheetEntry, jsEvent, ui, activeView) {
//     console.log('event drag start');
//  }
//  eventDragStop(timeSheetEntry, jsEvent, ui, activeView) {
//     console.log('event drag end');
//  }
  
 drawChart(chartData) {
  google.charts.load('current', { 'packages':['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var  chartData = [
        ['Leave Type','Count', { role: "style" }],
        ['CASUAL LEAVES',6, "#56EAEF"],
        ['EARNED LEAVES', 5, "#FDB45C"],
		['UNPAID LEAVES', 2, "#707070"],
		['COMP OFF', 1, "#949FB1"]
     ];
      // const val = ['CASUAL LEAVES', 5 ];
      // chartData.push(val);
  

    var data = google.visualization.arrayToDataTable(chartData);
    
     var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,
                       { calc: "stringify",
                         sourceColumn: 1,
                         type: "string",
                         role: "annotation" },
                       2]);
    var options = {
      width: 280,
      height: 280,
      bar: {groupWidth: "90%"},
      legend: { position: "none" },
      backgroundColor: '#f7f7f7'
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('myChart'));
    chart.draw(view, options);
  }
}

userLeaveList(){
  debugger;
  this.userLeaveService.userLeaveList().subscribe((response) => {
    console.log(response)
  }, (error) => {
    console.log(error);
  })
}

}
