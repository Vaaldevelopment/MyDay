import { Component, OnInit , Input} from '@angular/core';
declare var google: any;

@Component({
  selector: 'app-my-time',
  templateUrl: './my-time.component.html',
  styleUrls: ['./my-time.component.scss']
})
export class MyTimeComponent implements OnInit {

  chartData: any[];
  constructor() { }

  ngOnInit() {
    this.drawChart(this.chartData);
  }

  drawChart(chartData){
    google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['Date', 'Time'],
          ['1',  1000],
          ['2',  1170],
          ['3',  660],
          ['4',  1030],
          ['5',  1000],
          ['6',  1170],
          ['7',  660],
          ['8',  1030],
          ['9',  1000],
          ['10',  1170],
          ['11',  660],
          ['12',  1030],
          ['13',  1000],
          ['14',  1170],
          ['15',  660],
          ['16',  1030],
          ['17',  1000],
          ['18',  1170],
          ['19',  660],
          ['20',  1030],
          ['21',  1000],
          ['22',  1170],
          ['23',  660],
          ['24',  1030],
          ['25',  1000],
          ['26',  1170],
          ['27',  660],
          ['28',  1030],
          ['29',  1000],
          ['30',  1170],
          ['31',  660],
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
}
