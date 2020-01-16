import { Component } from '@angular/core';
import { UserLoginService } from './services/user-login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MyDay';
  config: any;
  showHeader: boolean;
  constructor(private router: Router, private userLoginService: UserLoginService) {
    this.ClearEditCandidateId();
  }

  ngOnInit() {
    //   let context = this;
    //   window.addEventListener("beforeunload", function (e) {
    //     let currentUser = localStorage.getItem('userToken');
    //     if(currentUser){
    //       context.logoutOnClose();
    //     }
    // });
    $(function () {
      $('body').tooltip({
        selector: '[data-toggle="tooltip"]'
      }).click(function () {
        $('[data-toggle="tooltip"]').tooltip("hide");
      });
    })
  }

  // logoutOnClose(){
  //   debugger
  //   this.userLoginService.userLogout().subscribe((response) => {
  //     localStorage.clear();
  //     this.router.navigate(['/login']);
  //   }, (error) => {
  //     console.log(error);
  //   })
  //}
  ClearEditCandidateId() {
    sessionStorage.removeItem('EditCandidateId');
  }
  checkUserToken() {
    if (sessionStorage.getItem('adminToken') || sessionStorage.getItem('userToken')) {
      return true;
    }
  }
  // ngOnDestroy() {
  //   debugger
  //   console.log('Service destroy')
  //   localStorage.clear();
  // }
}
