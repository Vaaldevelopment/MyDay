import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private httpHelper: HttpHelperService) { }
  settingsData(){
    return this.httpHelper.getMethod('settings/department/list');
  }
  addDepartment(department){
      return this.httpHelper.postMethod('settings/department/add', department);
  }
  updateDepartment(department){
    return this.httpHelper.patchMethod('settings/department/edit', department);
  }

  //Leaves

  settingsLeavesData(){
    return this.httpHelper.getMethod('settings/defaultleaves/list');
  }
  addDefaultLeave(leaves){
    return this.httpHelper.postMethod('settings/defaultleaves/add', leaves);
  }
  updateDefaultLeave(leaves){
    return this.httpHelper.patchMethod('settings/defaultleaves/edit', leaves);
  }
}
