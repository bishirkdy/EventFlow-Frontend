import { Component, inject } from "@angular/core";
import { Navbar } from "../../components/navbar/navbar";
import { RouterOutlet } from '@angular/router';
import { Footer } from "../../components/footer/footer";
import { LoadingService } from '../../../core/services/ui/loading.service';
import { Loading } from '../../components/loading/loading';

@Component({
    selector :  'app-public-layout',
    imports: [Navbar, RouterOutlet, Footer, Loading],
    templateUrl : './public-layout.html',
})

export class PublicLayout {
  loading = inject(LoadingService).loading;
}