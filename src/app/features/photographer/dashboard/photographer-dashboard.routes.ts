import { Routes } from '@angular/router';
import { PhotographerDashboard } from './photographer-dashboard';
import { eventRoleGuard } from '../../../core/guards/event-role/event-role.guard';

export const photographerRoutes: Routes = [
  {
    path: ':eventId',
    canActivate: [eventRoleGuard('Photographer')],
    children: [
      {
        path: 'photos',
        component: PhotographerDashboard,
        children: [
          {
            path: 'upload',
            loadComponent: () => import('./photo-upload/photo-upload').then(m => m.PhotoUpload),
          },
          {
            path: '',
            loadComponent: () => import('./photo-manager/photo-manager').then(m => m.PhotoManager),
          },
        ],
      },
    ],
  },
];
