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
  adminLog = false;
  isManagerFlag = false;
  managerEmpList = [];
  recManagerEmpList = [];
  checkedList: any;
  masterSelected: boolean;
  searchText: string = "";
  selected_count: number = 0;



  constructor(private router: Router, private userLoginService: UserLoginService) {
    this.notificationBell = true;
    // this.getSelected();
  }

  ngOnInit() {
    this.userName = localStorage.getItem('userName');
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
      console.log(this.managerEmpList)
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
        console.log(this.managerEmpList)
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
    this.checkedList = [];
    for (var i = 0; i < this.managerEmpList.length; i++) {
      if (this.managerEmpList[i].isSelected)
        this.checkedList.push(this.managerEmpList[i]);
    }
    this.checkedList = JSON.stringify(this.checkedList);
    console.log(this.checkedList)
  }
  // getSelected() {
  //   this.selected_ = this.managerEmpList.filter(s => {
  //     return s.selected;
  //   });
  //   this.selected_count = this.selected_games.length;
  //   //alert(this.selected_games);    
  // }
   //Clear term types by user
  //  clearFilter() {
  //   this.searchText = "";
  // }

  selectedEmpDashboard(empId){
    localStorage.setItem('selectedEmpId', empId);
    this.router.navigate(['/employee-dashboard']);
  }

}

declare var $: any;
$(document).ready(function () {
  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active');
    $('#content').toggleClass('active');
  });
});


