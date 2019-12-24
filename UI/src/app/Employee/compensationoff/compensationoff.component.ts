import { Component, OnInit } from '@angular/core';
import { Compensationoff } from 'src/app/models/compensationoff.model';
import { UserLeaveService } from 'src/app/services/user-leave.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-compensationoff',
  templateUrl: './compensationoff.component.html',
  styleUrls: ['./compensationoff.component.scss']
})
export class CompensationoffComponent implements OnInit {
  compOff: Compensationoff;
  editCompOffFlag: boolean = false;
  errorFlag = false;
  errorMessage: string;
  successFlag = false;
  successMessage: string;
  compOffList = [];
  confirmationFlag = false;
  cancelcompOffId : string;
  
  constructor(public userLeaveService: UserLeaveService, private datepipe: DatePipe) {
    this.compOff = new Compensationoff()
  }

  ngOnInit() {
    this.compOff.fromSpanCO = 'FULL DAY';
    this.compOff.toSpanCO = 'FULL DAY';
    this.loadCompOffData();
  }

  loadCompOffData(){
    this.userLeaveService.getCompOffList().subscribe((response) => {
      this.compOffList = JSON.parse(response['_body']).compOffList;
      console.log(this.compOffList)
      for (let i = 0; i < this.compOffList.length; i++) {
        if (new Date(this.compOffList[i].fromDateCO) > new Date() && this.compOffList[i].statusCO !== 'Approved') {
          this.compOffList[i].cancelFlag = true;
        }
      }
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  applyCompOff() {
    this.errorFlag = false;
    this.userLeaveService.applyCompOff(this.compOff).subscribe((response) => {
      this.printSuccessMessage('Leave Applied Successfully');
      this.loadCompOffData();
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  checkDate() {
    this.errorFlag = false;
    this.userLeaveService.checkCompOffDate(this.compOff).subscribe((response) => {
      this.compOff.compOffSpan = JSON.parse(response['_body']).compOffSpan;
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  editCompoff(editData){
    this.editCompOffFlag = true;
    this.compOff = editData
    this.compOff.fromDateCO = this.datepipe.transform(editData.fromDateCO, 'yyyy-MM-dd');
    this.compOff.toDateCO = this.datepipe.transform(editData.toDateCO, 'yyyy-MM-dd');
  }
  updateCompOff(){
    this.errorFlag = false;
    this.userLeaveService.updateCompOff(this.compOff).subscribe((response) => {
      this.printSuccessMessage('Update Comp Off Successfully')
      this.loadCompOffData();
      this.compOff = new Compensationoff()
      this.editCompOffFlag = false;
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  
  }

  resetCompOffUpdate(){
    this.editCompOffFlag = false;
  }

  cancelCompOff(compOffCancel){
    this.errorFlag = false;
    this.successFlag = false;
    this.confirmationFlag = true;
    this.cancelcompOffId = compOffCancel._id;
  }
  confirmCancelCompOff() {
    this.successFlag = false;
    this.userLeaveService.cancelUserCompOff(this.cancelcompOffId).subscribe((response) => {
      this.printSuccessMessage('Comp Off Cancelled Successfully');
      this.confirmationFlag = false;
      this.compOff = new Compensationoff()
      this.loadCompOffData();
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  cancleCancelCompOff() {
    this.confirmationFlag = false;
  }
  printSuccessMessage(message) {
    this.successFlag = true;
    this.successMessage = message;
    setTimeout(function () {
      $('.myAlert-top').hide();
    }, 3000);
  }
}
