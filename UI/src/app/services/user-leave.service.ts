import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class UserLeaveService {

  constructor(private httpHelper: HttpHelperService) { }

  getUserLeaveList() {
    return this.httpHelper.getMethod('user/leave/list');
  }
  getPendingActionList() {
    return this.httpHelper.getMethod('user/pendingaction/list');
  }
  checkUserLeaveSpan(leaveData) {
    return this.httpHelper.postMethod('user/leave/checkLeaveSpan', leaveData);
  }
  // UserLeaveSpanCount(leaveData) {
  //   return this.httpHelper.postMethod('user/leave/leaveSpanCount', leaveData);
  // } 
  checkHoliday(editLeaveData) {
    return this.httpHelper.postMethod('user/leave/checkHoliday', editLeaveData)
  }
  calculateTotalLeaveBalance(leaveData) {
    return this.httpHelper.postMethod('user/leave/calculateTotalLeaveBalance', leaveData)
  }
  applyUserLeave(leaveData) {
    return this.httpHelper.postMethod('user/leave/apply', leaveData);
  }
  updateUserLeave(updateLeaveData) {
    return this.httpHelper.postMethod('user/leave/update', updateLeaveData);
  }
  deleteUserLeave(leaveId) {
    return this.httpHelper.deleteMethod('user/leave/delete?id=' + leaveId);
  }
  cancelUserLeave(leaveId) {
    return this.httpHelper.getMethod('user/leave/cancel?leaveId=' + leaveId);
  }
  getReportedEmpData(selectedEmpId) {
    return this.httpHelper.getMethod('manager/user?userId=' + selectedEmpId);
  }
  updateLeaveStatus(leaveData) {
    return this.httpHelper.patchMethod('manager/user/changeLeaveStatus', leaveData);
  }
  getChecklistUserLeave(checkList) {
    return this.httpHelper.postMethod('manager/user/checklist', checkList)
  }
  getLeaveDates(leaveData) {
    return this.httpHelper.postMethod('user/leave/datesOfLeave', leaveData);
  }
  checkCompOffDate(compOffData) {
    return this.httpHelper.postMethod('user/compOff/checkDate', compOffData);
  }
  applyCompOff(compOffData) {
    return this.httpHelper.postMethod('user/compOff/apply', compOffData);
  }
  getCompOffList() {
    return this.httpHelper.getMethod('user/compOff/list');
  }
  getCompOffListSelectedUser(selecteUserId){
    return this.httpHelper.getMethod('user/compOff/selecteduserlist?userId='+ selecteUserId);
  }
  calCompOffSpan(compOffLeaveData){
    return this.httpHelper.postMethod('user/compOff/calSpan', compOffLeaveData);
  }
  updateCompOff(updateCompOffData){
    return this.httpHelper.postMethod('user/compOff/update', updateCompOffData);
  }
  cancelUserCompOff(comOffId){
    return this.httpHelper.getMethod('user/compOff/cancel?compOffId=' + comOffId);
  }
  changeUserCompOffStatus(changeCompOffData){
    return this.httpHelper.patchMethod('user/compOff/changecompoffstatus', changeCompOffData);
  }
  sendEmail(leaveData){
    return this.httpHelper.postMethod('send/email', leaveData);
  }
  sendUpdatedEmail(leaveData){
    return this.httpHelper.postMethod('send/updatedemail', leaveData);
  }
  sendCompOffEmail(compOffLeaveData){
    return this.httpHelper.postMethod('send/compoffemail', compOffLeaveData);
  }
  sendEmailFromManager(leaveData){
    return this.httpHelper.postMethod('send/manager/email', leaveData);
  }
  sendCompOffEmailFromManager(compOffLeaveData){
    return this.httpHelper.postMethod('send/manager/compoffemail', compOffLeaveData);
  }
}
