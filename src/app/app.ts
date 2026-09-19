import { Component, inject, signal } from '@angular/core';
import {RouterOutlet} from '@angular/router'
import { AuthService } from './core/services/auth/auth.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
