import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'answer',
    loadComponent: () => import('./answer/answer.page').then((m) => m.AnswerPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
