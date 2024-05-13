// sort-imports-ignore
//angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//services
import { AuthLoginGuard } from './shared/guards/auth-login.guard';
import { AuthAdminGuard } from './shared/guards/auth-admin.guard';
import { LeaveGuard } from './shared/guards/leave.guard';
//components
import { NotFoundComponent } from './not-found/not-found.component';
import { AboutComponent } from './about/about.component';
import { AccountComponent } from './account/account.component';
import { ProfileSettingsComponent } from './account/profile-settings/profile-settings.component';
import { AccountSettingsComponent } from './account/account-settings/account-settings.component';
import { EmailsSettingsComponent } from './account/emails-settings/emails-settings.component';
import { SecuritySettingsComponent } from './account/security-settings/security-settings.component';
import { DevicesSettingsComponent } from './account/devices-settings/devices-settings.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { AdminComponent } from './admin/admin.component';
import { UsersAdminComponent } from './admin/users-admin/users-admin.component';

const routes: Routes = [
  { path: '', component: AboutComponent, data: { title: '' } },
  { path: 'user/:username', component: ProfileComponent },
  { path: 'login', component: LoginComponent, data: { title: 'Sign in' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Sign up' }, canDeactivate: [LeaveGuard] },
  {
    path: 'password-reset',
    component: PasswordResetComponent,
    data: { title: 'Forgot your password?' }
  },
  {
    path: 'password-reset/:code',
    component: PasswordResetComponent,
    data: { title: 'Reset your password' }
  },
  {
    path: 'settings',
    component: AccountComponent,
    data: { title: 'Settings' },
    canActivate: [AuthLoginGuard],
    children: [
      {
        path: 'profile',
        component: ProfileSettingsComponent,
        data: { title: 'Settings > Profile' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'account',
        component: AccountSettingsComponent,
        data: { title: 'Settings > Account' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'emails',
        component: EmailsSettingsComponent,
        data: { title: 'Settings > Emails' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'security',
        component: SecuritySettingsComponent,
        data: { title: 'Settings > Passwords' },
        canDeactivate: [LeaveGuard]
      },
      { path: 'devices', component: DevicesSettingsComponent, data: { title: 'Settings > Devices' } },
      { path: '**', redirectTo: 'profile' }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Admin' },
    canActivate: [AuthAdminGuard],
    children: [
      { path: 'users', component: UsersAdminComponent, data: { title: 'Admin > Users' }, canDeactivate: [LeaveGuard] },
      { path: '**', redirectTo: 'users' }
    ]
  },
  // { path: 'graphql' },
  { path: 'notfound', component: NotFoundComponent, data: { title: 'Page not found' } },
  { path: '**', redirectTo: '/notfound' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false, anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
