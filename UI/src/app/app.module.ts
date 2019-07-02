import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AddDataComponent } from './add-data/add-data.component';
import { DataEntryComponent } from './HR/data-entry/data-entry.component';
import { HeaderNavComponent } from './header-nav/header-nav.component';
// import { FullCalendarModule } from '@fullcalendar/angular';

export const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'add-data', component: DataEntryComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AddDataComponent,
    DataEntryComponent,
    HeaderNavComponent,
    // FullCalendarModule
  ],
  imports: [
    BrowserModule,
    RouterModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true, useHash: true } // <-- debugging purposes only
    ),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
