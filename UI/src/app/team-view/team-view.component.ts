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

  constructor(private router: Router, private userLoginService: UserLoginService, private userLeaveService: UserLeaveService, private holidayService: HolidayService, ) {

  }
  ngOnDestroy(){
    $('#team-view').removeClass('active-nav');
  }

  ngOnInit() {
    $('#team-view').addClass('active-nav');
    //Binding holidays
    this.holidayService.getHolidays().subscribe((response) => {
      this.holidayList = JSON.parse(response["_body"]).holidays;

      for (let i = 0; i < this.holidayList.length; i++) {
        this.events.push({
          title: this.holidayList[i].description,
          date: this.holidayList[i].date,
          color: 'red',
          textColor: 'white',
          classNames: 'holiday'
        })
      }
    }, (error) => {
      console.log(error);
    });
    this.userCheckList = this.userLoginService.checkListArray;

    //Check User Leaves

    this.userCheckList = this.userLoginService.checkListArray;

    this.userLeaveService.getChecklistUserLeave(this.userCheckList).subscribe((response) => {

      this.checkListUserData = JSON.parse(response["_body"]).checkListUser;
      this.checkListUserLeaveData = JSON.parse(response["_body"]).checkListUserLeave;

      for (let i = 0; i < this.checkListUserLeaveData.length; i++) {
        for (let j = 0; j < this.checkListUserLeaveData[i].length; j++) {
          var eventColor: any;
          var dates = [];
          var className = 'fullDay';

          //Get dates for every Leave
          this.userLeaveService.getLeaveDates(this.checkListUserLeaveData[i][j]).subscribe((response) => {
            dates = JSON.parse(response["_body"]).leaveDates;

            if ((this.checkListUserLeaveData[i][j].fromSpan == 'FIRST HALF') || (this.checkListUserLeaveData[i][j].toSpan == 'FIRST HALF'))
              className = 'firstHalf';
            else if ((this.checkListUserLeaveData[i][j].fromSpan == 'SECOND HALF') || (this.checkListUserLeaveData[i][j].toSpan == 'SECOND HALF'))
              className = 'secondHalf';
            else
              className = 'fullDay';
            switch (this.checkListUserLeaveData[i][j].leaveStatus) {
              case 'Pending': eventColor = '#FFC400';
                break;
              case 'Approved': eventColor = '#56EAEF';
                break;
              case 'Cancelled': eventColor = '#9D56EF';
                break;
              case 'Rejected': eventColor = '#EF7B56';
                break;
            }

            var start = dates[0];
            for (let k = 0; k < dates.length - 1; k++) {
              var date1 = new Date(dates[k]).getDate();
              var date2 = new Date(dates[k + 1]).getDate();
              if (date2 != date1 + 1) {
                this.events.push({
                  title: this.checkListUserData[i].firstName + ' ' + this.checkListUserData[i].lastName,
                  start: new Date(start),
                  end: new Date(dates[k]),
                  color: eventColor,
                  textColor: 'white',
                  // classNames: className
                });
                start = dates[k + 1];
              }
            }

            this.events.push({
              title: this.checkListUserData[i].firstName + ' ' + this.checkListUserData[i].lastName,
              start: new Date(start),
              end: new Date(dates[dates.length - 1]),
              color: eventColor,
              textColor: 'white',
              // classNames: className
            });
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
