import { Component } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { RouterOutlet } from '@angular/router';

@Component({
    selector :  'app-public-layout',
    imports: [Navbar, RouterOutlet],
    templateUrl : './public-layout.html',
})

export class PublicLayout{}