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
        console.log(this.departmentList)
      }, (error) => {
        console.log(error);
      })
    }
  }
  addDepartment() {
    if (localStorage.getItem('adminToken')) {
      debugger;
      this.settingsService.addDepartment(this.settings).subscribe((response) => {
        this.department = JSON.parse(response["_body"]).department;
        alert('Department Added')
        this.settings = new SettingsModel();
        this.onLoadSettings();
      }, (error) => {
        console.log(error);
      })
    }
  }

  editDepartment(editDepartment) {
    this.editDepartmentFlag = true
    console.log(editDepartment)
    this.settings.deptId = editDepartment._id;
    this.settings.departmentName = editDepartment.departmentName;
  }

  updateDepartment() {
    this.settingsService.updateDepartment(this.settings).subscribe((response) => {
      this.department = JSON.parse(response["_body"]).department;
      alert('Department Updated')
      this.settings = new SettingsModel();
      this.onLoadSettings();
    }, (error) => {
      console.log(error);
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
        this.defaultlevesList = JSON.parse(response["_body"]).defaultLeaveList;
        console.log(this.defaultlevesList)
      }, (error) => {
        console.log(error);
      })
    }
  }

  addDefaultsLeaves() {
    if (localStorage.getItem('adminToken')) {
      this.settingsService.addDefaultLeave(this.settings).subscribe((response) => {
        this.defaultLeaves = JSON.parse(response["_body"]).defaultLeaves;
        alert('Default Leaves Added')
        this.settings = new SettingsModel();
        this.loadDefaultLeaves();
      }, (error) => {
        console.log(error);
      })
    }
  }

  editDefaultLeaves(editDefaultLeaves){
    console.log(editDefaultLeaves)
    this.editDefaultLeavesFlag = true;
    this.settings.defaultLeavesId = editDefaultLeaves._id;
    this.settings.casualLeaves = editDefaultLeaves.casualLeaves;
    this.settings.earnedLeaves = editDefaultLeaves.earnedLeaves;
    this.settings.maternityLeaves = editDefaultLeaves.maternityLeaves;
  }

  updateDefaultsLeaves(){
    debugger
    this.settingsService.updateDefaultLeave(this.settings).subscribe((response) => {
      this.defaultLeaves = JSON.parse(response["_body"]).defaultLeaves;
      alert('Department Updated')
      this.settings = new SettingsModel();
      this.loadDefaultLeaves();
    }, (error) => {
      console.log(error);
    })
  }

  backToAddLeave(){
    this.editDefaultLeavesFlag = false;
  }
}
