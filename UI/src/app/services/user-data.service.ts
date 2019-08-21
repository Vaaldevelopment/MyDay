import { Injectable } from '@angular/core';
import * as leaveGlobal from '../models/global'
import { Http, Headers, RequestOptions } from '@angular/http'

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  options: RequestOptions;

  constructor(private http: Http) {
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
    this.setContentType(headers);
     this.options = new RequestOptions({ headers: headers });
   }

   private setContentType(headers: Headers) {
    headers.append('Content-Type', 'application/json;charset=utf-8');

  }

  getEmpData(){
    return this.http.get(leaveGlobal.leave_API + 'hr/user/list', this.options) ;
  }

  duplicateEmpCode(employeeCode) 
  {
    return this.http.get(leaveGlobal.leave_API + 'hr/user/checkDuplicateEmpCode?employeeCode=' + employeeCode , this.options);
  }
  addEmployeeData(user){
    return this.http.post(leaveGlobal.leave_API + 'hr/user/create' , user, this.options)
  }
}
