// sort-imports-ignore
//angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//services
import { AuthGuardLogin } from './services/auth-guard-login.service';
import { AuthGuardAdmin } from './services/auth-guard-admin.service';
import { LeaveGuard } from './services/leave-guard.service';
//components
import { NotFoundComponent } from './not-found/not-found.component';
// import { AboutComponent } from './about/about.component';
// import { AccountComponent } from './account/account.component';
// import { ProfileSettingsComponent } from './account/profile-settings/profile-settings.component';
// import { AccountSettingsComponent } from './account/account-settings/account-settings.component';
// import { DevicesSettingsComponent } from './account/devices-settings/devices-settings.component';
import { LoginComponent } from './login/login.component';
// import { PasswordResetComponent } from './password-reset/password-reset.component';
// import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
// import { AdminComponent } from './admin/admin.component';
// import { UsersAdminComponent } from './admin/users-admin/users-admin.component';
// import { LanguagesComponent } from './languages/languages.component';
// import { EditorComponent } from './editor/editor.component';

const routes: Routes = [
  // { path: '', component: AboutComponent, data: { title: '' } },
  // { path: 'user/:username', component: ProfileComponent },
  { path: 'login', component: LoginComponent, data: { title: 'Sign in' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Sign up' }, canDeactivate: [LeaveGuard] },
  // { path: 'password-reset', component: PasswordResetComponent, data: { title: 'Forgot your password?' } },
  // {
  //   path: 'settings',
  //   component: AccountComponent,
  //   data: { title: 'Settings' },
  //   canActivate: [AuthGuardLogin],
  //   children: [
  //     {
  //       path: 'profile',
  //       component: ProfileSettingsComponent,
  //       data: { title: 'Settings > Profile' },
  //       canDeactivate: [LeaveGuard]
  //     },
  //     {
  //       path: 'account',
  //       component: AccountSettingsComponent,
  //       data: { title: 'Settings > Account' },
  //       canDeactivate: [LeaveGuard]
  //     },
  //     { path: 'devices', component: DevicesSettingsComponent, data: { title: 'Settings > Devices' } },
  //     { path: '**', redirectTo: 'profile' }
  //   ]
  // },
  // {
  //   path: 'admin',
  //   component: AdminComponent,
  //   data: { title: 'Admin' },
  //   canActivate: [AuthGuardAdmin],
  //   children: [
  //     { path: 'users', component: UsersAdminComponent, data: { title: 'Admin > Users' }, canDeactivate: [LeaveGuard] },
  //     { path: '**', redirectTo: 'users' }
  //   ]
  // },
  // { path: 'languages', component: LanguagesComponent, data: { title: 'Languages' } },
  // { path: 'editor', component: EditorComponent, data: { title: 'Editor' } },
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
