import { Component } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { RouterOutlet } from '@angular/router';
import { Footer } from "../../components/footer/footer";

@Component({
    selector :  'app-public-layout',
    imports: [Navbar, RouterOutlet, Footer],
    templateUrl : './public-layout.html',
})

export class PublicLayout{}