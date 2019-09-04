import { Component, OnInit, Input } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid'

import { UserLeaveModel } from '../../models/user-leave-model'
import { UserLeaveService } from '../../services/user-leave.service'
import { UserModel } from '../../models/user-model';
import { UserDataService } from 'src/app/services/user-data.service';
import { HolidayModel } from '../../models/holiday-model';
import { HolidayService } from '../../services/holiday.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

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
  userLeave: UserLeaveModel
  user: UserModel;
  holiday: HolidayModel;
  holidayList = [];

  chartData: any[];
  calendarPlugins = [dayGridPlugin];
  events: any[] = [
    { title: '', date: '2019-07-01', color: '#56EAEF', textColor: 'white' },
    { title: '', date: '2019-07-02', color: '#EF7B56', textColor: 'white' },
    { title: '', date: '2019-07-03', color: '#9D56EF', textColor: 'white' },
    { title: '', date: '2019-08-01', color: '#EF7B56', textColor: 'white' },
    { title: '', date: '2019-08-03', color: '#9D56EF', textColor: 'white' },
    { title: '', date: '2019-07-11', color: '#EF7B56', textColor: 'white' },
  ];
  apply: boolean = true;
  edit: boolean;
  request: boolean;
  employeeCode: any;
  futureHoliday: any[];

  constructor(private userLeaveService: UserLeaveService, private router: Router, private userDataService: UserDataService, private holidayService: HolidayService,
    private datepipe: DatePipe) {
    userLeave: UserLeaveModel
    this.userLeave = new UserLeaveModel()
    this.user = new UserModel()
    this.holiday = new HolidayModel()
  }


  ngOnInit() {
    this.onLoadData();
    this.userLeaveList()
    this.drawChart(this.chartData);
    // $('#full-calendar').fullCalendar(
    //   this.defaultConfigurations
    // );
  }


  drawChart(chartData) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      var chartData = [
        ['Leave Type', 'Count', { role: "style" }],
        ['CASUAL LEAVES', 6, "#56EAEF"],
        ['EARNED LEAVES', 5, "#FDB45C"],
        ['UNPAID LEAVES', 2, "#707070"],
        ['COMP OFF', 1, "#949FB1"]
      ];
      // const val = ['CASUAL LEAVES', 5 ];
      // chartData.push(val);


      var data = google.visualization.arrayToDataTable(chartData);

      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,
        {
          calc: "stringify",
          sourceColumn: 1,
          type: "string",
          role: "annotation"
        },
        2]);
      var options = {
        width: 280,
        height: 280,
        bar: { groupWidth: "90%" },
        legend: { position: "none" },
        backgroundColor: '#f7f7f7'
      };

      const chart = new google.visualization.ColumnChart(document.getElementById('myChart'));
      chart.draw(view, options);
    }
  }

  onLoadData() {
    this.holidayService.getHolidays().subscribe((response) => {
      this.holidayList = JSON.parse(response["_body"]).holidays;
      var today = new Date();
      this.futureHoliday = this.holidayList.filter(p => new Date(p.date) >= new Date());
      console.log(this.futureHoliday)
    }, (error) => {
      console.log(error);
    })
  }


  userLeaveList() {
    debugger;
    this.userLeaveService.userLeaveList().subscribe((response) => {
      console.log(response)
    }, (error) => {
      console.log(error);
    })
  }

}
