import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';


@Injectable({
  providedIn: 'root'
})
export class UserLoginService {

  checkListArray: any;
  constructor(private httpHelper: HttpHelperService) { 
  }

  userLogin(loginDetails) {
    if (loginDetails.email == 'admin@vaal-triangle.com') {
      return this.httpHelper.postMethod('admin/login',loginDetails)
    } else { 
      return this.httpHelper.postMethod('users/login',loginDetails)
    }
  }
  userLogout() {
    return this.httpHelper.postMethod('users/logout',null)
  }
  logoutAll() {
    return this.httpHelper.postMethod('users/logoutall',null)
  }
  managerReportingEmp(){
    return this.httpHelper.getMethod('manager/user/list')
  }
  recManagerReportingEmp(){
    return this.httpHelper.getMethod('manager/user/reclist')
  }
  notification(){
    return this.httpHelper.getMethod('user/notification')
  }
  notificationFlag(notification){
    return this.httpHelper.postMethod('user/setNotificationFlag',notification)
  }
  allNotificationFlag(notification){
    return this.httpHelper.postMethod('user/setAllNotificationFlag',notification)
  }
  getFromUserdata(){
    return this.httpHelper.getMethod('user/getNotificationFromUserData')
  }
  clearAllNotification(){
    return this.httpHelper.getMethod('user/clearAllNotificationFlag')
  }
}

