/// <reference types="@angular/localize" />
// sort-imports-ignore
//angular
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import '@angular/localize/init';
import { HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
// modules
import { JwtModule } from '@auth0/angular-jwt';
import { FaConfig, FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
// icons
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TippyDirective, provideTippyConfig } from '@ngneat/helipopper';
import { InputMaskModule } from '@ngneat/input-mask';

//graphql
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloDynamic } from 'apollo-dynamic';
import extractFiles from 'extract-files/extractFiles.mjs';
import isExtractableFile from 'extract-files/isExtractableFile.mjs';
import { createClient } from 'graphql-ws';
import { NgOtpInputModule } from 'ng-otp-input';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMasonryModule } from 'ngx-masonry';
import { MomentModule } from 'ngx-moment';

//routes
import { routes } from './app/app.routes';
//environment
import { environment } from './environments/environment';

import { AccountSettingsComponent } from './app/account/account-settings/account-settings.component';
import { AccountComponent } from './app/account/account.component';
import { DevicesSettingsComponent } from './app/account/devices-settings/devices-settings.component';
import { EmailsSettingsComponent } from './app/account/emails-settings/emails-settings.component';
import { ProfileSettingsComponent } from './app/account/profile-settings/profile-settings.component';
import { SecuritySettingsComponent } from './app/account/security-settings/security-settings.component';
import { AdminComponent } from './app/admin/admin.component';
import { UsersAdminComponent } from './app/admin/users-admin/users-admin.component';
// components
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/login/login.component';
import { NotFoundComponent } from './app/not-found/not-found.component';
import { PasswordResetComponent } from './app/password-reset/password-reset.component';
import { ProfileComponent } from './app/profile/profile.component';
import { RegisterComponent } from './app/register/register.component';
// shared components
import { ConfirmComponent } from './app/shared/components/confirm/confirm.component';
import { InvalidFeedbackComponent } from './app/shared/components/invalid-feedback/invalid-feedback.component';
import { LeaveGuardWarningComponent } from './app/shared/components/leave-guard-warning/leave-guard-warning.component';
import { SearchComponent } from './app/shared/components/search/search.component';
import { VerifiedMarkComponent } from './app/shared/components/verified-mark/verified-mark.component';

// services
import { AuthService } from './app/services/auth.service';
import { MessagesService } from './app/services/messages.service';

// directives
import { VarDirective } from './app/shared/directives/var.directive';

// pipes
import { FilterPipe } from './app/shared/pipes/filter.pipe';
import { SortPipe } from './app/shared/pipes/sort.pipe';
import { TruncatePipe } from './app/shared/pipes/truncate.pipe';

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
        uri: environment.graphqlHTTPUri,
        extractFiles: (body) => extractFiles(body, isExtractableFile) as any,
        headers: new HttpHeaders().set('apollo-require-preflight', 'true')
      });
      const ws = new GraphQLWsLink(createClient({ url: environment.graphqlWSUri }));
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
          messages.error('<b>Network error</b>. Please check your internet connection.', {
            icon: 'fas fa-wifi',
            container: 'network-error',
            position: 'bottomCenter',
            onlyOne: true,
            displayMode: 'replace'
          });
        }
      });
      const success = new ApolloLink((operation, forward) => {
        return forward(operation).map((data) => {
          messages.clear('network-error');
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
    //fontawesome
    {
      provide: FaIconLibrary,
      useFactory: () => {
        const library = new FaIconLibrary();
        library.addIconPacks(far, fas, fab);
        return library;
      }
    },
    {
      provide: FaConfig,
      useFactory: () => {
        const config = new FaConfig();
        config.defaultPrefix = 'fas';
        config.fixedWidth = true;
        return config;
      }
    },
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
      NgbModule,
      FontAwesomeModule,
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
    LoginComponent,
    RegisterComponent,
    PasswordResetComponent,
    ProfileComponent,
    AccountComponent,
    ProfileSettingsComponent,
    AccountSettingsComponent,
    EmailsSettingsComponent,
    SecuritySettingsComponent,
    DevicesSettingsComponent,
    AdminComponent,
    UsersAdminComponent
  ]
});

ApolloDynamic.cache = true;
