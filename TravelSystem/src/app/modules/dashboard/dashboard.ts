import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  constructor(private authService: AuthService) { }

  userData: any;
  ngOnInit(){
    this.authService.getCurrentUser().subscribe(user => {
      this.userData = user;
    });
  }
  logout() {
    this.authService.logout();
  } 
  

}
