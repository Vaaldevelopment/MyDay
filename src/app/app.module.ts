import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AddDataComponent } from './add-data/add-data.component';

export const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'add-data', component: AddDataComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AddDataComponent
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
