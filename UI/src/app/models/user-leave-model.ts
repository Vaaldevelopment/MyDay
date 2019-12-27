export class UserLeaveModel {
    leaveId: any;
    leaveStatus: any;
    reason: string;
    fromDate: string;
    toDate: string;
    leaveType: string;
    leavePlanned: string;
    employeeCode: string;
    fromSpan: string;
    toSpan: string;
    compOff: Number;
    leaveCount: Number = null;
    id: string;
    leaveBalance: Number;
    CL: Number;
    EL: Number;
    consumeCL: Number;
    consumeEL: Number;
    managerNote: string;
    cancelFlag = false;
    futureLeave: Number;
    requestedBy: string;
}

// ToDo - Specify data types