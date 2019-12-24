import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AddDataComponent } from './add-data/add-data.component';
import { DataEntryComponent } from './HR/data-entry/data-entry.component';
import { HeaderNavComponent } from './header-nav/header-nav.component';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './Employee/dashboard/dashboard.component';
import { TeamViewComponent } from './team-view/team-view.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { SchedulerModule } from 'angular-calendar-scheduler';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'
import { from } from 'rxjs';
import { AppService } from './app.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ScheduleAllModule, RecurrenceEditorAllModule } from '@syncfusion/ej2-angular-schedule';
import { TeamTimeComponent } from './team-time/team-time.component';
import { MyTimeComponent } from './my-time/my-time.component';



//services 
import { HttpModule } from '@angular/http';
import { UserLoginService } from './services/user-login.service';
import { AuthGuardService } from './services/auth-guard.service';
import { UserLeaveService } from './services/user-leave.service';
import { UserDataService } from './services/user-data.service';
import { DatePipe } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { HolidayService } from './services/holiday.service';
import { HttpHelperService } from './services/http-helper.service';
import { SettingsService } from './services/settings.service';
import { AttendanceService } from './services/attendance.service';
import { LeavedataService } from './services/leavedata.service';
import { FilterPipe } from './filter.pipe';
import { RefreshComponent } from './refresh/refresh.component';
import { CompensationoffComponent } from './Employee/compensationoff/compensationoff.component';


export const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'add-data', component: DataEntryComponent, canActivate: [AuthGuardService] },
  { path: 'login', component: LoginComponent },
  { path: 'employee-dashboard', component: DashboardComponent, canActivate: [AuthGuardService]},
  { path: 'team-view', component: TeamViewComponent, canActivate: [AuthGuardService]},
  { path: 'team-time', component: TeamTimeComponent, canActivate: [AuthGuardService]},
  { path: 'my-time', component: MyTimeComponent, canActivate: [AuthGuardService]},
  { path: 'employee-dashboard', component: DashboardComponent, canActivate: [AuthGuardService] },
  { path: 'setting', component: SettingsComponent, canActivate: [AuthGuardService] },
  { path: 'employee-compoff', component: CompensationoffComponent, canActivate: [AuthGuardService]},
  { path: 'refresh', component: RefreshComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AddDataComponent,
    DataEntryComponent,
    HeaderNavComponent,
    DashboardComponent,
    TeamViewComponent,
    TeamTimeComponent,
    MyTimeComponent,
    SettingsComponent,
    FilterPipe,
    RefreshComponent,
    CompensationoffComponent

  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true, useHash: true } // <-- debugging purposes only
    ),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    SchedulerModule.forRoot({ locale: 'en', headerDateFormat: 'daysRange' }),
    ScheduleAllModule, RecurrenceEditorAllModule,

    FullCalendarModule
  ],
  providers: [
    AuthGuardService,
    UserLoginService,
    UserLeaveService,
    UserDataService,
    AppService,
    DatePipe,
    HolidayService,
    HttpHelperService,
    SettingsService,
    AttendanceService,
    LeavedataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
