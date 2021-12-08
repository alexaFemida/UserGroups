import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MaterialModule } from './material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule }
       from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { GroupsTreeComponent } from './groups-tree/groups-tree.component';
import { UsersComponent } from './users/users.component';

@NgModule({

       declarations: [

              AppComponent,
              GroupsTreeComponent,
              UsersComponent

       ],

       imports: [
              HttpClientModule,
              BrowserModule,
              FormsModule,
              RouterModule,
              MaterialModule,
              BrowserAnimationsModule,
              FlexLayoutModule

       ],

       providers: [],

       bootstrap: [AppComponent]

})

export class AppModule { }