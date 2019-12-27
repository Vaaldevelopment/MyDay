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
import { AttendanceModel } from '../../models/attendance-model';
import { AttendanceService } from '../../services/attendance.service';
import { LeavedataService } from '../../services/leavedata.service';

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
  userLeave: UserLeaveModel;
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
  attendance: AttendanceModel;
  attendanceList = [];
  changeLeaveStatusFlag = false;
  takenButtonFlag = false;
  events = [];
  apply: boolean = true;
  edit: boolean;
  request: boolean;
  employeeCode: any;
  futureHoliday: any[];
  managerSelectedUserId: any
  addNoteFlag = false;
  today = new Date();
  userID: any;
  highlightLeaveId: any;
  minDate: any;
  maxDate: any;
  RepUserName: string;
  disableButton = false;
  currentYear = new Date().getFullYear()
  setCancelFlag = false
  showLeaveListFlag = false;

  constructor(private userLeaveService: UserLeaveService, private router: Router, private userDataService: UserDataService, private holidayService: HolidayService, private attendanceService: AttendanceService, private datepipe: DatePipe, private leavedataService: LeavedataService) {
    userLeave: UserLeaveModel
    this.userLeave = new UserLeaveModel()
    this.user = new UserModel()
    this.holiday = new HolidayModel()
    this.attendance = new AttendanceModel()
  }
  ngOnDestroy() {
    $('#dashboard').removeClass('active-nav');
  }

  ngOnInit() {
    $('#dashboard').addClass('active-nav');
    $('#login,#team-view,#notification,#login-change,#add-employee,#compoff,#policy').removeClass('active-nav');
    this.RepUserName = sessionStorage.getItem('RepUserName');
    var date = new Date(), y = date.getFullYear()
    var tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    if (sessionStorage.getItem('requestedBy') == null) {
      this.minDate = this.datepipe.transform(tenDays, 'yyyy-MM-dd')
    } else {
      let last6month = date.setMonth(date.getMonth() - 6);
      this.minDate = this.datepipe.transform(last6month, 'yyyy-MM-dd')
    }
    let next3month = date.setMonth(date.getMonth() + 3);
    this.maxDate = this.datepipe.transform(next3month, 'yyyy-MM-dd')
    this.userLeave.fromSpan = 'FULL DAY';
    this.userLeave.toSpan = 'FULL DAY';
    this.onLoadData();
    this.highlightLeaveId = sessionStorage.getItem('notificationIdHighlight')
    // if (this.highlightLeaveId) {
    //   var elmnt = <HTMLInputElement>document.getElementById('highlight')
    //   elmnt.scrollIntoView();
    // }

    this.managerSelectedUserId = sessionStorage.getItem('selectedEmpId')
    this.userID = sessionStorage.getItem('userID')
    if (this.managerSelectedUserId) {
      this.changeLeaveStatusFlag = true;
      if (this.managerSelectedUserId == this.userID) {
        this.changeLeaveStatusFlag = false;
      }
      this.getManagerSelectedUser();
    }
    else {
      this.getUserLeaveList();
      this.getCalculateTotalLeaveBalance();
    }
    if (sessionStorage.getItem('requestedBy')) {
      this.changeLeaveStatusFlag = false;
    }
    // $('#full-calendar').fullCalendar(
    //   this.defaultConfigurations

    // );
  }

  drawTimeChart(attendanceList) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawTimeChart);

    function drawTimeChart() {
      var data = [];
      var header = ['date', 'time'];
      data.push(header);

      if (attendanceList.length == 0) {
        var temp = [];
        temp.push(new Date(0, 0, 0));
        temp.push(0);
        data.push(temp);
      }
      for (var i = 0; i < attendanceList.length; i++) {
        var temp = [];
        var date = new Date(attendanceList[i].inDate.substring(0, 10));
        temp.push(date);

        var inTime = parseInt(attendanceList[i].inTime);
        var outTime = parseInt(attendanceList[i].outTime);

        var inMinutes = inTime % 100;
        var inHours = Math.floor(inTime / 100);

        var outMinutes = outTime % 100;
        var outHours = Math.floor(outTime / 100);

        var completedHours = ((outHours * 60 + outMinutes) - (inHours * 60 + inMinutes)) / 60;
        temp.push(completedHours);

        data.push(temp);
      }


      var chartData = new google.visualization.arrayToDataTable(data);

      var options = {
        title: 'Hours Completed',
        hAxis: { format: 'MMM dd', title: 'Date', titleTextStyle: { color: '#000' } },
        vAxis: { minValue: 0 }
      };

      var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
      chart.draw(chartData, options);
    }
  }


  drawChart(chartData) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    var casualLeaveData = this.userLeave.consumeCL;
    var earnedLeaveData = this.userLeave.consumeEL;

    function drawChart() {
      var chartData = [
        ['Leave Type', 'Count', { role: 'style' }],
        ['CASUAL LEAVES', casualLeaveData, '#56EAEF'],
        ['EARNED LEAVES', earnedLeaveData, '#FDB45C']
        // ['UNPAID LEAVES', 2, '#707070'],
        // ['COMP OFF', 1, '#949FB1']
      ];
      // const val = ['CASUAL LEAVES', 5 ];
      // chartData.push(val);

      var data = google.visualization.arrayToDataTable(chartData);
      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,

        {
          calc: 'stringify',
          sourceColumn: 1,
          type: 'string',
          role: 'annotation'
        },
        2]);
      var options = {
        width: 200,
        height: 420,
        bar: { groupWidth: '90%' },
        legend: { position: 'none' },
        backgroundColor: '#f7f7f7'
      };

      const chart = new google.visualization.ColumnChart(document.getElementById('myChart'));
      chart.draw(view, options);
    }
  }

  showLeaveList() {
    this.showLeaveListFlag = true;
  }
  onLoadData() {
    this.holidayService.getHolidays().subscribe((response) => {
      this.holidayList = JSON.parse(response['_body']).holidays;
      var today = new Date();
      this.futureHoliday = this.holidayList.filter(p => new Date(p.date) >= new Date());
    }, (error) => {
    })
    this.checkleaveSpan();

    //Get Attendance
    this.attendanceService.getAttendance().subscribe((response) => {
      this.attendanceList = JSON.parse(response['_body']).attendance;
      this.drawTimeChart(this.attendanceList);
    }, (error) => {

    })

    this.leavedataService.getEmployeeLeaveData(this.currentYear, sessionStorage.getItem('userID')).subscribe((response) => {
      var userDeafaultLeave = JSON.parse(response["_body"]).empLeaveData[0]
      this.userLeave.EL = userDeafaultLeave.earnedLeave
      this.userLeave.CL = userDeafaultLeave.casualLeave
      this.userLeave.compOff = userDeafaultLeave.compOffLeave
    }, (error) => {

    })
  }

  getUserLeaveList() {
    this.userLeaveService.getUserLeaveList().subscribe((response) => {
      this.userLeaveList = JSON.parse(response['_body']).leaveList;
      for (let i = 0; i < this.userLeaveList.length; i++) {
        if (new Date(this.userLeaveList[i].fromDate) > new Date()) {
          this.userLeaveList[i].cancelFlag = true;
        }
      }
      this.userData = JSON.parse(response['_body']).userData;

      this.bindCalendar();

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
      this.errorMessage = 'Can not apply leave, selected date is weekend date';
      return;
    }

    var fromDateYear = new Date(this.userLeave.fromDate).getFullYear();
    var toDateYear = new Date(this.userLeave.toDate).getFullYear();
    if (fromDateYear && toDateYear) {
      if (fromDateYear !== toDateYear) {
        this.errorFlag = true;
        this.errorMessage = 'Can not apply leave for diffrent year, add seperate leave';
        return;
      }
    }

    if (this.userLeave.fromSpan && this.userLeave.toSpan && (new Date(this.userLeave.fromDate).getTime() == new Date(this.userLeave.toDate).getTime())) {
      if (this.userLeave.fromSpan !== this.userLeave.toSpan) {
        this.errorFlag = true;
        this.errorMessage = 'Can not apply leave, leave span should be same for single date';
        return;
      }
    }
  }
  checkHolidayDate() {
    this.errorFlag = false;
    this.checkSelectedDate();
    this.userLeaveService.checkHoliday(this.userLeave).subscribe((response) => {
      this.userLeave.leaveCount = JSON.parse(response['_body']).leaveSpan;
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
      this.userLeave.leaveBalance = JSON.parse(response['_body']).calTotalLeaveBalance;
      this.userLeave.consumeCL = JSON.parse(response['_body']).consumeCL;
      this.userLeave.consumeEL = JSON.parse(response['_body']).consumeEL;
      this.userLeave.futureLeave = JSON.parse(response['_body']).totalFutureLeave;
      // this.drawChart(this.chartData);
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
      this.userLeave.leaveCount = JSON.parse(response['_body']).leaveSpan[0];
      // this.userLeave.leaveBalance = JSON.parse(response['_body']).leaveSpan[1];
      if (this.userLeave.leaveCount > 7) {
        $('#sandwiched-popup').modal('show');
      }
    }, (error) => {
      this.errorFlag = true;
      // $('.toast').toast('show');
      // this.errorMessage = error._body;
      this.errorMessage = error._body;
    })
  }

  settabindex() {
    document.getElementById('reason').focus();
    document.getElementById('openModalButton').click();
  }
  applyLeave() {
    this.disableButton = true;
    this.errorFlag = false;
    this.successFlag = false;
    if (sessionStorage.getItem('requestedBy') == sessionStorage.getItem('userID')) {
      this.userLeave.requestedBy = '';
    } else if (sessionStorage.getItem('requestedBy') !== null) {
      this.userLeave.requestedBy = sessionStorage.getItem('requestedBy')
    }
    this.userLeaveService.applyUserLeave(this.userLeave).subscribe((response) => {
      this.applyLeaveData = JSON.parse(response['_body']).Data;
      this.printSuccessMessage('Leave Applied Successfully')
      this.userLeave = new UserLeaveModel();
      this.leaveCountFlag = false;
      this.getUserLeaveList();
      this.checkleaveSpan();
      $('#exampleModal3').modal('hide');
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  editLeave(editLeaveData) {
    this.editLeaveFlag = true;
    this.userLeave.fromDate = this.datepipe.transform(editLeaveData.fromDate, 'yyyy-MM-dd');
    this.userLeave.toDate = this.datepipe.transform(editLeaveData.toDate, 'yyyy-MM-dd');
    this.userLeave.reason = editLeaveData.reason;
    this.userLeave.leaveCount = editLeaveData.leaveCount;
    this.userLeave.id = editLeaveData._id;
    this.userLeave.fromSpan = editLeaveData.fromSpan;
    this.userLeave.toSpan = editLeaveData.toSpan;
    this.userLeave.leaveStatus = editLeaveData.leaveStatus;
    this.setCancelFlag = editLeaveData.cancelFlag;
  }

  updateLeave() {
    this.errorFlag = false;
    this.successFlag = false;
    this.userLeaveService.updateUserLeave(this.userLeave).subscribe((response) => {
      this.updateLeaveData = JSON.parse(response['_body']).Data;
      this.printSuccessMessage('Leave Updated Successfully');
      this.userLeave = new UserLeaveModel();
      this.editLeaveFlag = false;
      this.getUserLeaveList();
      this.checkleaveSpan();
      $('#exampleModal3').modal('hide');
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  backToApplyLeave() {
    this.editLeaveFlag = false;
    $('#exampleModal3').modal('hide');
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
    //this.confirmationFlag = true;
    this.cancelLeaveId = leave.id;
    let iscancel = confirm('Are you sure to cancel leave');
    if (iscancel) {
      this.confirmCancelLeave()
    } else {
      $('#exampleModal3').modal('hide');
    }
  }
  confirmCancelLeave() {
    this.successFlag = false;
    this.userLeaveService.cancelUserLeave(this.cancelLeaveId).subscribe((response) => {
      this.printSuccessMessage('Leave Cancelled Successfully');
      this.confirmationFlag = false;
      this.userLeave = new UserLeaveModel();
      this.getUserLeaveList();
      this.getCalculateTotalLeaveBalance();
      $('#exampleModal3').modal('hide');
      // this.drawChart(this.chartData);
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  // cancleCancelLeave() {
  //   this.confirmationFlag = false;
  // }

  getManagerSelectedUser() {
    this.userLeaveService.getReportedEmpData(this.managerSelectedUserId).subscribe((response) => {
      this.userLeaveList = JSON.parse(response['_body']).leaveList;
      this.userData = JSON.parse(response['_body']).userData;
      this.userLeave.leaveBalance = JSON.parse(response['_body']).calTotalLeaveBalance;
      this.userLeave.consumeCL = JSON.parse(response['_body']).consumeCL;
      this.userLeave.consumeEL = JSON.parse(response['_body']).consumeEL;
      this.userLeave.futureLeave = JSON.parse(response['_body']).totalFutureLeave;
      // this.drawChart(this.chartData);
      this.bindCalendar();
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })

    //Get Attendance
    this.attendanceService.getReportedEmpAttendance(this.managerSelectedUserId).subscribe((response) => {
      this.attendanceList = JSON.parse(response['_body']).attendance;
      this.drawTimeChart(this.attendanceList);
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  editLeaveStatus(leaveData) {
    this.takenButtonFlag = false;
    this.userLeave.fromDate = this.datepipe.transform(leaveData.fromDate, 'yyyy-MM-dd');
    this.userLeave.toDate = this.datepipe.transform(leaveData.toDate, 'yyyy-MM-dd');
    this.userLeave.reason = leaveData.reason;
    this.userLeave.leaveCount = leaveData.leaveCount;
    this.userLeave.id = leaveData._id;
    this.userLeave.managerNote = leaveData.managerNote;
    this.userLeave.fromSpan = leaveData.fromSpan;
    this.userLeave.toSpan = leaveData.toSpan;
    if (leaveData.managerNote) {
      this.addNoteFlag = true
    }
    if ((leaveData.leaveStatus == 'Pending' || leaveData.leaveStatus == 'Rejected') && new Date(leaveData.fromDate) < new Date() && new Date(leaveData.toDate) < new Date()) {
      this.takenButtonFlag = true;
    }
    if (leaveData.leaveStatus == 'Rejected Taken' || leaveData.leaveStatus == 'Approved Taken') {
      this.takenButtonFlag = true;
    }
  }

  changeLeaveStatus() {
    this.successFlag = true;
    this.userLeaveService.updateLeaveStatus(this.userLeave).subscribe((response) => {
      this.userLeave = JSON.parse(response['_body']).leaveStatus;
      this.userLeave = new UserLeaveModel();
      this.addNoteFlag = false;
      this.printSuccessMessage('Changed Leave Status Successfully')
      this.getManagerSelectedUser();
      // this.drawChart(this.chartData);
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  approvedLeave() {
    this.userLeave.leaveStatus = 'Approved'
    sessionStorage.removeItem('notificationIdHighlight');
    this.highlightLeaveId = '';
  }
  rejectLeave() {
    this.userLeave.leaveStatus = 'Rejected';
  }
  takenLeave(status) {
    debugger
    if (status == 'ApprovedTaken') {
      this.userLeave.leaveStatus = 'Approved Taken';
    } else if (status == 'RejectedTaken') {
      this.userLeave.leaveStatus = 'Rejected Taken';
    }

  }
  printSuccessMessage(message) {
    this.successFlag = true;
    this.successMessage = message;
    setTimeout(function () {
      $('.myAlert-top').hide();
    }, 3000);
  }

  bindCalendar() {
    this.events = [];

    //Binding Attendance
    for (let i = 0; i < this.attendanceList.length; i++) {

      var inTime = parseInt(this.attendanceList[i].inTime);
      var outTime = parseInt(this.attendanceList[i].outTime);

      var inMinutes = inTime % 100;
      var inHours = Math.floor(inTime / 100);

      var outMinutes = outTime % 100;
      var outHours = Math.floor(outTime / 100);

      var completedHours = ((outHours * 60 + outMinutes) - (inHours * 60 + inMinutes)) / 60;

      var textColor = completedHours < 9 ? 'red' : 'black';

      this.events.push({
        title: inHours + ':' + inMinutes + ' - ' + outHours + ':' + outMinutes,
        date: new Date(this.attendanceList[i].inDate.substring(0, 10)),
        color: '#cccccc',
        textColor: textColor
      });
    }
    //Binding Leaves

    for (let i = 0; i < this.userLeaveList.length; i++) {

      var eventColor: any;
      var dates = [];
      var className = 'fullDay';
      var started = false;
      this.userLeaveService.getLeaveDates(this.userLeaveList[i]).subscribe((response) => {
        dates = JSON.parse(response['_body']).leaveDates;

        if ((this.userLeaveList[i].fromSpan == 'FIRST HALF') || (this.userLeaveList[i].toSpan == 'FIRST HALF'))
          className = 'firstHalf';
        else if ((this.userLeaveList[i].fromSpan == 'SECOND HALF') || (this.userLeaveList[i].toSpan == 'SECOND HALF'))
          className = 'secondHalf';
        else
          className = 'fullDay';
        switch (this.userLeaveList[i].leaveStatus) {
          case 'Pending': eventColor = '#FFC400';
            break;
          case 'Approved': eventColor = '#56EAEF';
            break;
          case 'Cancelled': eventColor = '#9D56EF';
            break;
          case 'Rejected': eventColor = '#EF7B56';
            break;
        }

        var start = dates[0];
        for (let k = 0; k < dates.length - 1; k++) {
          var date1 = new Date(dates[k]).getDate();
          var date2 = new Date(dates[k + 1]).getDate();

          if (date2 != date1 + 1) {
            this.events.push({
              title: this.userLeaveList[i].leaveStatus,
              start: new Date(start),
              end: new Date(dates[k]),
              color: eventColor,
              textColor: 'white',
              // classNames: className
            });
            start = dates[k + 1];
            started = true;
          }
        }

        this.events.push({
          title: this.userLeaveList[i].leaveStatus,
          start: new Date(start),
          end: new Date(dates[dates.length - 1]),
          color: eventColor,
          textColor: 'white',
          // classNames: className
        });

      }, (error) => {
        console.log(error);
      });
    }

    //Binding holidays

    for (let i = 0; i < this.holidayList.length; i++) {
      this.events.push({
        title: this.holidayList[i].description,
        date: this.holidayList[i].date,
        color: 'red',
        textColor: 'white',
        className: 'holiday'
      })
    }
  }

  // scrollTohighlightRow() {
  //   let elmnt = <HTMLInputElement>document.getElementById('highlightRow');
  //   elmnt  : HTMLElement;
  //   elmnt.scrollIntoView();
  // }
}

