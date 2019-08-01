import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MyDay';
  config: any;
  showHeader : boolean;
  constructor() {
    this.ClearEditCandidateId();
  }
  ClearEditCandidateId() {
    localStorage.removeItem('EditCandidateId');
  }
  checkUserToken() {
    if (localStorage.getItem('adminToken') || localStorage.getItem('userToken')) {
      return true;
    }
  }
}
