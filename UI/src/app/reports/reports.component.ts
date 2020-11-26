import { Component, OnInit } from '@angular/core';
//import { UserModel } from '../../models/user-model';
import { Compensationoff } from 'src/app/models/compensationoff.model';
import { UserDataService } from 'src/app/services/user-data.service';
import { UserLeaveService } from 'src/app/services/user-leave.service';
import { DownloadcsvService } from '../services/downloadcsv.service';
import { DatePipe } from '@angular/common';
import * as $ from 'jquery';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  logAdmin = false;
  compOff: Compensationoff;
  compOffRep = [];
  allEmpCompOffRep = [];
  employeeList: any;
  userLeaves: any;
  settingsService: any;
  departmentList: any;
  errorFlag: boolean;
  errorMessage: any;
  yearSelection: string[] = [];
  count: number;
  currentYear: number;
  holidayYear: number;
  reportForAll: boolean;
  compOffList: any;
  compOffRepFlag = false;
  compOffEmpRepFlag = false;
  empData: any;
  empDetails: any;
  allEmpLeaveRep = [];
  leaveFlag = false;

  constructor(private router: Router, public userLeaveService: UserLeaveService, private userDataService: UserDataService, private datepipe: DatePipe, private downloadcsvService: DownloadcsvService) {
    this.compOff = new Compensationoff()
  }

  ngOnInit() {
    if (sessionStorage.getItem('adminToken')) {
      this.logAdmin = true;
    } else {
      this.logAdmin = false;
    }
    this.yearSelection = [];
    this.count = 0;
    this.currentYear = (new Date()).getFullYear();
    this.holidayYear = this.currentYear
    for (let i = 2019; i < this.currentYear + 20; i++) {
      this.yearSelection[this.count] = i.toString();
      this.count++
    }
    this.userDataService.getEmpData().subscribe((response) => {
      this.employeeList = JSON.parse(response["_body"]).users;
    }, (error) => {
      console.log(error);
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  compOffLeaveForAll(e) {
    this.compOff = new Compensationoff();
    this.compOffRep = [];
    this.allEmpCompOffRep = [];
    this.compOffEmpRepFlag = false;
    this.compOffRepFlag = false;
    if (e.target.checked) {
      // this.leaveData = new LeavedataModel;
      // this.leaveData.year = '';
      this.reportForAll = true;
    } else {
      this.reportForAll = false;
    }
  }
  CompOffEmployeeLeaveReport() {
    this.errorFlag = false;
    if (this.compOff.employeeId == undefined && this.compOff.year == undefined) {
      this.errorFlag = true;
      this.errorMessage = "Please select employee & year from list item";
      return
    } else if (this.compOff.employeeId == undefined) {
      this.errorFlag = true;
      this.errorMessage = "Please select employee from list item";
      return
    } else if (this.compOff.year == undefined) {
      this.errorFlag = true;
      this.errorMessage = "Please select year from list item";
      return
    }
    this.userLeaveService.getCompOffEmployeeLeaveReport(this.compOff.employeeId, this.compOff.year).subscribe((response) => {
      this.compOffRepFlag = true;
      this.compOffRep = JSON.parse(response["_body"]).compOffLeaveList;
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  compOffReportForAll() {
    this.errorFlag = false;
    if (this.compOff.year == undefined) {
      this.errorFlag = true;
      this.errorMessage = "Please select year from list item";
      return
    }
    this.userLeaveService.getCompOffAllEmployeeLeaveReport(this.compOff.year).subscribe((response) => {
      this.compOffEmpRepFlag = true;
      this.allEmpCompOffRep = JSON.parse(response["_body"]).allEmpcompOffLeaveList;
      for (let i = 0; i < this.allEmpCompOffRep.length; i++) {

        this.empDetails = this.employeeList.filter(user => user._id == this.allEmpCompOffRep[i].employeeId);
        this.allEmpCompOffRep[i].name = this.empDetails[0].firstName + " " + this.empDetails[0].lastName
      }
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  resetForm() {
    this.compOff = new Compensationoff();
    this.compOffRep = [];
    this.allEmpCompOffRep = [];
    this.compOffEmpRepFlag = false;
    this.compOffRepFlag = false;
    this.leaveFlag = false;
  }
  leaveReport() {
    this.errorFlag = false;
    if (this.compOff.fromDate == undefined) {
      this.errorFlag = true;
      this.errorMessage = "Please select date";
      return
    }
    this.userLeaveService.getAllEmployeeLeaveReport(this.compOff.fromDate, this.compOff.toDate).subscribe((response) => {
      this.leaveFlag = true;
      this.allEmpLeaveRep = JSON.parse(response["_body"]).leaveDates;
      for (let i = 0; i < this.allEmpLeaveRep.length; i++) {
        this.empDetails = this.employeeList.filter(user => user._id == this.allEmpLeaveRep[i].employeeId);
        this.allEmpLeaveRep[i].name = this.empDetails[0].firstName + " " + this.empDetails[0].lastName
      }
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  downloadcsv(leaveData) {
    this.downloadcsvService.downloadFile(leaveData);
  }
}
