import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(private httpHelper: HttpHelperService) {
  }

  getEmpDataAdmin() {
    return this.httpHelper.getMethod('admin/user/list');
  }
  getEmpData() {
    return this.httpHelper.getMethod('hr/user/list');
  }

  duplicateEmpCode(employeeCode) {
    return this.httpHelper.getMethod('hr/user/checkDuplicateEmpCode?employeeCode=' + employeeCode);
  }

  adminAddEmployeeData(user) {
    return this.httpHelper.postMethod('admin/createuser', user);
  }
  addEmployeeData(user) {
    return this.httpHelper.postMethod('hr/user/create', user);
  }
  updateEmployeeData(userData) {
    return this.httpHelper.patchMethod('hr/user/update', userData);
  }
  adminupdateEmployeeData(userData) {
    return this.httpHelper.patchMethod('admin/user/update', userData);
  }
  deleteEmployee(employeeCode) {
    return this.httpHelper.deleteMethod('hr/user/delete?employeeCode=' + employeeCode);
  }
  admindeleteEmployee(employeeCode) {
    return this.httpHelper.deleteMethod('admin/user/delete?employeeCode=' + employeeCode);
  }
}
