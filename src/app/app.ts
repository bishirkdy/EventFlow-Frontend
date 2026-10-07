import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginDialog } from './shared/components/login-dialog/login-dialog';
import { LoadingService } from './core/services/ui/loading.service';
// import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // private readonly loadingService = inject(LoadingService);
//   private readonly spinner = inject(NgxSpinnerService);

//   constructor() {
//     effect(() => {
//       if (this.loadingService.loading()) {
//         this.spinner.show();
//       } else {
//         this.spinner.hide();
//       }
//     });
//   }
 }