import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlatformFeatures } from '../home/platform-features/platform-features';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [RouterLink, PlatformFeatures, Button],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {}
