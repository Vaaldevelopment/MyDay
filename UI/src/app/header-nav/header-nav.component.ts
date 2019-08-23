import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../models/user-model';
import { UserLoginService } from '../services/user-login.service'

@Component({
  selector: 'app-header-nav',
  templateUrl: './header-nav.component.html',
  styleUrls: ['./header-nav.component.scss']
})
export class HeaderNavComponent implements OnInit {

  notificationBell: boolean;
  userName: string;
  adminLog = false;



  constructor(private router: Router, private userLoginService: UserLoginService) {
    this.notificationBell = true;
  }

  ngOnInit() {
    this.userName = localStorage.getItem('userName');
    if(localStorage.getItem('adminToken')){
      this.adminLog = true;
    } else {
      this.adminLog = false;
    }
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
}

declare var $: any;

$(document).ready(function () {
  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active');
    $('#content').toggleClass('active');
  });
});


