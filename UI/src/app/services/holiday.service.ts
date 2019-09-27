import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  constructor(private httpHelper: HttpHelperService) { }

  addHoliday(holiday) {
    return this.httpHelper.postMethod('hr/holiday/add', holiday);
  }
  adminAddHoliday(holiday) {
    return this.httpHelper.postMethod('admin/holiday/add', holiday);
  }
  getHolidayList() {
    return this.httpHelper.getMethod('hr/holiday/list');
  }
  adminGetHolidayList() {
    return this.httpHelper.getMethod('admin/holiday/list');
  }
  updateHoliday(holiday) {
    return this.httpHelper.patchMethod('hr/holiday/update', holiday);
  }
  adminUpdateHoliday(holiday) {
    return this.httpHelper.patchMethod('admin/holiday/update', holiday);
  }
  deleteholiday(holidayDate) {
    return this.httpHelper.deleteMethod('hr/holiday/delete?date=' + holidayDate);
  }
  admindeleteholiday(holidayDate) {
    return this.httpHelper.deleteMethod('admin/holiday/delete?date=' + holidayDate);
  }

  getHolidays() {
    return this.httpHelper.getMethod('user/holiday/list');
  }
}
