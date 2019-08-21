import { Component, OnInit, Input } from '@angular/core';
// import { OptionsInput } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { CalendarComponent } from '@fullcalendar/angular';
import { UserModel } from '../../models/user-model';
import { UserLoginService } from '../../services/user-login.service'

import * as $ from 'jquery';
import * as moment from 'moment';
import 'fullcalendar';
import { Router } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data.service';
//declare var $: any;

@Component({
  selector: 'app-data-entry',
  templateUrl: './data-entry.component.html',
  styleUrls: ['./data-entry.component.scss']
})
export class DataEntryComponent implements OnInit {
  user: UserModel;
  employeeList = [];
  duplicateEmp: any;
  isEmployeeCodeExist = false;
  newUserData: any;
  isEmployeeEmailExist = false;

  @Input()
  set configurations(config: any) {
    if (config) {
      this.defaultConfigurations = config;
    }
  }
  @Input() eventData: any;

  defaultConfigurations: any;
  constructor(private router: Router, private userLoginService: UserLoginService, private userDataService: UserDataService) {
    this.user = new UserModel()
    this.user.managerEmployeeCode = "";
    this.user.department = "";
    this.user.employeeStatus = "";
    this.user.employeeType = "";
    this.user.lastName ='';


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
    this.userDataService.getEmpData().subscribe((response) => {
      this.employeeList = JSON.parse(response["_body"]).users;
    }, (error) => {
      console.log(error);
    })
  }

  checkDuplicateEmpCode() {
    debugger
    var existEmployee = this.employeeList.find(p => p.employeeCode === this.user.employeeCode);
    if (!existEmployee) {
      this.userDataService.duplicateEmpCode(this.user.employeeCode).subscribe((response) => {
      }, (error) => {
        this.isEmployeeCodeExist = false;
        console.log(error)
      })
    } else {
      this.isEmployeeCodeExist = true;
    }
  }
  checkDuplicateEmpEmail() {
    debugger
    var genEmailId = this.user.firstName+'.'+this.user.lastName+'@vaal-triangle.com'
    var existEmployeeEmail = this.employeeList.find(p => p.email === this.user.email);
    var existEmployeeEmail = this.employeeList.find(p => p.email === genEmailId.toLowerCase());
    if (existEmployeeEmail || existEmployeeEmail) {
        this.isEmployeeEmailExist = true;
    } else {
      this.isEmployeeEmailExist = false;
    }
  }

  addEmployee() {
    debugger;
    if(!this.isEmployeeCodeExist && !this.isEmployeeEmailExist) {
      this.userDataService.addEmployeeData(this.user).subscribe((response) => {
        this.newUserData = JSON.parse(response["_body"]).user;
        console.log(this.newUserData)
      }, (error) => {
        console.log(error)
      })
    }
  }
}
