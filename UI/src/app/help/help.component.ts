import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  videoUrl: string;
  constructor() {

  }

  ngOnInit() {
    this.videoUrl = "sonali";
    var a = <HTMLInputElement>document.getElementById('yourlinkId'); //or grab it by tagname etc
    a.setAttribute("href",this.videoUrl)
  }

}
