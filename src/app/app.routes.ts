// sort-imports-ignore
//angular
import { Routes } from '@angular/router';
//services
import { AuthLoginGuard } from './shared/guards/auth-login.guard';
import { AuthAdminGuard } from './shared/guards/auth-admin.guard';
import { LeaveGuard } from './shared/guards/leave.guard';
//components
import { NotFoundComponent } from './not-found/not-found.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsAccountComponent } from './settings/account/settings-account.component';
import { SettingsDevicesComponent } from './settings/devices/settings-devices.component';
import { SettingsEmailsComponent } from './settings/emails/settings-emails.component';
import { SettingsProfileComponent } from './settings/profile/settings-profile.component';
import { SettingsSecurityComponent } from './settings/security/settings-security.component';
import { AdminComponent } from './admin/admin.component';
import { AdminUsersComponent } from './admin/users/admin-users.component';

export const routes: Routes = [
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
    component: SettingsComponent,
    data: { title: 'Settings' },
    canActivate: [AuthLoginGuard],
    children: [
      {
        path: 'profile',
        component: SettingsProfileComponent,
        data: { title: 'Settings > Profile' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'account',
        component: SettingsAccountComponent,
        data: { title: 'Settings > Account' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'emails',
        component: SettingsEmailsComponent,
        data: { title: 'Settings > Emails' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'security',
        component: SettingsSecurityComponent,
        data: { title: 'Settings > Passwords' },
        canDeactivate: [LeaveGuard]
      },
      { path: 'devices', component: SettingsDevicesComponent, data: { title: 'Settings > Devices' } },
      { path: '**', redirectTo: 'profile' }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Admin' },
    canActivate: [AuthAdminGuard],
    children: [
      { path: 'users', component: AdminUsersComponent, data: { title: 'Admin > Users' }, canDeactivate: [LeaveGuard] },
      { path: '**', redirectTo: 'users' }
    ]
  },
  // { path: 'graphql' },
  { path: 'notfound', component: NotFoundComponent, data: { title: 'Page not found' } },
  { path: '**', redirectTo: '/notfound' }
];
