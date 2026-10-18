import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginDialog } from './shared/components/login-dialog/login-dialog';
import { RegistrationDialog } from './shared/components/registration-dialog/registration-dialog';
import { ProgressBar } from './shared/components/progress-bar/progress-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginDialog, RegistrationDialog, ProgressBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
