// sort-imports-ignore
//angular
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

//graphql
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloDynamic } from 'apollo-dynamic';
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import extractFiles from 'extract-files/extractFiles.mjs';
import isExtractableFile from 'extract-files/isExtractableFile.mjs';

// modules
import { JwtModule } from '@auth0/angular-jwt';
import { NgOtpInputModule } from 'ng-otp-input';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMasonryModule } from 'ngx-masonry';
import { MomentModule } from 'ngx-moment';
import { TippyDirective, provideTippyConfig } from '@ngneat/helipopper';
import { InputMaskModule } from '@ngneat/input-mask';

//routes
import { routes } from './app/app.routes';

//environment
import { environment } from './environments/environment';

// services
import { AuthService } from './app/services/auth.service';
import { MessagesService } from './app/services/messages.service';

// directives
import { VarDirective } from './app/shared/directives/var.directive';

// pipes
import { FilterPipe } from './app/shared/pipes/filter.pipe';
import { SortPipe } from './app/shared/pipes/sort.pipe';
import { TruncatePipe } from './app/shared/pipes/truncate.pipe';

// shared components
import { ConfirmComponent } from './app/shared/components/confirm/confirm.component';
import { InvalidFeedbackComponent } from './app/shared/components/invalid-feedback/invalid-feedback.component';
import { LeaveGuardWarningComponent } from './app/shared/components/leave-guard-warning/leave-guard-warning.component';
import { SearchComponent } from './app/shared/components/search/search.component';
import { VerifiedMarkComponent } from './app/shared/components/verified-mark/verified-mark.component';

// components
import { AppComponent } from './app/app.component';
import { NotFoundComponent } from './app/not-found/not-found.component';
import { AboutComponent } from './app/about/about.component';
import { LoginComponent } from './app/login/login.component';
import { RegisterComponent } from './app/register/register.component';
import { PasswordResetComponent } from './app/password-reset/password-reset.component';
import { ProfileComponent } from './app/profile/profile.component';
import { SettingsComponent } from './app/settings/settings.component';
import { SettingsAccountComponent } from './app/settings/account/settings-account.component';
import { SettingsDevicesComponent } from './app/settings/devices/settings-devices.component';
import { SettingsEmailsComponent } from './app/settings/emails/settings-emails.component';
import { SettingsProfileComponent } from './app/settings/profile/settings-profile.component';
import { SettingsSecurityComponent } from './app/settings/security/settings-security.component';
import { AdminComponent } from './app/admin/admin.component';
import { AdminUsersComponent } from './app/admin/users/admin-users.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    //routes
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })),
    //graphql
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const messages = inject(MessagesService);

      const http = httpLink.create({
        uri: `http://${environment.host}:${environment.appPort}/${environment.graphql}`,
        extractFiles: (body) => extractFiles(body, isExtractableFile) as any,
        headers: new HttpHeaders().set('apollo-require-preflight', 'true')
      });
      const ws = new GraphQLWsLink(
        createClient({
          url: `ws://${environment.host}:${environment.appPort}/${environment.graphql}`
        })
      );
      const auth = setContext(() => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      });
      const error = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          graphQLErrors.map((error: any) => console.error('[GraphQL error]', error));
        }
        if (networkError) {
          console.error('[Network error]', networkError);
          messages.error('Network error. Please check your internet connection.', '', {});
        }
      });
      const success = new ApolloLink((operation, forward) => {
        return forward(operation).map((data) => {
          messages.clear();
          return data;
        });
      });
      const link = ApolloLink.from([
        auth,
        error,
        success,
        split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
          },
          ws,
          http
        )
      ]);

      return {
        link: link,
        cache: new InMemoryCache({ addTypename: false }),
        defaultOptions: {
          watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
          query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
          mutate: { fetchPolicy: 'network-only', errorPolicy: 'all' }
        }
      };
    }),
    //tippy
    provideTippyConfig({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: {
          theme: 'material',
          arrow: true,
          maxWidth: 200,
          animation: 'scale',
          trigger: 'mouseenter',
          offset: [0, 5]
        },
        popper: { theme: 'material', arrow: true, maxWidth: 200, animation: 'scale', trigger: 'click', offset: [0, 5] }
      }
    }),
    //services
    MessagesService,
    AuthService,
    importProvidersFrom(
      //angular modules
      BrowserAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
      HammerModule,
      //modules
      NgOtpInputModule,
      NgxMasonryModule,
      ImageCropperModule,
      JwtModule.forRoot({
        config: {
          tokenGetter: (): string | null => localStorage.getItem('token')
        }
      }),
      InputMaskModule.forRoot({ inputSelector: 'input', isAsync: true }),
      MomentModule.forRoot({ relativeTimeThresholdOptions: { m: 59 } })
    ),
    //directives
    TippyDirective,
    VarDirective,
    //pipes
    FilterPipe,
    SortPipe,
    TruncatePipe,
    //shared components
    ConfirmComponent,
    LeaveGuardWarningComponent,
    SearchComponent,
    InvalidFeedbackComponent,
    VerifiedMarkComponent,
    //components
    NotFoundComponent,
    AboutComponent,
    LoginComponent,
    RegisterComponent,
    PasswordResetComponent,
    ProfileComponent,
    SettingsComponent,
    SettingsProfileComponent,
    SettingsAccountComponent,
    SettingsEmailsComponent,
    SettingsSecurityComponent,
    SettingsDevicesComponent,
    AdminComponent,
    AdminUsersComponent
  ]
});

ApolloDynamic.cache = true;
