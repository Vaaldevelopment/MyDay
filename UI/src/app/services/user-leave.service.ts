import { Injectable } from '@angular/core';
import * as leaveGlobal from '../models/global'
import { Http } from '@angular/http'

@Injectable({
  providedIn: 'root'
})
export class UserLeaveService {

  constructor(private http: Http) {}

  userLeaveList() {
      return this.http.get(leaveGlobal.leave_API + 'user/leave/list')
  }
}
