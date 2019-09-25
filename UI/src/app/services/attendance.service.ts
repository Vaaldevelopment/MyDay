import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private httpHelper: HttpHelperService) { }

  addAttendance(attendance) {
    return this.httpHelper.postMethod('hr/attendance/add', attendance);
  }
  getAttendance(){
    return this.httpHelper.getMethod('user/attendance/list');
  }
  getReportedEmpAttendance(selectedEmp){
    return this.httpHelper.getMethod('manager/attendance/list?empId='+ selectedEmp);
  }
  hrGetAttendance(){
    return this.httpHelper.getMethod('hr/attendance/list');
  }
  managerGetAttendance(){
    return this.httpHelper.getMethod('managere/attendance/list');
  }
  adminGetAttendance(){
    return this.httpHelper.getMethod('admin/attendance/list');
  }
  updateAttendance(attendance){
    return this.httpHelper.patchMethod('hr/attendance/update', attendance);
  }
  deleteAttendance(attendanceId){
    return this.httpHelper.deleteMethod('hr/attendance/delete?_id' + attendanceId);
  }
}


