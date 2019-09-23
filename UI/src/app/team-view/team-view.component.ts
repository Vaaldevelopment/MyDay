
import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid'
import { Router } from '@angular/router';
import { UserLoginService } from '../services/user-login.service';
import { UserLeaveService } from '../services/user-leave.service';


@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
 
})
export class TeamViewComponent implements OnInit{

  userCheckList : any;
  calendarPlugins = [dayGridPlugin];
  checkListUserData = [];
  checkListUserLeaveData = [];

  events: any[] = [
    { title: 'Employee 1', date: '2019-07-01', color: '#56EAEF', textColor: 'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 1', date: '2019-07-01', color: '#EF7B56', textColor:'white'  },
    { title: 'Emplyee 2', date: '2019-07-01', color: '#9D56EF', textColor:'white' },
    { title: 'Employee 4', date: '2019-07-05', color: '#56EAEF', textColor:'white' }
  ];

  constructor(private router: Router, private userLoginService: UserLoginService, private userLeaveService: UserLeaveService) {
   
  }

  ngOnInit(){
    this.userCheckList = this.userLoginService.checkListArray;
    this.userLeaveService.getChecklistUserLeave(this.userCheckList).subscribe((response) => {
      this.checkListUserData = JSON.parse(response["_body"]).checkListUser;
      this.checkListUserLeaveData = JSON.parse(response["_body"]).checkListUserLeave;
      
    }, (error) => {
      console.log(error);
    })
  }
}
