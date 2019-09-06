import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class UserLeaveService {

  constructor(private httpHelper: HttpHelperService) {}

  getUserLeaveList(){
    return this.httpHelper.getMethod('user/leave/list');
  }
  checkUserLeaveSpan(leaveData){
    return this.httpHelper.postMethod('user/leave/checkLeaveSpan', leaveData);
  }
  applyUserLeave(leaveData){
    return this.httpHelper.postMethod('user/leave/apply', leaveData);
  }
  updateUserLeave(updateLeaveData){
    return this.httpHelper.postMethod('user/leave/update', updateLeaveData);
  }
  deleteUserLeave(leaveId){
    return this.httpHelper.deleteMethod('user/leave/delete?id=' + leaveId);
  }
}
