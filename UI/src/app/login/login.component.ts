import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../models/user-model';
import { UserLoginService } from '../services/user-login.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  user: UserModel
  errorFlag = false;
  errorMessage: string;
  constructor(private router: Router, private userLoginService: UserLoginService) {
    this.user = new UserModel()
  }

  ngOnInit() {
    localStorage.clear();
  }

  userLogin() {
    this.userLoginService.userLogin(this.user).subscribe((response) => {
      if (response) {
        if (this.user.email == 'admin@vaal-triangle.com' && JSON.parse(response["_body"]).adminToken) {
          localStorage.setItem('adminToken', JSON.parse(response["_body"]).adminToken);
          localStorage.setItem('userName', 'Admin')
          this.router.navigate(['/add-data']);
        }
        else if (JSON.parse(response["_body"]).user.isHR == true) {
          localStorage.setItem('userToken', JSON.parse(response["_body"]).token);
          localStorage.setItem('userName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName)
          localStorage.setItem('userID', JSON.parse(response["_body"]).user._id);
          localStorage.setItem('isHR', JSON.parse(response["_body"]).user.isHR);
          this.router.navigate(['/add-data']);
        }
        else {
          localStorage.setItem('userToken', JSON.parse(response["_body"]).token);
          localStorage.setItem('userName', JSON.parse(response["_body"]).user.firstName + ' ' + JSON.parse(response["_body"]).user.lastName);
          localStorage.setItem('userID', JSON.parse(response["_body"]).user._id);
          this.router.navigate(['/employee-dashboard']);
        }
      }
    }, (error) => {
      console.log(error);
      this.errorFlag = true;
      this.errorMessage = error._body;
      if(!error._body){
        this.errorMessage = 'Login Failed';
      }
    })
  }
}

