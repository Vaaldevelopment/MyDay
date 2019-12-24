import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserLoginService } from '../services/user-login.service'


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
  notificationList = [];
  checkedList: any;
  masterSelected: boolean;
  searchText: string = "";
  selected_count: number = 0;
  RepUserNameFlag = false;
  RepUserName: string;
  checkBoxUrlFlag = false;
  notificationCount: number;
  notificationFromUserData: any;
  notificationFlag: any;
  fromUserData: any;
  isHR: any;
  userList: any;
  selectedOption: any;
  requestedById: any;

  constructor(private router: Router, private userLoginService: UserLoginService) {
    // this.notificationBell = true;
    // this.getSelected();
  }

  ngOnInit() {
    sessionStorage.removeItem('notificationIdHighlight');
    this.userName = sessionStorage.getItem('userName');
    this.userId = sessionStorage.getItem('userID');
    this.RepUserName = sessionStorage.getItem('RepUserName');
    this.isHR = sessionStorage.getItem('isHR');
    if (this.RepUserName) {
      this.RepUserNameFlag = true
    }
    if (sessionStorage.getItem('adminToken')) {
      this.adminLog = true;
    } else {
      this.adminLog = false;
    }
    this.loadManagerReportingEmp()
    setInterval(() => { this.loadNotification(); }, 60000);
  }
  showBellNotification() {
    this.notificationBell = false;
  }
  logout() {
    if (sessionStorage.getItem('adminToken')) {
      sessionStorage.clear();
      this.router.navigate(['/login']);
    } else {
      this.userLoginService.userLogout().subscribe((response) => {
        sessionStorage.clear();
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
    this.loadNotification();
  }
  loadNotification() {
    this.userLoginService.notification().subscribe((response) => {
      this.notificationList = JSON.parse(response["_body"]).notificationList;
      this.userList = JSON.parse(response["_body"]).userList;
      for (let i = 0; i < this.notificationList.length; i++) {
        this.notificationFromUserData = this.userList.find(u => u._id == this.notificationList[i].fromId)
      }
      this.notificationCount = this.notificationList.length;
      if (this.notificationCount !== 0) {
        this.notificationBell = true;
      } else {
        this.notificationBell = false;
        this.notificationCount = null;
      }
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
    if (this.checkedList.length == 0) {
      this.checkBoxUrlFlag = false
    }
    //this.checkedList = JSON.stringify(this.checkedList);
    this.userLoginService.checkListArray = this.checkedList;
  }

  removeHighlight() {
    sessionStorage.removeItem('notificationIdHighlight');
  }

  teamView() {
    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() =>
      this.router.navigate(["/team-view"]));
  }

  selectedEmpDashboard(empId, empName) {
    if (!this.notificationFlag) {
      sessionStorage.removeItem('notificationIdHighlight');
    }
    this.RepUserNameFlag = true;
    sessionStorage.setItem('RepUserName', empName)
    this.RepUserName = sessionStorage.getItem('RepUserName');
    sessionStorage.setItem('selectedEmpId', empId);
    if (sessionStorage.getItem('adminToken')) {
      this.router.navigateByUrl('/refresh',
        { skipLocationChange: true }).then(() =>
          this.router.navigate(["/add-data"]));
    } else {
      this.router.navigateByUrl('/refresh',
        { skipLocationChange: true }).then(() =>
          this.router.navigate(["/employee-dashboard"]));
    }
  }

  addEmployeeRoute() {
    sessionStorage.removeItem('RepUserName');
    sessionStorage.removeItem('selectedEmpId');
    this.RepUserName = '';
    this.router.navigate(["/add-data"]);
  }

  setNotificationFlag(notification) {

    if (this.isManagerFlag) {
      this.userLoginService.notificationFlag(notification).subscribe((response) => {
        this.notificationFlag = JSON.parse(response["_body"]).setNotificationFlagData;
        sessionStorage.setItem('notificationIdHighlight', this.notificationFlag.leaveId);

        // if(notification.toId == this.userId){
        //   this.router.navigateByUrl('/refresh',
        //   { skipLocationChange: true }).then(() =>
        //     this.router.navigate(["/employee-dashboard"]));
        // } else {
        this.fromUserData = JSON.parse(response["_body"]).fromUserdata;
        this.selectedEmpDashboard(this.fromUserData._id, this.fromUserData.firstName + ' ' + this.fromUserData.lastName)
        //}
      })
    } else {
      this.userLoginService.allNotificationFlag(notification).subscribe((response) => {
        sessionStorage.setItem('notificationIdHighlight', notification.leaveId);
        this.router.navigateByUrl('/refresh',
          { skipLocationChange: true }).then(() =>
            this.router.navigate(["/employee-dashboard"]));
      })
    }
  }

  clearAllNotification() {
    this.userLoginService.clearAllNotification().subscribe((response) => {
      this.notificationList = null;
      this.notificationCount = 0;
    })
  }

  selecteEmployee() {
    if (!sessionStorage.getItem('requestedBy')) {
      this.requestedById = sessionStorage.getItem('userID');
    } else {
      this.requestedById = sessionStorage.getItem('requestedBy')
    }
    sessionStorage.setItem('requestedBy', this.requestedById);
    var userEmail = this.userList.filter(emp => emp._id == this.selectedOption)
    this.userLoginService.hrLoginAs(userEmail[0], this.requestedById).subscribe((response) => {
      sessionStorage.setItem('userToken', JSON.parse(response["_body"]).token);
      sessionStorage.setItem('userName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName)
      sessionStorage.setItem('RepUserName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName)
      sessionStorage.setItem('userID', JSON.parse(response["_body"]).user._id);
      sessionStorage.setItem('isHR', JSON.parse(response["_body"]).user.isHR);
      if (this.selectedOption == this.requestedById) {
        this.requestedById = null;
      }
      this.ngOnInit();
      this.isHR = JSON.parse(response["_body"]).user.isHR
      this.router.navigateByUrl('/refresh',
        { skipLocationChange: true }).then(() =>
          this.router.navigate(["/employee-dashboard"]));
    })
  }
}

declare var $: any;
$(document).ready(function () {
  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active');
    $('#content').toggleClass('active');
  });
});


