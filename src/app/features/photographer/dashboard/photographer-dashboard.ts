import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PhotoUpload } from './photo-upload/photo-upload';
import { PhotoManager } from './photo-manager/photo-manager';

@Component({
  selector: 'app-photographer-dashboard',
  standalone: true,
  imports: [RouterModule, PhotoUpload, PhotoManager],
  templateUrl: './photographer-dashboard.html',
  styleUrl: './photographer-dashboard.css'
})
export class PhotographerDashboard {}