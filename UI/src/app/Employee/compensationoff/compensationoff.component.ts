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
  cancelcompOffId: string;
  managerSelectedUserIdCO: string;
  approveCompOffFlag = false;
  selecteUserId: string
  RepUserName: string
  currentDate: any;

  constructor(public userLeaveService: UserLeaveService, private datepipe: DatePipe) {
    this.compOff = new Compensationoff()
  }

  ngOnDestroy() {
    $('#compoff').removeClass('active-nav');
  }

  ngOnInit() {
    this.currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    $('#compoff').addClass('active-nav');
    this.compOff.fromSpanCO = 'FULL DAY';
    this.compOff.toSpanCO = 'FULL DAY';
    this.RepUserName = sessionStorage.getItem('RepUserName');
    this.managerSelectedUserIdCO = sessionStorage.getItem('selectedEmpId')
    if (this.managerSelectedUserIdCO) {
      this.approveCompOffFlag = true;
      this.loadCompOffDataSelectedUser(this.managerSelectedUserIdCO);
    } else {
      this.loadCompOffData();
    }
  }

  loadCompOffData() {
    this.userLeaveService.getCompOffList().subscribe((response) => {
      this.compOffList = JSON.parse(response['_body']).compOffList;
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
  loadCompOffDataSelectedUser(selecteUserId) {
    this.userLeaveService.getCompOffListSelectedUser(selecteUserId).subscribe((response) => {
      this.compOffList = JSON.parse(response['_body']).compOffList;
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
    this.successFlag = false;
    this.userLeaveService.applyCompOff(this.compOff).subscribe((response) => {
      this.printSuccessMessage('Comp-Off Applied Successfully');
      this.loadCompOffData();
      this.compOff = new Compensationoff()
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  checkDate() {
    this.errorFlag = false;
    if (!this.compOff.toDateCO) {
      this.compOff.toDateCO = this.compOff.fromDateCO;
    }
    if (this.compOff.fromSpanCO && this.compOff.toSpanCO && (new Date(this.compOff.fromDateCO).getTime() == new Date(this.compOff.toDateCO).getTime())) {
      if (this.compOff.fromSpanCO !== this.compOff.toSpanCO) {
        this.errorFlag = true;
        this.errorMessage = 'Can not apply, Comp Off span should be same for single date';
        return;
      }
    } else {
      if ((this.compOff.fromSpanCO == "FIRST HALF" && this.compOff.toSpanCO == "FULL DAY") || (this.compOff.fromSpanCO == "FIRST HALF" && this.compOff.toSpanCO == "FIRST HALF") || (this.compOff.fromSpanCO == "FIRST HALF" && this.compOff.toSpanCO == "SECOND HALF") || (this.compOff.fromSpanCO == "SECOND HALF" && this.compOff.toSpanCO == "SECOND HALF")) {
        this.errorFlag = true;
        this.errorMessage = 'Can not apply, Comp Off can not be merged for selected span ';
        return;
      }
    }
    this.userLeaveService.checkCompOffDate(this.compOff).subscribe((response) => {
      this.compOff.compOffSpan = JSON.parse(response['_body']).compOffSpan;
      // this.compOff.toDateCO = this.compOff.fromDateCO;
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }
  editCompoff(editData) {
    this.editCompOffFlag = true;
    this.compOff = editData
    this.compOff.fromDateCO = this.datepipe.transform(editData.fromDateCO, 'yyyy-MM-dd');
    this.compOff.toDateCO = this.datepipe.transform(editData.toDateCO, 'yyyy-MM-dd');
  }
  updateCompOff() {
    this.errorFlag = false;
    this.successFlag = false;
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

  resetCompOffUpdate() {
    this.editCompOffFlag = false;
    this.ngOnInit();
  }

  cancelCompOff(compOffCancel) {
    this.errorFlag = false;
    this.successFlag = false;
    // this.confirmationFlag = true;
    this.cancelcompOffId = compOffCancel._id;
    let iscancel = confirm('Are you sure to cancel Comp Off');
    if (iscancel) {
      this.confirmCancelCompOff()
    } else {
      //$('#exampleModal3').modal('hide');
    }
  }
  confirmCancelCompOff() {
    this.successFlag = false;
    this.errorFlag = false;
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
  // cancleCancelCompOff() {
  //   this.confirmationFlag = false;
  // }

  approveDataCompoff(coData) {
    this.compOff = coData
    this.compOff.fromDateCO = this.datepipe.transform(coData.fromDateCO, 'yyyy-MM-dd');
    this.compOff.toDateCO = this.datepipe.transform(coData.toDateCO, 'yyyy-MM-dd');
  }
  approveCompOff() {
    this.compOff.statusCO = 'Approved';
  }
  rejectCompOff() {
    this.compOff.statusCO = 'Rejected';
  }
  approveUserCompOff() {
    this.errorFlag = false;
    this.successFlag = false;
    this.userLeaveService.changeUserCompOffStatus(this.compOff).subscribe((response) => {
      this.printSuccessMessage('Comp Off ' + this.compOff.statusCO + ' Successfully');
      this.compOff = new Compensationoff()
      this.ngOnInit();
    }, (error) => {
      this.errorFlag = true;
      this.errorMessage = error._body;
    })
  }

  printSuccessMessage(message) {
    this.successFlag = true;
    this.successMessage = message;
    setTimeout(function () {
      $('.myAlert-top').hide();
    }, 3000);
  }
}
