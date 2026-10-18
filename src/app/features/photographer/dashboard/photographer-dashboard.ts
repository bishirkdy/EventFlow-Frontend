import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Camera, Upload, Images } from 'lucide-angular';

@Component({
  selector: 'app-photographer-dashboard',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './photographer-dashboard.html',
  styleUrl: './photographer-dashboard.css'
})
export class PhotographerDashboard {
  readonly icons = {
    ArrowLeft,
    Camera,
    Upload,
    Images
  };
}
