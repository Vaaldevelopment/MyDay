import { Injectable } from '@angular/core';
import * as leaveGlobal from '../models/global'
import { Http, Headers, RequestOptions } from '@angular/http'
@Injectable({
  providedIn: 'root'
})
export class HttpHelperService {
  options: RequestOptions;
  constructor(private http: Http) { }

  attachHeader() {
    if (sessionStorage.getItem('userToken')) {
      const headers = new Headers();
      headers.append('Authorization', 'Bearer ' + sessionStorage.getItem('userToken'));
      this.setContentType(headers);
      this.options = new RequestOptions({ headers: headers });
    }
    if (sessionStorage.getItem('adminToken')) {
      const headers = new Headers();
      headers.append('Authorization', 'Bearer ' + sessionStorage.getItem('adminToken'));
      this.setContentType(headers);
      this.options = new RequestOptions({ headers: headers });
    }
  }

  private setContentType(headers: Headers) {
    headers.append('Content-Type', 'application/json;charset=utf-8');

  }

  getMethod(url) {
    this.attachHeader();
    return this.http.get(leaveGlobal.leave_API + url, this.options);
  }

  postMethod(url, body) {
    this.attachHeader();
    return this.http.post(leaveGlobal.leave_API + url, body, this.options)
  }

  patchMethod(url, body) {
    this.attachHeader();
    return this.http.patch(leaveGlobal.leave_API + url, body, this.options)
  }

  deleteMethod(url) {
    this.attachHeader();
    return this.http.delete(leaveGlobal.leave_API + url, this.options)
  }

}
