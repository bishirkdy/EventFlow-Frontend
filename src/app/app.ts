import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/ui/loading.service';
import { LoginDialog } from './shared/components/login-dialog/login-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly loading = inject(LoadingService).loading;
}
