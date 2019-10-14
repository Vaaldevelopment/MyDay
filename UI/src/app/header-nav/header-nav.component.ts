import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../models/user-model';
import { UserLoginService } from '../services/user-login.service'
import { Pipe, PipeTransform } from '@angular/core';
import { FilterPipe } from '../filter.pipe';

@Component({
  selector: 'app-header-nav',
  templateUrl: './header-nav.component.html',
  styleUrls: ['./header-nav.component.scss']
})
export class HeaderNavComponent implements OnInit {

  notificationBell: boolean;
  userName: string;
  userId: string;
  adminLog = false;
  isManagerFlag = false;
  managerEmpList = [];
  recManagerEmpList = [];
  checkedList: any;
  masterSelected: boolean;
  searchText: string = "";
  selected_count: number = 0;
  RepUserNameFlag = false;
  RepUserName: string;
  checkBoxUrlFlag = false;



  constructor(private router: Router, private userLoginService: UserLoginService) {
    this.notificationBell = true;
    // this.getSelected();
  }

  ngOnInit() {
    this.userName = localStorage.getItem('userName');
    this.userId = localStorage.getItem('userID');
    this.RepUserName = localStorage.getItem('RepUserName');
    if(this.RepUserName){
      this.RepUserNameFlag = true
    }
    if (localStorage.getItem('adminToken')) {
      this.adminLog = true;
    } else {
      this.adminLog = false;
    }
    this.loadManagerReportingEmp()
  }
  showBellNotification() {
    this.notificationBell = false;
  }
  logout() {
    if (localStorage.getItem('adminToken')) {
      localStorage.clear();
      this.router.navigate(['/login']);
    } else {
      this.userLoginService.userLogout().subscribe((response) => {
        localStorage.clear();
        this.router.navigate(['/login']);
      }, (error) => {
        console.log(error);
      })
    }
  }

  loadManagerReportingEmp() {
    this.userLoginService.managerReportingEmp().subscribe((response) => {
      this.managerEmpList = JSON.parse(response["_body"]).managerEmpList;
      this.isManagerFlag = true;
    }, (error) => {
      console.log(error);
    })
  }
  showRecList(event: any) {
    var uncheckSelctAll = (<HTMLInputElement>document.getElementById("selectAll"));
    uncheckSelctAll.checked = false;
    if (event === true) {
      this.userLoginService.recManagerReportingEmp().subscribe((response) => {
        this.managerEmpList = JSON.parse(response["_body"]).recEmpList;
        // this.isManagerFlag = true;
      }, (error) => {
        console.log(error);
      })
    }
    if (event === false) {
      this.loadManagerReportingEmp();
    }
  }

  checkUncheckAll() {
    for (var i = 0; i < this.managerEmpList.length; i++) {
      this.managerEmpList[i].isSelected = this.masterSelected;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.masterSelected = this.managerEmpList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }

  getCheckedItemList() {
    this.checkBoxUrlFlag = true;
    this.checkedList = [];
    for (var i = 0; i < this.managerEmpList.length; i++) {
      if (this.managerEmpList[i].isSelected)
        this.checkedList.push(this.managerEmpList[i]._id);
    }
    if(this.checkedList.length == 0){
      this.checkBoxUrlFlag = false
    }
    //this.checkedList = JSON.stringify(this.checkedList);
    this.userLoginService.checkListArray =  this.checkedList;
  }

  teamView(){
    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() =>
      this.router.navigate(["/team-view"]));
  
  }

  selectedEmpDashboard(empId, empName) {
    this.RepUserNameFlag = true;
    localStorage.setItem('RepUserName', empName)
    this.RepUserName = localStorage.getItem('RepUserName');
    localStorage.setItem('selectedEmpId', empId);
    if(localStorage.getItem('adminToken')){
      this.router.navigateByUrl('/refresh', 
      { skipLocationChange: true }).then(() =>
        this.router.navigate(["/add-data"]));
    }else {
      this.router.navigateByUrl('/refresh', 
      { skipLocationChange: true }).then(() =>
        this.router.navigate(["/employee-dashboard"]));
    }
    }

    addEmployeeRoute(){
      localStorage.removeItem('RepUserName');
      localStorage.removeItem('selectedEmpId');
      this.RepUserName = '';
      this.router.navigate(["/add-data"]);
    }
}

declare var $: any;
$(document).ready(function () {
  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active');
    $('#content').toggleClass('active');
  });
});


