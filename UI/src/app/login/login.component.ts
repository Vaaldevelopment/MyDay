import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../models/user-model';
import { UserLoginService } from '../services/user-login.service'

declare var $ : any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  user: UserModel
  errorFlag = false;
  errorMessage: string;
  isTextFieldType: boolean;
  constructor(private router: Router, private userLoginService: UserLoginService) {
    this.user = new UserModel()
  }

  ngOnInit() {
    sessionStorage.clear();
  }

  userLogin() {
    this.userLoginService.userLogin(this.user).subscribe((response) => {
      if (response) {
        if (this.user.email == 'admin@vaal-triangle.com' && JSON.parse(response["_body"]).adminToken) {
          sessionStorage.setItem('adminToken', JSON.parse(response["_body"]).adminToken);
          sessionStorage.setItem('userName', 'Admin')
          this.router.navigate(['/add-data']);
        }
        else if (JSON.parse(response["_body"]).user.isHR == true) {
          sessionStorage.setItem('userToken', JSON.parse(response["_body"]).token);
          sessionStorage.setItem('userName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName)
          sessionStorage.setItem('userID', JSON.parse(response["_body"]).user._id);
          sessionStorage.setItem('isHR', JSON.parse(response["_body"]).user.isHR);
          sessionStorage.setItem('RepUserName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName)
          this.router.navigate(['/employee-dashboard']);
        }
        else {
          sessionStorage.setItem('userToken', JSON.parse(response["_body"]).token);
          sessionStorage.setItem('userName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName);
          sessionStorage.setItem('userID', JSON.parse(response["_body"]).user._id);
          sessionStorage.setItem('RepUserName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName)
          this.router.navigate(['/employee-dashboard']);
        }
      }
    }, (error) => {
      console.log(error);
      this.errorFlag = true;
      this.errorMessage = error._body;
      if (!error._body) {
        this.errorMessage = 'Login Failed';
      }
    })
  }
  showPassword (){
    this.isTextFieldType = !this.isTextFieldType;
}

}