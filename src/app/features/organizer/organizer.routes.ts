import { Routes } from '@angular/router';
import { OrganizerLayout } from './layout/organizer-layout/organizer-layout';
import { Overview } from './pages/overview/overview';

export const organizerRoutes: Routes = [
    {
        path: '',
        component: OrganizerLayout,
        children: [
            {
                path: '',
                component: Overview,
            },
        ],
    },
]