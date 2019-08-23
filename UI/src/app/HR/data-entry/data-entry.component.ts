import { Component, OnInit, Input, ViewChild } from '@angular/core';
// import { OptionsInput } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { CalendarComponent } from '@fullcalendar/angular';
import { UserModel } from '../../models/user-model';
import { HolidayModel } from '../../models/holiday-model';
import { UserLoginService } from '../../services/user-login.service'
import { HolidayService } from '../../services/holiday.service';

import * as $ from 'jquery';
import * as moment from 'moment';
import 'fullcalendar';
import { Router } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data.service';
import { DatePipe } from '@angular/common';
//declare var $: any;

@Component({
  selector: 'app-data-entry',
  templateUrl: './data-entry.component.html',
  styleUrls: ['./data-entry.component.scss']
})
export class DataEntryComponent implements OnInit {
  @ViewChild('addNewEmployeeForm') addEmployeeForm;
  user: UserModel;
  holiday: HolidayModel;
  employeeList = [];
  duplicateEmp: any;
  isEmployeeCodeExist = false;
  newUserData: any;
  isEmployeeEmailExist = false;
  department = [];
  logAdmin = false;
  editEmpFlag = false;
  editHolidayFlag = false;
  holidayList = [];


  @Input()
  set configurations(config: any) {
    if (config) {
      this.defaultConfigurations = config;
    }
  }
  @Input() eventData: any;

