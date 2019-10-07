import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid'
import { Router } from '@angular/router';
import { UserLoginService } from '../services/user-login.service';
import { UserLeaveService } from '../services/user-leave.service';
import { HolidayModel } from '../models/holiday-model';
import { HolidayService } from '../services/holiday.service';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],

})
export class TeamViewComponent implements OnInit {

  userCheckList: any;
  calendarPlugins = [dayGridPlugin];
  checkListUserData = [];
  checkListUserLeaveData = [];
  holidayList = [];

  events: any[] = [];

  constructor(private router: Router, private userLoginService: UserLoginService, private userLeaveService: UserLeaveService, private holidayService: HolidayService,) {

  }


  ngOnInit() {

    //Binding holidays
    this.holidayService.getHolidays().subscribe((response) => {
      this.holidayList = JSON.parse(response["_body"]).holidays;   

    console.log('holidays: '+ this.holidayList)
    for(let i=0; i< this.holidayList.length; i++){
      this.events.push({
        title: this.holidayList[i].description,
        date: this.holidayList[i].date,
        color: 'red',
        textColor: 'white',
      })
    }
     },(error) => {
      console.log(error);
    });
    this.userCheckList = this.userLoginService.checkListArray;
    console.log(this.checkListUserData);
    
    //Check User Leaves

    debugger
    this.userCheckList = this.userLoginService.checkListArray;
    console.log(this.userCheckList)

    this.userLeaveService.getChecklistUserLeave(this.userCheckList).subscribe((response) => {
      
      this.checkListUserData = JSON.parse(response["_body"]).checkListUser;
      this.checkListUserLeaveData = JSON.parse(response["_body"]).checkListUserLeave;
      console.log(this.checkListUserData)
      console.log(this.userCheckList)
      
      console.log('User Data:' + this.checkListUserData);
      console.log('Leaves:' + this.checkListUserLeaveData);
      
      for (let i = 0; i < this.checkListUserLeaveData.length; i++) {
        for (let j = 0; j < this.checkListUserLeaveData[i].length; j++) {
          var eventColor: any;
          var dates = [];
          
          //Get dates for every Leave
          this.userLeaveService.getLeaveDates(this.checkListUserLeaveData[i][j]).subscribe((response) => {
            dates = JSON.parse(response["_body"]).leaveDates;
            console.log('Dates:' + dates)

            for (let k = 0; k < dates.length; k++) {
              switch (this.checkListUserLeaveData[i][j].leaveStatus) {
                case 'Pending': eventColor = '#9B870C';
                  break;
                case 'Approved': eventColor = '#56EAEF';
                  break;
                case 'Cancelled': eventColor = '#9D56EF';
                  break;
                case 'Rejected': eventColor = '#EF7B56';
                  break;
              }
              this.events.push({
                title: this.checkListUserData[i].firstName + ' ' + this.checkListUserData[i].lastName,
                date: new Date(dates[k]),
                color: eventColor,
                textColor: 'white'
              });
            }
          }, (error) => {
            console.log(error);
          });

        }
      }

    }, (error) => {
      console.log(error);
    })

    
  }
}
