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
    compOff: any;
    leaveCount: number = null;
    id: string;
    leaveBalance: number;
    CL: number;
    EL: number;
    consumeCL: number;
    consumeEL: number;
    managerNote: string;
    cancelFlag = false;
}

// ToDo - Specify data types