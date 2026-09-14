import { Component, inject } from '@angular/core';
import { Button } from "../../../../shared/components/button/button";
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-hero',
  imports: [Button],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

}
