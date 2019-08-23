import { Injectable } from '@angular/core';
import * as leaveGlobal from '../models/global'
import { Http, Headers, RequestOptions } from '@angular/http'
import { HttpHelperService } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  constructor(private httpHelper: HttpHelperService) { }

  addHoliday(holiday) {
    return this.httpHelper.postMethod('hr/holiday/add', holiday);
  }
  getHolidayList() {
    return this.httpHelper.getMethod('hr/holiday/list');
  }
  updateHoliday(holiday) {
    return this.httpHelper.patchMethod('hr/holiday/update', holiday);
  }
  deleteholiday(holidayDate) {
    return this.httpHelper.deleteMethod('hr/holiday/delete?date=' + holidayDate);
  }
}
