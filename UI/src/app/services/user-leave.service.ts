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
  checkHoliday(editLeaveData){
    return this.httpHelper.postMethod('user/leave/checkHoliday', editLeaveData)
  }
  calculateTotalLeaveBalance(leaveData){
    return this.httpHelper.postMethod('user/leave/calculateTotalLeaveBalance', leaveData)
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
  getReportedEmpData(selectedEmpId){
    return this.httpHelper.getMethod('manager/user?userId=' + selectedEmpId);
  }
  updateLeaveStatus(leaveData){
    return this.httpHelper.patchMethod('manager/user/changeLeaveStatus', leaveData);
  }
  getChecklistUserLeave(checkList){
    return this.httpHelper.postMethod('manager/user/checklist', checkList)
  }
}