  defaultConfigurations: any;
  constructor(private router: Router, private userLoginService: UserLoginService, private userDataService: UserDataService, private datepipe: DatePipe,
    private holidayService: HolidayService) {
    this.user = new UserModel()
    this.holiday = new HolidayModel()


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
    this.onloadList();
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

  onloadList() {
    if (localStorage.getItem('adminToken')) {
      this.logAdmin = true;
      this.userDataService.getEmpDataAdmin().subscribe((response) => {
        this.employeeList = JSON.parse(response["_body"]).users;
        for (let i = 0; i < this.employeeList.length; i++) {
          var managerId = this.employeeList[i].managerEmployeeCode;
          var managerName = this.employeeList.find(p => p.employeeCode === managerId);
          if (managerName) {
            this.employeeList[i].managerName = managerName.firstName + ' ' + managerName.lastName;
          }
        }
      }, (error) => {
        console.log(error);
      })
    }
    else {
      this.logAdmin = false;
      this.userDataService.getEmpData().subscribe((response) => {
        this.employeeList = JSON.parse(response["_body"]).users;
        for (let i = 0; i < this.employeeList.length; i++) {
          var managerId = this.employeeList[i].managerEmployeeCode;
          var managerName = this.employeeList.find(p => p.employeeCode === managerId);
          if (managerName) {
            this.employeeList[i].managerName = managerName.firstName + ' ' + managerName.lastName;
          }
        }
      }, (error) => {
        console.log(error);
      })
    }


    this.user.managerEmployeeCode = '';
    this.user.department = '';
    this.user.employeeStatus = '';
    this.user.employeeType = '';
    this.user.lastName = '';
    this.user.email = '';
    this.department = ['Administration', 'Business Systems', 'CAD/CAM', 'IT', 'Marketing', 'Services', 'Support']
    //this.addEmployeeForm.resetForm();
  }

  checkDuplicateEmpCode() {
    var existEmployee = this.employeeList.find(p => p.employeeCode === this.user.employeeCode);
    console.log(existEmployee)
    if (!existEmployee) {
      this.isEmployeeCodeExist = false;
      this.userDataService.duplicateEmpCode(this.user.employeeCode).subscribe((response) => {
      }, (error) => {
        console.log(error)
      })
    } else {
      this.isEmployeeCodeExist = true;
    }
  }
  checkDuplicateEmpEmail() {
    var genEmailId = this.user.firstName + '.' + this.user.lastName + '@vaal-triangle.com'
    var existgenEmployeeEmail = this.employeeList.find(p => p.email === genEmailId.toLowerCase());
    if (existgenEmployeeEmail) {
      this.isEmployeeEmailExist = true;
    }
    var existEmployeeEmail = this.employeeList.find(p => p.email === this.user.email);
    if (existEmployeeEmail) {
      this.isEmployeeEmailExist = true;
    } else {
      this.user.email = (<HTMLInputElement>document.getElementById("email")).value;
      this.isEmployeeEmailExist = false;
    }
  }

  addEmployee() {
    this.checkDuplicateEmpEmail();
    if (localStorage.getItem('adminToken')) {
      if (!this.isEmployeeCodeExist && !this.isEmployeeEmailExist) {
        this.userDataService.adminAddEmployeeData(this.user).subscribe((response) => {
          this.newUserData = JSON.parse(response["_body"]).user;
          alert('Employee added')
          this.onloadList()
        }, (error) => {
          console.log(error)
          alert(error)
        })
      }
    }
    else {
      if (!this.isEmployeeCodeExist && !this.isEmployeeEmailExist) {
        this.userDataService.addEmployeeData(this.user).subscribe((response) => {
          this.newUserData = JSON.parse(response["_body"]).user;
          alert('Employee added')
          this.onloadList()
        }, (error) => {
          console.log(error)
          alert(error)
        })
      }
    }
  }

  editEmployee(editEmployee) {
    debugger;
    this.editEmpFlag = true;
    this.user = editEmployee;
    this.user.dateOfJoining = this.datepipe.transform(this.user.dateOfJoining, "yyyy-MM-dd");
    this.user.resignationDate = this.datepipe.transform(this.user.resignationDate, "yyyy-MM-dd");
    this.user.leavingDate = this.datepipe.transform(this.user.leavingDate, "yyyy-MM-dd");
  }
  updateEmployee() {
    this.userDataService.updateEmployeeData(this.user).subscribe((response) => {
      this.newUserData = JSON.parse(response["_body"]).user;
      alert('Employee Updated')
      this.editEmpFlag = false;
      this.user = null;
    }, (error) => {
      console.log(error)
      alert(error)
    })
  }

  deleteEmployee(deleteEmployee) {
    if (confirm("Are you sure to delete " + deleteEmployee.firstName + ' ' + deleteEmployee.lastName)) {
      this.userDataService.deleteEmployee(deleteEmployee.employeeCode).subscribe((response) => {
        alert('Employee Deleted')
        this.onloadList()
      }, (error) => {
        console.log(error)
        alert(error)
      })
    }
  }

  reset(resetForm) {
    resetForm.click();
  }
  cancel() {
    this.editEmpFlag = false;
    this.user = null;
  }
  loadHolidayData() {
    this.holidayService.getHolidayList().subscribe((response) => {
      this.holidayList = JSON.parse(response["_body"]).holidays;
    }, (error) => {
      console.log(error)
      alert(error)
    })
  }

  addHoliday() {
    debugger;
    this.holidayService.addHoliday(this.holiday).subscribe((response) => {
      this.holiday = JSON.parse(response["_body"]).holiday;
      alert('Holiday added')
      this.holiday.description = '';
      this.loadHolidayData()
    }, (error) => {
      console.log(error)
      alert(error)
    })
  }

  editHoliday(holiday) {
    this.editHolidayFlag = true;
    this.holiday = holiday;
    this.holiday.date = this.datepipe.transform(this.holiday.date, "yyyy-MM-dd");
  }

  updateHoliday() {
    this.holidayService.updateHoliday(this.holiday).subscribe((response) => {
      this.holiday = JSON.parse(response["_body"]).holiday;
      alert('Holiday Updated')
      this.editHolidayFlag = false;
      this.loadHolidayData()
    }, (error) => {
      console.log(error)
      alert(error)
    })
  }

  deleteHoliday(holiday) {
    if (confirm("Are you sure to delete " + this.datepipe.transform(holiday.date, "dd-MM-yyyy"))) {
      this.holidayService.deleteholiday(holiday.date).subscribe((response) => {
        alert('Employee Deleted')
        this.loadHolidayData()
      }, (error) => {
        console.log(error)
        alert(error)
      })
    }
  }
}
