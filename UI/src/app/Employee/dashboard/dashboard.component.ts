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
import { flatten } from '@angular/core/src/render3/util';

// import * as $ from 'jquery';
// import * as moment from 'moment';
// import 'fullcalendar';
declare var google: any;
declare var $: any;


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
  applyLeaveData: any;
  leaveCountFlag = false;
  fromDatemessage: string;
  toDatemessage: string;
  // fromDateerrorMessage = false;
  // toDateerrorMessage = false;
  editLeaveFlag = false;
  updateLeaveData: any;
  chartData: any[];
  calendarPlugins = [dayGridPlugin];
  errorFlag = false;
  errorMessage: string;
  successFlag = false;
  userData: any;
  confirmationFlag = false;
  deleteLeaveId: any;
  cancelLeaveId: any;
  userLeaveList = [];
  successMessage: any;
  sandwichedFlag = false;
  changeLeaveStatusFlag = false;
  takenButtonFlag = false;
  bgRow_: any;


  events: any[] = [

    { title: 'A', date: '2019-07-01', color: '#56EAEF', textColor: 'white' },
    { title: 'R', date: '2019-07-02', color: '#EF7B56', textColor: 'white' },
    { title: 'C', date: '2019-07-03', color: '#9D56EF', textColor: 'white' },
    { title: 'R', date: '2019-09-01', color: '#EF7B56', textColor: 'white' },
    { title: 'C', date: '2019-09-03', color: '#9D56EF', textColor: 'white' },
    { title: 'R', date: '2019-07-11', color: '#EF7B56', textColor: 'white' },
    { title: 'C', date: '2019-09-08', color: '#9D56EF', textColor: 'white' },
    { title: '09:00 - 8', date: '2019-09-09', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 6.45', date: '2019-09-02', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 5', date: '2019-09-10', color: '#cccccc', textColor: 'red' },
    { title: '09:00 - 5.30', date: '2019-09-04', color: '#cccccc', textColor: 'red' },

    { title: '09:00 - 8', date: '2019-09-05', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-06', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-07', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-11', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-12', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-13', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-14', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-15', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-16', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-17', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-18', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-19', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-20', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-21', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-22', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-23', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-24', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-25', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-26', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-27', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-28', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-29', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-30', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-09-31', color: '#cccccc', textColor: 'black' },


    { title: '09:00 - 8', date: '2019-07-09', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-08', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-10', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-04', color: '#cccccc', textColor: 'black' },
    { title: '09:00 - 8', date: '2019-07-05', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-06', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-07', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-12', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-13', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-14', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-15', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-16', color: '#cccccc', textColor: 'black' },
    { title: '09:00 - 8', date: '2019-07-17', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-18', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-19', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-20', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-21', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-22', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-23', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-24', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-25', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-26', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-27', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-28', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-29', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-30', color: '#cccccc', textColor: 'black' },

    { title: '09:00 - 8', date: '2019-07-31', color: '#cccccc', textColor: 'black' },

  ];

  apply: boolean = true;
  edit: boolean;
  request: boolean;
  employeeCode: any;
  futureHoliday: any[];
  managerSelectedUserId: any
  addNoteFlag = false;
  today = new Date();

  constructor(private userLeaveService: UserLeaveService, private router: Router, private userDataService: UserDataService, private holidayService: HolidayService,
    private datepipe: DatePipe) {
    userLeave: UserLeaveModel
    this.userLeave = new UserLeaveModel()
    this.user = new UserModel()
    this.holiday = new HolidayModel()
  }


  ngOnInit() {
    this.onLoadData();
    this.managerSelectedUserId = localStorage.getItem('selectedEmpId')
    if (this.managerSelectedUserId) {
      this.changeLeaveStatusFlag = true;
      this.getManagerSelectedUser();
    }
    else {
      this.getUserLeaveList();
      this.getCalculateTotalLeaveBalance();
    }
    // $('#full-calendar').fullCalendar(
    //   this.defaultConfigurations
    // );
  }


  drawChart(chartData) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    var casualLeaveData = this.userLeave.consumeCL;
    var earnedLeaveData = this.userLeave.consumeEL;

    function drawChart() {
      var chartData = [
        ['Leave Type', 'Count', { role: "style" }],
        ['CASUAL LEAVES', casualLeaveData, "#56EAEF"],
        ['EARNED LEAVES', earnedLeaveData, "#FDB45C"]
        // ['UNPAID LEAVES', 2, "#707070"],
        // ['COMP OFF', 1, "#949FB1"]
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
        width: 200,
        height: 238,
        bar: { groupWidth: "90%" },
        legend: { position: "none" },
        backgroundColor: '#f7f7f7'
      };

      const chart = new google.visualization.ColumnChart(document.getElementById('myChart'));
      chart.draw(view, options);
    }

    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawTimeChart);

    function drawTimeChart() {
      var data = google.visualization.arrayToDataTable([
        ['Date', 'Time'],
        ['1', 6],
        ['2', 6.45],
        ['3', 9],
        ['4', 9.10],
        ['5', 6],
        ['6', 6.45],
        ['7', 9],
        ['8', 9.10],
        ['9', 6],
        ['10', 6.45],
        ['11', 9],
        ['12', 9.10],
        ['13', 6],
        ['14', 6.45],
        ['15', 9],
        ['16', 9.10],
        ['17', 6],
        ['18', 6.45],
        ['19', 9],
        ['20', 9.10],
        ['21', 6],
        ['22', 6.45],
        ['23', 9],
        ['24', 9.10],
        ['25', 6],
        ['26', 6.45],
        ['27', 9],
        ['28', 9.10],
        ['29', 6],
        ['30', 6.45],
        ['31', 9],
      ]);

      var options = {
        title: 'Company Performance',
        hAxis: { title: 'Date', titleTextStyle: { color: '#333' } },
        vAxis: { minValue: 0 }
      };

      var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
      chart.draw(data, options);
    }
  }

  onLoadData() {
    this.holidayService.getHolidays().subscribe((response) => {
      this.holidayList = JSON.parse(response["_body"]).holidays;
      var today = new Date();
      this.futureHoliday = this.holidayList.filter(p => new Date(p.date) >= new Date());
    }, (error) => {
    })
    this.checkleaveSpan();
  }

  getUserLeaveList() {
    this.userLeaveService.getUserLeaveList().subscribe((response) => {
      this.userLeaveList = JSON.parse(response["_body"]).leaveList;
      this.userData = JSON.parse(response["_body"]).userData;
    }, (error) => {
    })
  }

  checkSelectedDate() {
    this.errorFlag = false;
    if (new Date(this.userLeave.fromDate) < new Date()) {
      this.errorFlag = true;
      this.errorMessage = 'Selected date is past date';
      //return;
    }
    if (new Date(this.userLeave.toDate) < new Date(this.userLeave.fromDate)) {
      this.errorFlag = true;
      this.errorMessage = 'Can not apply leave, selected to date is previous date than from date'
      return;
    }

    var fromDay = new Date(this.userLeave.fromDate).getDay()
    var toDay = new Date(this.userLeave.toDate).getDay()

    if ((fromDay === 6) || (fromDay === 0)) {
      this.errorFlag = true;
      this.errorMessage = 'Can not apply leave, selected date is weekend date';
      return;
    }
    if ((toDay === 6) || (toDay === 0)) {
      this.errorFlag = true;
      this.errorMessage = 'Can not apply leave, selected date is weekend date'
      return;
    }

  }
  checkHolidayDate() {
    this.errorFlag = false;
    this.checkSelectedDate();
    this.userLeaveService.checkHoliday(this.userLeave).subscribe((response) => {
      this.userLeave.leaveCount = JSON.parse(response["_body"]).leaveSpan;
      if (this.userLeave.leaveCount > 7) {
        $('#sandwiched-popup').modal('show');
      }
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  getCalculateTotalLeaveBalance() {
    this.userLeaveService.calculateTotalLeaveBalance(this.userLeave).subscribe((response) => {
      this.userLeave.leaveBalance = JSON.parse(response["_body"]).calTotalLeaveBalance;
      this.userLeave.consumeCL = JSON.parse(response["_body"]).consumeCL;
      this.userLeave.consumeEL = JSON.parse(response["_body"]).consumeEL;
      this.drawChart(this.chartData);
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  checkleaveSpan() {
    this.errorFlag = false;
    this.checkSelectedDate();
    this.getCalculateTotalLeaveBalance();
    this.userLeaveService.checkUserLeaveSpan(this.userLeave).subscribe((response) => {
      this.leaveCountFlag = true;
      this.userLeave.leaveCount = JSON.parse(response["_body"]).leaveSpan[0];
      // this.userLeave.leaveBalance = JSON.parse(response["_body"]).leaveSpan[1];
      if (this.userLeave.leaveCount > 7) {
        $('#sandwiched-popup').modal('show');
      }
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  settabindex() {
    document.getElementById("reason").focus();
    document.getElementById("openModalButton").click();
  }
  applyLeave() {
    this.errorFlag = false;
    this.successFlag = false;
    this.userLeaveService.applyUserLeave(this.userLeave).subscribe((response) => {
      this.applyLeaveData = JSON.parse(response["_body"]).Data;
      this.printSuccessMessage('Leave Applied Successfully')
      this.userLeave = new UserLeaveModel();
      this.leaveCountFlag = false;
      this.getUserLeaveList();
      this.checkleaveSpan();
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  editLeave(editLeaveData) {
    this.editLeaveFlag = true;
    this.userLeave.fromDate = this.datepipe.transform(editLeaveData.fromDate, "yyyy-MM-dd");
    this.userLeave.toDate = this.datepipe.transform(editLeaveData.toDate, "yyyy-MM-dd");
    this.userLeave.reason = editLeaveData.reason;
    this.userLeave.leaveCount = editLeaveData.leaveCount;
    this.userLeave.id = editLeaveData._id;
  }

  updateLeave() {
    this.errorFlag = false;
    this.successFlag = false;
    this.userLeaveService.updateUserLeave(this.userLeave).subscribe((response) => {
      this.updateLeaveData = JSON.parse(response["_body"]).Data;
      this.printSuccessMessage('Leave Updated Successfully')
      this.userLeave = new UserLeaveModel();
      this.editLeaveFlag = false;
      this.getUserLeaveList();
      this.checkleaveSpan();
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  backToApplyLeave() {
    this.editLeaveFlag = false;
  }
  // deleteLeave(leave) {
  //   this.errorFlag = false;
  //   this.successFlag = false;
  //   this.confirmationFlag = true;
  //   this.deleteLeaveId = leave._id;
  // }
  // confirmDeleteLeave() {
  //   this.successFlag = false;
  //   this.userLeaveService.deleteUserLeave(this.deleteLeaveId).subscribe((response) => {
  //     this.printSuccessMessage('Leave Deleted Successfully')
  //     this.confirmationFlag = false;
  //     this.userLeave = new UserLeaveModel();
  //     this.getUserLeaveList();
  //   }, (error) => {
  //     this.errorFlag = true;
  //     this.errorMessage = error._body;
  //   })
  // }
  // cancleDeleteLeave() {
  //   this.confirmationFlag = false;
  // }
  cancelLeave(leave) {
    this.errorFlag = false;
    this.successFlag = false;
    this.confirmationFlag = true;
    this.cancelLeaveId = leave._id;
  }
  confirmCancelLeave() {
    this.successFlag = false;
    this.userLeaveService.cancelUserLeave(this.cancelLeaveId).subscribe((response) => {
      this.printSuccessMessage('Leave Cancelled Successfully')
      this.confirmationFlag = false;
      this.userLeave = new UserLeaveModel();
      this.getUserLeaveList();
      this.getCalculateTotalLeaveBalance();
      this.drawChart(this.chartData);
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  cancleCancelLeave() {
    this.confirmationFlag = false;
  }

  getManagerSelectedUser() {
    this.userLeaveService.getReportedEmpData(this.managerSelectedUserId).subscribe((response) => {
      this.userLeaveList = JSON.parse(response["_body"]).leaveList;
      this.userData = JSON.parse(response["_body"]).userData;
      this.userLeave.leaveBalance = JSON.parse(response["_body"]).calTotalLeaveBalance;
      this.userLeave.consumeCL = JSON.parse(response["_body"]).consumeCL;
      this.userLeave.consumeEL = JSON.parse(response["_body"]).consumeEL;
      this.drawChart(this.chartData);
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  editLeaveStatus(leaveData) {
    this.takenButtonFlag = false;
    this.userLeave.fromDate = this.datepipe.transform(leaveData.fromDate, "yyyy-MM-dd");
    this.userLeave.toDate = this.datepipe.transform(leaveData.toDate, "yyyy-MM-dd");
    this.userLeave.reason = leaveData.reason;
    this.userLeave.leaveCount = leaveData.leaveCount;
    this.userLeave.id = leaveData._id;
    this.userLeave.managerNote = leaveData.managerNote;
    if (leaveData.managerNote) {
      this.addNoteFlag = true
    }
    if (leaveData.leaveStatus == "Pending" && new Date(leaveData.fromDate) < new Date() && new Date(leaveData.toDate) < new Date()) {
      this.takenButtonFlag = true;
    }
    if (leaveData.leaveStatus == "Taken") {
      this.takenButtonFlag = true;
    }
  }

  changeLeaveStatus() {
    this.successFlag = true;
    console.log(this.userLeave)
    this.userLeaveService.updateLeaveStatus(this.userLeave).subscribe((response) => {
      this.userLeave = JSON.parse(response["_body"]).leaveStatus;
      console.log(this.userLeave)
      this.userLeave = new UserLeaveModel();
      this.addNoteFlag = false;
      this.printSuccessMessage('Changed Leave Status Successfully')
      debugger
      this.getManagerSelectedUser();
      this.drawChart(this.chartData);
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  approvedLeave() {
    this.userLeave.leaveStatus = 'Approved'
  }
  rejectLeave() {
    this.userLeave.leaveStatus = 'Rejected'
  }
  takenLeave() {
    this.userLeave.leaveStatus = 'Taken'
  }
  printSuccessMessage(message) {
    this.successFlag = true;
    this.successMessage = message;
    setTimeout(function () {
      $(".myAlert-top").hide();
    }, 3000);
  }
}
