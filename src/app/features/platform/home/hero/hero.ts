import { Component } from '@angular/core';
import { Button } from "../../../../shared/components/button/button";

@Component({
  selector: 'app-hero',
  imports: [Button],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {}
