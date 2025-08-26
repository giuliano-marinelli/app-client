// sort-imports-ignore
//angular
import { Routes } from '@angular/router';

//i18n
import { translate } from '@jsverse/transloco';

//guards
import { AuthLoginGuard } from './shared/guards/auth-login.guard';
import { AuthAdminGuard } from './shared/guards/auth-admin.guard';
import { LeaveGuard } from './shared/guards/leave.guard';
import { UserExistsGuard } from './shared/guards/user-exists.guard';

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

const loading = '⟳';

export const routes: Routes = [
  {
    path: '',
    component: AboutComponent,
    data: { title: () => translate('routes.title') }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: () => translate('routes.login.title') }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: () => translate('routes.register.title') },
    canDeactivate: [LeaveGuard]
  },
  {
    path: 'password-reset',
    component: PasswordResetComponent,
    data: { title: () => translate('routes.passwordReset.title') }
  },
  {
    path: 'password-reset/:code',
    component: PasswordResetComponent,
    data: { title: () => translate('routes.passwordResetCode.title') }
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: { title: () => translate('routes.settings.title') },
    canActivate: [AuthLoginGuard],
    children: [
      {
        path: 'profile',
        component: SettingsProfileComponent,
        data: { title: () => translate('routes.settings.profile.title') },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'account',
        component: SettingsAccountComponent,
        data: { title: () => translate('routes.settings.account.title') }
      },
      {
        path: 'emails',
        component: SettingsEmailsComponent,
        data: { title: () => translate('routes.settings.emails.title') },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'security',
        component: SettingsSecurityComponent,
        data: { title: () => translate('routes.settings.security.title') },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'devices',
        component: SettingsDevicesComponent,
        data: { title: () => translate('routes.settings.devices.title') }
      },
      { path: '**', redirectTo: 'profile' }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: () => translate('routes.admin.title') },
    canActivate: [AuthAdminGuard],
    children: [
      {
        path: 'users',
        component: AdminUsersComponent,
        data: { title: () => translate('routes.admin.users.title') },
        canDeactivate: [LeaveGuard]
      },
      { path: '**', redirectTo: 'users' }
    ]
  },
  {
    path: ':username',
    component: ProfileComponent,
    canMatch: [UserExistsGuard],
    data: {
      title: (params: Record<string, string>) => {
        if (!params['username']) return loading;
        return (params['profilename'] ? params['profilename'] + ' · ' : '') + '@' + params['username'];
      }
    }
  },
  {
    path: 'notfound',
    component: NotFoundComponent,
    data: { title: () => translate('routes.notfound.title') }
  },
  { path: '**', redirectTo: '/notfound' }
];
