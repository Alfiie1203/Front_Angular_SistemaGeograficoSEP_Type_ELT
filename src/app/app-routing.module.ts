import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from './public/public.component';
import { PrivateComponent } from './private/private.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NonAuthGuard } from './core/guards/non-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home-public',
    component: PublicComponent,
    canActivate: [NonAuthGuard],
    loadChildren: () => import('./public/public-routing.module').then(m => m.PublicRoutingModule) 
  },
  {
    path: '',
    component: PrivateComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./private/private-routing.module').then(m => m.PrivateRoutingModule) 
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
