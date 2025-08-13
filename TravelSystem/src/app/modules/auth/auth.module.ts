import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

import { Login } from './login/login';
import { Register } from './register/register';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Login,
    Register
  ],
  
  exports: [
    Login,
    Register
  ]
})
export class AuthModule { }
