import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class LeavedataService {

  constructor(private httpHelper: HttpHelperService) {
  }

  postEmployeeLeaveData(EmpLeaveData) {
    return this.httpHelper.postMethod('user/leavedata/add', EmpLeaveData);
  }

  getEmployeeLeaveData(selectedYear, selectedEmpId){
    return this.httpHelper.getMethod('user/leavedata/employee?year=' + selectedYear+'&empId='+selectedEmpId);
  }
}
