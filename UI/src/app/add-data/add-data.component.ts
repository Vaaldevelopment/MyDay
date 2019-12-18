import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss']
})
export class AddDataComponent implements OnInit {
  checkUserLog = false;
  constructor() { }

  ngOnInit() {
    this.checkUser();
  }

  checkUser() {
    if (sessionStorage.getItem('adminToken')) {
      this.checkUserLog = true;
    }
  }
}
