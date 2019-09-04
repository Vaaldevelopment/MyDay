import { Component, OnInit, Input } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid'

import { UserLeaveModel } from '../../models/user-leave-model'
import { UserLeaveService } from '../../services/user-leave.service'
import { UserModel } from '../../models/user-model';
import { UserDataService } from 'src/app/services/user-data.service';
import { HolidayModel } from '../../models/holiday-model';
import { HolidayService } from '../../services/holiday.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

// import * as $ from 'jquery';
// import * as moment from 'moment';
// import 'fullcalendar';
declare var google: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userLeave: UserLeaveModel
  user: UserModel;
  holiday: HolidayModel;
  holidayList = [];

  chartData: any[];
  calendarPlugins = [dayGridPlugin];
  events: any[] = [

    { title: 'A', date: '2019-07-01', color: '#56EAEF', textColor: 'white' },
    { title: 'R', date: '2019-07-02', color: '#EF7B56', textColor:'white'  },
    { title: 'C', date: '2019-07-03', color: '#9D56EF', textColor:'white' },
    { title: 'R', date: '2019-09-01', color: '#EF7B56', textColor:'white'  },
    { title: 'C', date: '2019-09-03', color: '#9D56EF', textColor:'white' },
    { title: 'R', date: '2019-07-11', color: '#EF7B56', textColor:'white'  },
    { title: 'C', date: '2019-09-08', color: '#9D56EF', textColor:'white' },
    { title: '09:00 - 8', date: '2019-09-09', color: '#cccccc', textColor:'black'  },  
    
    { title: '09:00 - 6.45', date: '2019-09-02', color: '#cccccc', textColor:'black'  },
    
    { title: '09:00 - 5', date: '2019-09-10', color: '#cccccc', textColor:'red'  }, 
    { title: '09:00 - 5.30', date: '2019-09-04', color: '#cccccc', textColor:'red'  },  
    
    { title: '09:00 - 8', date: '2019-09-05', color: '#cccccc', textColor:'black'  }, 
    
    { title: '09:00 - 8', date: '2019-09-06', color: '#cccccc', textColor:'black'  }, 
    
    { title: '09:00 - 8', date: '2019-09-07', color: '#cccccc', textColor:'black'  }, 
    
    { title: '09:00 - 8', date: '2019-09-11', color: '#cccccc', textColor:'black'  },  

    { title: '09:00 - 8', date: '2019-09-12', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-13', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-14', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-15', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-16', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-17', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-18', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-19', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-20', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-21', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-22', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-23', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-24', color: '#cccccc', textColor:'black'  },  

    { title: '09:00 - 8', date: '2019-09-25', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-09-26', color: '#cccccc', textColor:'black'  },  

    { title: '09:00 - 8', date: '2019-09-27', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-28', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-29', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-30', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-09-31', color: '#cccccc', textColor:'black'  }, 


    { title: '09:00 - 8', date: '2019-07-09', color: '#cccccc', textColor:'black'  },
    
    { title: '09:00 - 8', date: '2019-07-08', color: '#cccccc', textColor:'black'  }, 
    
    { title: '09:00 - 8', date: '2019-07-10', color: '#cccccc', textColor:'black'  }, 
    
    { title: '09:00 - 8', date: '2019-07-04', color: '#cccccc', textColor:'black'  }, 
    { title: '09:00 - 8', date: '2019-07-05', color: '#cccccc', textColor:'black'  }, 
    
    { title: '09:00 - 8', date: '2019-07-06', color: '#cccccc', textColor:'black'  },
    
    { title: '09:00 - 8', date: '2019-07-07', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-12', color: '#cccccc', textColor:'black'  },  

    { title: '09:00 - 8', date: '2019-07-13', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-07-14', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-07-15', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-07-16', color: '#cccccc', textColor:'black'  },
    { title: '09:00 - 8', date: '2019-07-17', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-18', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-19', color: '#cccccc', textColor:'black'  },  

    { title: '09:00 - 8', date: '2019-07-20', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-21', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-22', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-23', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-24', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-07-25', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-26', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-27', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-28', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-29', color: '#cccccc', textColor:'black'  },

    { title: '09:00 - 8', date: '2019-07-30', color: '#cccccc', textColor:'black'  }, 

    { title: '09:00 - 8', date: '2019-07-31', color: '#cccccc', textColor:'black'  },

  ];
  apply: boolean = true;
  edit: boolean;
  request: boolean;
  employeeCode: any;
  futureHoliday: any[];

  constructor(private userLeaveService: UserLeaveService, private router: Router, private userDataService: UserDataService, private holidayService: HolidayService,
    private datepipe: DatePipe) {
    userLeave: UserLeaveModel
    this.userLeave = new UserLeaveModel()
    this.user = new UserModel()
    this.holiday = new HolidayModel()
  }


  ngOnInit() {
    this.onLoadData();
    this.userLeaveList()
    this.drawChart(this.chartData);
    // $('#full-calendar').fullCalendar(
    //   this.defaultConfigurations
    // );
  }


  drawChart(chartData) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      var chartData = [
        ['Leave Type', 'Count', { role: "style" }],
        ['CASUAL LEAVES', 6, "#56EAEF"],
        ['EARNED LEAVES', 5, "#FDB45C"],
        ['UNPAID LEAVES', 2, "#707070"],
        ['COMP OFF', 1, "#949FB1"]
      ];
      // const val = ['CASUAL LEAVES', 5 ];
      // chartData.push(val);


      var data = google.visualization.arrayToDataTable(chartData);

      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,

                       { calc: "stringify",
                         sourceColumn: 1,
                         type: "string",
                         role: "annotation" },
                       2]);
    var options = {
      width: 280,
      height: 190,
      bar: {groupWidth: "90%"},
      legend: { position: "none" },
      backgroundColor: '#f7f7f7'
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('myChart'));
    chart.draw(view, options);
  }

  google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawTimeChart);

      function drawTimeChart() {
        var data = google.visualization.arrayToDataTable([
          ['Date', 'Time'],
          ['1',  6],
          ['2',  6.45],
          ['3',  9],
          ['4',  9.10],
          ['5',  6],
          ['6',  6.45],
          ['7',  9],
          ['8',  9.10],
          ['9',  6],
          ['10',  6.45],
          ['11',  9],
          ['12',  9.10],
          ['13',  6],
          ['14',  6.45],
          ['15',  9],
          ['16',  9.10],
          ['17',  6],
          ['18',  6.45],
          ['19',  9],
          ['20',  9.10],
          ['21',  6],
          ['22',  6.45],
          ['23',  9],
          ['24',  9.10],
          ['25',  6],
          ['26',  6.45],
          ['27',  9],
          ['28',  9.10],
          ['29',  6],
          ['30',  6.45],
          ['31',  9],
        ]);

        var options = {
          title: 'Company Performance',
          hAxis: {title: 'Date',  titleTextStyle: {color: '#333'}},
          vAxis: {minValue: 0}
        };

        var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      }
}

  onLoadData() {
    this.holidayService.getHolidays().subscribe((response) => {
      this.holidayList = JSON.parse(response["_body"]).holidays;
      var today = new Date();
      this.futureHoliday = this.holidayList.filter(p => new Date(p.date) >= new Date());
      console.log(this.futureHoliday)
    }, (error) => {
      console.log(error);
    })
  }


  userLeaveList() {
    debugger;
    this.userLeaveService.userLeaveList().subscribe((response) => {
      console.log(response)
    }, (error) => {
      console.log(error);
    })
  }

}
