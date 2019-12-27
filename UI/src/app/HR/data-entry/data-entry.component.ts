import { Component, OnInit, Input, ViewChild } from '@angular/core';
// import { OptionsInput } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { CalendarComponent } from '@fullcalendar/angular';
import { UserModel } from '../../models/user-model';
import { UserDataService } from 'src/app/services/user-data.service';
import { HolidayModel } from '../../models/holiday-model';
import { HolidayService } from '../../services/holiday.service';
import { SettingsService } from '../../services/settings.service';
import { LeavedataModel } from '../../models/leavedata-model';
import { LeavedataService } from '../../services/leavedata.service';

import * as $ from 'jquery';
import * as moment from 'moment';
import 'fullcalendar';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { flatten } from '@angular/core/src/render3/util';
import { from } from 'rxjs';

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
  leaveData: LeavedataModel
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
  departmentList = [];
  userLeaves = [];
  defaultLeaveList: any;
  errorFlag = false;
  successFlag = false;
  confirmationFlag = false;
  errorMessage: string;
  successMessage: string;
  //yearSelection: string[];
  yearSelection: string[] = [];
  currentYear: any;
  holidayYear: any;
  addForAll = false;
  count = 0;
  checkEmpLeaveData: any;
  defaultLeaves: any;

  @Input()
  set configurations(config: any) {
    if (config) {
      this.defaultConfigurations = config;
    }
  }
  @Input() eventData: any;

  defaultConfigurations: any;
  constructor(private router: Router, private userDataService: UserDataService, private datepipe: DatePipe,
    private holidayService: HolidayService, private settingsService: SettingsService, private leavedataService: LeavedataService) {
    this.user = new UserModel()
    this.holiday = new HolidayModel()
    this.leaveData = new LeavedataModel()


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

  ngOnDestroy(){
    $('#add-employee').removeClass('active-nav');
  }

  ngOnInit() {
    $('#add-employee').addClass('active-nav');
    this.yearSelection = [];
    this.count = 0;
    this.currentYear = (new Date()).getFullYear();
    this.holidayYear = this.currentYear
    for (let i = 2019; i < this.currentYear + 20; i++) {
      this.yearSelection[this.count] = i.toString();
      this.count++
    }
    $('#full-calendar').fullCalendar(
      this.defaultConfigurations
    );
    this.onloadList();
    this.leaveData.employeeId = '';
    this.leaveData.year = '';
  }

  randomPassword(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz!@#$%&ABCDEFGHIJKLMNOP1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
      var i = Math.floor(Math.random() * chars.length);
      pass += chars.charAt(i);
    }
    return pass;
  }

  generate() {
    this.user.password = this.randomPassword(10);
  }

  dayClick(date, jsEvent, activeView) {
  }
  eventDragStart(timeSheetEntry, jsEvent, ui, activeView) {
  }
  eventDragStop(timeSheetEntry, jsEvent, ui, activeView) {
  }

  onloadList() {
    if (sessionStorage.getItem('adminToken')) {
      this.logAdmin = true;
      this.userDataService.getEmpDataAdmin().subscribe((response) => {
        this.employeeList = JSON.parse(response["_body"]).users;
        this.leaveData = JSON.parse(response["_body"]).userLeaves
        for (let i = 0; i < this.employeeList.length; i++) {
          for (let j = 0; j < this.userLeaves.length; j++) {
            if (this.employeeList[i]._id == this.userLeaves[j].employeeId) {
              this.employeeList[i].totalLeaves = this.userLeaves[j].earnedLeave + this.userLeaves[j].casualLeave
            }
          }
          // this.employeeList[i].totalLeaves = this.employeeList[i].EL + this.employeeList[i].CL
          var managerId = this.employeeList[i].managerEmployeeCode;
          var managerName = this.employeeList.find(p => p._id == managerId);
          if (managerName) {
            this.employeeList[i].managerName = managerName.firstName + ' ' + managerName.lastName;
          }
        }
        this.settingsService.settingsData().subscribe((response) => {
          this.departmentList = JSON.parse(response["_body"]).departmentList;
          for (let i = 0; i < this.employeeList.length; i++) {
            var deptId = this.employeeList[i].department;
            var departmentArray = this.departmentList.find(p => p._id === deptId);
            if (departmentArray) {
              this.employeeList[i].departmentName = departmentArray.departmentName
            }
          }
        }, (error) => {
          console.log(error);
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }, (error) => {
        console.log(error);
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
      this.settingsService.settingsLeaveData().subscribe((response) => {
        this.defaultLeaveList = JSON.parse(response["_body"]).defaultLeaveList;
      }, (error) => {
        console.log(error);
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }
    else {
      this.logAdmin = false;
      this.userDataService.getEmpData().subscribe((response) => {
        this.employeeList = JSON.parse(response["_body"]).users;
        this.userLeaves = JSON.parse(response["_body"]).userLeaves
        for (let i = 0; i < this.employeeList.length; i++) {
          for (let j = 0; j < this.userLeaves.length; j++) {
            if (this.employeeList[i]._id == this.userLeaves[j].employeeId) {
              this.employeeList[i].totalLeaves = this.userLeaves[j].earnedLeave + this.userLeaves[j].casualLeave
            }
          }
          //this.employeeList[i].totalLeaves = this.employeeList[i].EL + this.employeeList[i].CL
          var managerId = this.employeeList[i].managerEmployeeCode;
          var managerName = this.employeeList.find(p => p._id === managerId);
          if (managerName) {
            this.employeeList[i].managerName = managerName.firstName + ' ' + managerName.lastName;
          }
        }
        this.settingsService.hrSettingsData().subscribe((response) => {
          this.departmentList = JSON.parse(response["_body"]).departmentList;
          for (let i = 0; i < this.employeeList.length; i++) {
            var deptId = this.employeeList[i].department;
            var departmentArray = this.departmentList.find(p => p._id === deptId);
            if (departmentArray) {
              this.employeeList[i].departmentName = departmentArray.departmentName
            }
          }
        }, (error) => {
          console.log(error);
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }, (error) => {
        console.log(error);
        this.errorFlag = true;
        this.errorMessage = error._body;
      })

      this.settingsService.hrsettingsLeaveData().subscribe((response) => {
        this.defaultLeaveList = JSON.parse(response["_body"]).defaultLeaveList;
        // this.user.CL = this.defaultLeaveList[0].casualLeaves;
        // this.user.EL = this.defaultLeaveList[0].earnedLeaves;
        // this.user.ML = this.defaultLeaveList[0].maternityLeaves;
      }, (error) => {
        console.log(error);
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }


    this.user.managerEmployeeCode = '';
    this.user.department = '';
    this.user.employeeStatus = '';
    this.user.employeeType = '';
    this.user.lastName = '';
    this.user.email = '';
    //this.addEmployeeForm.resetForm();
  }

  checkDuplicateEmpCode() {
    this.errorFlag = false;
    var existEmployee = this.employeeList.find(p => p.employeeCode === this.user.employeeCode);
    if (!existEmployee) {
      this.isEmployeeCodeExist = false;
      this.userDataService.duplicateEmpCode(this.user.employeeCode).subscribe((response) => {
      }, (error) => {
        console.log(error)
        // this.errorFlag = true;
        // this.errorMessage = error._body;
      })
    } else {
      this.errorFlag = true;
      this.errorMessage = 'Employee code already exist';
    }
  }
  checkDuplicateEmpEmail() {
    this.errorFlag = false;
    var genEmailId = this.user.firstName + '.' + this.user.lastName + '@vaal-triangle.com'
    var existgenEmployeeEmail = this.employeeList.find(p => p.email === genEmailId.toLowerCase());
    if (existgenEmployeeEmail) {
      this.isEmployeeEmailExist = true;
      this.errorFlag = true;
      this.errorMessage = 'Employee Email-Id already exist';
    }
    var existEmployeeEmail = this.employeeList.find(p => p.email === this.user.email);
    if (existEmployeeEmail) {
      this.isEmployeeEmailExist = true;
      this.errorFlag = true;
      this.errorMessage = 'Employee Email-Id already exist';
    } else {
      this.user.email = (<HTMLInputElement>document.getElementById("email")).value;
      this.isEmployeeEmailExist = false;
    }
  }

  addEmployee(resetForm) {

    this.successFlag = false;
    this.checkDuplicateEmpEmail();
    if (sessionStorage.getItem('adminToken')) {
      if (!this.isEmployeeCodeExist && !this.isEmployeeEmailExist) {
        this.userDataService.adminAddEmployeeData(this.user).subscribe((response) => {
          this.newUserData = JSON.parse(response["_body"]).user;
          this.printSuccessMessage('Employee added Successfully');
          // alert('Employee added')
          this.user = new UserModel();
          this.onloadList()
        }, (error) => {
          console.log(error)
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }
    }
    else {
      if (!this.isEmployeeCodeExist && !this.isEmployeeEmailExist) {
        this.userDataService.addEmployeeData(this.user).subscribe((response) => {
          this.newUserData = JSON.parse(response["_body"]).user;
          this.printSuccessMessage('Employee added Successfully')
          // alert('Employee added')
          this.user = new UserModel();
          this.onloadList()
        }, (error) => {
          console.log(error)
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }
    }
  }

  editEmployee(editedUser) {
    this.editEmpFlag = true;
    this.user.password = '';
    if (editedUser.password) {
      this.user.password = editedUser.password;
    }
    this.user.isHR = editedUser.isHR;
    this.user.employeeCode = editedUser.employeeCode;
    this.user.firstName = editedUser.firstName;
    this.user.lastName = editedUser.lastName;
    this.user.employeeType = editedUser.employeeType;
    this.user.employeeStatus = editedUser.employeeStatus;
    this.user.department = editedUser.department;
    this.user.managerEmployeeCode = editedUser.managerEmployeeCode;
    this.user.email = editedUser.email;
    this.user.phoneNumber = editedUser.phoneNumber;
    // this.user.CL = editedUser.CL;
    // this.user.EL = editedUser.EL;
    // this.user.ML = editedUser.ML;
    this.user.dateOfJoining = this.datepipe.transform(editedUser.dateOfJoining, "yyyy-MM-dd");
    this.user.resignationDate = this.datepipe.transform(editedUser.resignationDate, "yyyy-MM-dd");
    this.user.leavingDate = this.datepipe.transform(editedUser.leavingDate, "yyyy-MM-dd");
    this.user._id = editedUser._id;
  }
  updateEmployee() {
    this.successFlag = false;
    if (sessionStorage.getItem('adminToken')) {
      this.userDataService.adminupdateEmployeeData(this.user).subscribe((response) => {
        this.newUserData = JSON.parse(response["_body"]).user;
        this.printSuccessMessage('Employee Updated Successfully');
        // alert('Employee Updated')
        this.onloadList();
        this.editEmpFlag = false;
        this.user = new UserModel();
        this.user.managerEmployeeCode = '';
        this.user.department = '';
        this.user.employeeStatus = '';
        this.user.employeeType = '';
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    } else {
      this.userDataService.updateEmployeeData(this.user).subscribe((response) => {
        this.newUserData = JSON.parse(response["_body"]).user;
        this.printSuccessMessage('Employee Updated Successfully');
        // alert('Employee Updated')
        this.onloadList();
        this.editEmpFlag = false;
        this.user = new UserModel();
        this.user.managerEmployeeCode = '';
        this.user.department = '';
        this.user.employeeStatus = '';
        this.user.employeeType = '';
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }

  }

  deleteEmployee(deleteEmployee) {
    this.successFlag = false;
    if (sessionStorage.getItem('adminToken')) {
      if (confirm("Are you sure to delete " + deleteEmployee.firstName + ' ' + deleteEmployee.lastName)) {
        this.userDataService.admindeleteEmployee(deleteEmployee.employeeCode).subscribe((response) => {
          this.printSuccessMessage('Employee Deleted Successfully');
          // alert('Employee Deleted')
          this.onloadList()
        }, (error) => {
          console.log(error)
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }
    } else {
      if (confirm("Are you sure to delete " + deleteEmployee.firstName + ' ' + deleteEmployee.lastName)) {
        this.userDataService.deleteEmployee(deleteEmployee.employeeCode).subscribe((response) => {
          this.printSuccessMessage('Employee Deleted Successfully');
          // alert('Employee Deleted')
          this.onloadList()
        }, (error) => {
          console.log(error)
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }
    }
  }

  loadHolidayData(year) {
    if (sessionStorage.getItem('adminToken')) {
      this.holidayService.adminGetHolidayList(year).subscribe((response) => {
        this.holidayList = JSON.parse(response["_body"]).holidays;
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    } else {
      this.holidayService.getHolidayList(year).subscribe((response) => {
        this.holidayList = JSON.parse(response["_body"]).holidays;
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }

  }

  addHoliday() {
    this.successFlag = false;
    if (sessionStorage.getItem('adminToken')) {
      this.holidayService.adminAddHoliday(this.holiday).subscribe((response) => {
        this.holiday = JSON.parse(response["_body"]).holiday;
        this.printSuccessMessage('Holiday added Successfully');
        // alert('Holiday added')
        this.holiday.description = '';
        this.loadHolidayData(this.currentYear)
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    } else {
      this.holidayService.addHoliday(this.holiday).subscribe((response) => {
        this.holiday = JSON.parse(response["_body"]).holiday;
        this.printSuccessMessage('Holiday added Successfully');
        // alert('Holiday added')
        this.holiday.description = '';
        this.loadHolidayData(this.currentYear)
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }

  }

  editHoliday(holiday) {
    this.editHolidayFlag = true;
    this.holiday = holiday;
    this.holiday.date = this.datepipe.transform(this.holiday.date, "yyyy-MM-dd");
  }

  updateHoliday() {
    this.successFlag = false;
    if (sessionStorage.getItem('adminToken')) {
      this.holidayService.adminUpdateHoliday(this.holiday).subscribe((response) => {
        this.holiday = JSON.parse(response["_body"]).holiday;
        this.printSuccessMessage('Holiday Updated Successfully');
        // alert('Holiday Updated')
        this.editHolidayFlag = false;
        this.holiday = new HolidayModel();
        this.loadHolidayData(this.currentYear)
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    } else {
      this.holidayService.updateHoliday(this.holiday).subscribe((response) => {
        this.holiday = JSON.parse(response["_body"]).holiday;
        this.printSuccessMessage('Holiday Updated Successfully');
        // alert('Holiday Updated')
        this.editHolidayFlag = false;
        this.holiday = new HolidayModel();
        this.loadHolidayData(this.currentYear)
      }, (error) => {
        console.log(error)
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }
  }

  deleteHoliday(holiday) {
    this.successFlag = false;
    if (sessionStorage.getItem('adminToken')) {
      if (confirm("Are you sure to delete " + this.datepipe.transform(holiday.date, "dd-MM-yyyy"))) {
        this.holidayService.admindeleteholiday(holiday.date).subscribe((response) => {
          this.printSuccessMessage('Holiday Deleted Successfully');
          this.loadHolidayData(this.currentYear)
        }, (error) => {
          console.log(error)
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }
    } else {
      if (confirm("Are you sure to delete " + this.datepipe.transform(holiday.date, "dd-MM-yyyy"))) {
        this.holidayService.deleteholiday(holiday.date).subscribe((response) => {
          this.printSuccessMessage('Holiday Deleted Successfully');
          this.loadHolidayData(this.currentYear)
        }, (error) => {
          console.log(error)
          this.errorFlag = true;
          this.errorMessage = error._body;
        })
      }
    }
  }
  backToAddHoliday() {
    this.holiday = new HolidayModel()
    this.editHolidayFlag = false
  }
  backToAddUser() {
    this.user = new UserModel()
    this.user.managerEmployeeCode = '';
    this.user.department = '';
    this.user.employeeStatus = '';
    this.user.employeeType = '';
    this.editEmpFlag = false;
  }

  printSuccessMessage(message) {
    this.successFlag = true;
    this.successMessage = message;
    setTimeout(function () {
      $(".myAlert-top").hide();
    }, 3000);
  }

  addLeave() {
    this.addForAll = false;
    var addbutton = <HTMLInputElement>document.getElementById("addForAllSwitch")
    addbutton.checked = false;
    this.leaveData = new LeavedataModel;
  }

  addLeaveForAll(e) {
    this.leavedataService.getDefaultLeavesEntry().subscribe((response) => {
      this.defaultLeaves = JSON.parse(response["_body"]).defaultLeaves[0]
      if (this.defaultLeaves) {
        this.leaveData.casualLeave = this.defaultLeaves.casualLeaves
        this.leaveData.earnedLeave = this.defaultLeaves.earnedLeaves
      } else {
        this.leaveData.casualLeave = null;
        this.leaveData.earnedLeave = null;
      }
    })
    if (e.target.checked) {
      this.leaveData = new LeavedataModel;
      this.leaveData.year = '';
      this.addForAll = true;
    } else {
      this.addForAll = false;
    }
  }

  // checkDataForYear(data){
  //   this.leavedataService.getDefaultLeaves(data.year).subscribe((response) => {
  //     this.defaultLeaves = JSON.parse(response["_body"]).deafatLeaveData
  //     console.log('leaves Data'+this.defaultLeaves)
  //     if(this.defaultLeaves){
  //       this.leaveData.casualLeave = this.defaultLeaves.casualLeaves
  //       this.leaveData.earnedLeave = this.defaultLeaves.earnedLeaves
  //     } else {
  //       this.leaveData.casualLeave = null ;
  //       this.leaveData.earnedLeave = null;
  //     }
  //   })
  // }

  addEmployeeLeave() {
    var element = <HTMLInputElement>document.getElementById("carryForwardCheck");
    if (!element.checked) {
      this.leaveData.carryForwardLeave = 0;
      this.leaveData.carryForwardFlag = false;
    } else {
      this.leaveData.earnedLeave = this.leaveData.earnedLeave + this.leaveData.carryForwardLeave
    }
    var element2 = <HTMLInputElement>document.getElementById("maternityLeavesCheck");
    if (!element2.checked) {
      this.leaveData.maternityFlag = false;
      this.leaveData.maternityLeave = 0
    }
    this.leavedataService.postEmployeeLeaveData(this.leaveData).subscribe((response) => {
      let successMsg = JSON.parse(response["_body"]).message;
      this.printSuccessMessage(successMsg);
      this.leaveData = new LeavedataModel()
      this.leaveData.employeeId = '';
      this.leaveData.year = '';
    })
  }

  assignCarryForwardLeave(e) {
    if (e.target.checked) {
      if (this.leaveData.leaveBalance >= 18) {
        this.leaveData.carryForwardLeave = 18;
      } else {
        this.leaveData.carryForwardLeave = this.leaveData.leaveBalance
      }
    }
  }
  employeeLeaveData(leaveData) {
    this.leavedataService.getEmployeeLeaveData(leaveData.year, leaveData.employeeId).subscribe((response) => {
      this.checkEmpLeaveData = JSON.parse(response["_body"]).empLeaveData[0];
      if (this.checkEmpLeaveData != undefined) {
        this.leaveData = this.checkEmpLeaveData
        this.leaveData.leaveBalance = JSON.parse(response["_body"]).employeeBalanceLeave;
      } else {
        this.leaveData = leaveData;
        this.leaveData.earnedLeave = 0;
        this.leaveData.casualLeave = 0;
        this.leaveData.carryForwardLeave = 0;
        this.leaveData.maternityLeave = 0;
        this.leaveData.carryForwardFlag = false;
        this.leaveData.maternityFlag = false;
        this.leaveData.leaveBalance = 0;
      }
      // this.printSuccessMessage('Leave added successfully');
      // this.leaveData = new LeavedataModel()
      // this.leaveData.employeeId='';
      // this.leaveData.year= '';
    })
  }

  addLeaveToAll() {
    this.leavedataService.addLeaveToAllEmployee(this.leaveData).subscribe((response) => {
      this.printSuccessMessage('Leave added succesfully');
      this.addLeave()
    }, (error) => {
      console.log(error)
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  yearsHoliday(btn) {
    if (btn == 'prev') {
      this.holidayYear = this.holidayYear - 1
    } else if (btn == 'next') {
      this.holidayYear = this.holidayYear + 1
    }
    this.loadHolidayData(this.holidayYear)
  }
}