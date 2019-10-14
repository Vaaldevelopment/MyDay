import { Component, OnInit } from '@angular/core';
import { SettingsModel } from '../models/settings-model';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings: SettingsModel
  department: any
  departmentList = [];
  defaultlevesList: any;
  editDepartmentFlag = false;
  defaultLeaves: any;
  editDefaultLeavesFlag = false
  errorFlag = false;
  successFlag = false;
  successMessage: string;
  errorMessage: string;

  constructor(private settingsService: SettingsService) {
    this.settings = new SettingsModel()
  }

  ngOnInit() {
    this.onLoadSettings();
  }

  onLoadSettings() {
    if (localStorage.getItem('adminToken')) {
      debugger
      this.settingsService.settingsData().subscribe((response) => {
        this.departmentList = JSON.parse(response["_body"]).departmentList;
      }, (error) => {
        console.log(error);
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }
  }
  addDepartment() {
    if (localStorage.getItem('adminToken')) {
    this.successFlag = false;
      this.settingsService.addDepartment(this.settings).subscribe((response) => {
        this.department = JSON.parse(response["_body"]).department;
        this.printSuccessMessage('Department Added Successfully')
        this.settings = new SettingsModel();
        this.onLoadSettings();
      }, (error) => {
        console.log(error);
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }
  }

  editDepartment(editDepartment) {
    this.editDepartmentFlag = true
    this.settings.deptId = editDepartment._id;
    this.settings.departmentName = editDepartment.departmentName;
  }

  updateDepartment() {
    this.successFlag = false;
    this.settingsService.updateDepartment(this.settings).subscribe((response) => {
      this.department = JSON.parse(response["_body"]).department;
      this.printSuccessMessage('Department Updated Successfully')
      this.settings = new SettingsModel();
      this.onLoadSettings();
    }, (error) => {
      console.log(error);
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  backToAddDept(adddepartment) {
    this.editDepartmentFlag = false;
  }

  //Default Leaves 
  loadDefaultLeaves() {
    this.editDefaultLeavesFlag = false;
    if (localStorage.getItem('adminToken')) {
      debugger
      this.settingsService.settingsLeavesData().subscribe((response) => {
        this.defaultlevesList = JSON.parse(response["_body"]).defaultLeaveList[0];
        this.settings.casualLeaves = this.defaultlevesList.casualLeaves;
        this.settings.earnedLeaves = this.defaultlevesList.earnedLeaves;
        this.settings.maternityLeaves = this.defaultlevesList.maternityLeaves;
        this.settings.defaultLeavesId = this.defaultlevesList._id;
      }, (error) => {
        console.log(error);
        this.errorFlag = true;
        this.errorMessage = error._body;
      })
    }
  }

  updateDefaultsLeaves() {
    this.successFlag = false;
    this.settingsService.updateDefaultLeave(this.settings).subscribe((response) => {
      this.defaultLeaves = JSON.parse(response["_body"]).defaultLeaves;
      this.printSuccessMessage('Leave Updated Successfully')
      this.settings = new SettingsModel();
      this.loadDefaultLeaves();
    }, (error) => {
      console.log(error);
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  printSuccessMessage(message) {
    this.successFlag = true;
    this.successMessage = message;
    setTimeout(function () {
      $(".myAlert-top").hide();
    }, 3000);
  }

}
