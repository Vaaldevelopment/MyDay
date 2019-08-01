import { Injectable } from '@angular/core';
import * as leaveGlobal from '../models/global'
import { Http, Headers, RequestOptions } from '@angular/http'


@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  constructor(private http: Http) { }

  userLogin(loginDetails) {
    if (loginDetails.email == 'admin@vaal-triangle.com') {
      return this.http.post(leaveGlobal.leave_API + 'admin/login', loginDetails)
    } else {
      return this.http.post(leaveGlobal.leave_API + 'users/login', loginDetails)
    }
  }

  userLogout() {
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
    this.setContentType(headers);
    const options = new RequestOptions({ headers: headers });
    return this.http.post(leaveGlobal.leave_API + 'users/logout', null, options)
  }

  private setContentType(headers: Headers) {
    headers.append('Content-Type', 'application/json;charset=utf-8');

  }
}

