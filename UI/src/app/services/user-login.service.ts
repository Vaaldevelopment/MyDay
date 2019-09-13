import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';


@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  constructor(private httpHelper: HttpHelperService) { 
  }

  userLogin(loginDetails) {
    if (loginDetails.email == 'admin@vaal-triangle.com') {
      // return this.http.post(leaveGlobal.leave_API + 'admin/login', loginDetails)
      return this.httpHelper.postMethod('admin/login',loginDetails)
    } else { 
      // return this.http.post(leaveGlobal.leave_API + 'users/login', loginDetails)
      return this.httpHelper.postMethod('users/login',loginDetails)
    }
  }

  userLogout() {
    // const headers = new Headers();
    // headers.append('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
    // this.setContentType(headers);
    // const options = new RequestOptions({ headers: headers });
    // return this.http.post(leaveGlobal.leave_API + 'users/logout', null, options)
    return this.httpHelper.postMethod('users/logout',null)
    
  }

  managerReportingEmp(){
    return this.httpHelper.getMethod('manager/user/list')
  }
  recManagerReportingEmp(){
    return this.httpHelper.getMethod('manager/user/reclist')
  }
}

