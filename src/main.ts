// sort-imports-ignore
//angular
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, inject, isDevMode, provideAppInitializer } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { provideServiceWorker } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';

//graphql
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloDynamic } from 'apollo-dynamic';
import {
  ApolloLink,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  InMemoryCache,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError
} from '@apollo/client/core';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { RemoveTypenameFromVariablesLink } from '@apollo/client/link/remove-typename';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import extractFiles from 'extract-files/extractFiles.mjs';
import isExtractableFile from 'extract-files/isExtractableFile.mjs';

// i18n
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

// modules
import { JwtModule } from '@auth0/angular-jwt';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxMasonryModule } from 'ngx-masonry';
import { NgxResizeObserverModule } from 'ngx-resize-observer';
import { MomentModule } from 'ngx-moment';
import { InputMaskModule } from '@ngneat/input-mask';

//routes
import { routes } from './app/app.routes';

//environment
import { environment } from './environments/environment';

// services
import { AuthService } from './app/services/auth.service';
import { MessagesService } from './app/services/messages.service';
import { LanguageService } from './app/services/language.service';
import { TitleService } from './app/services/title.service';
import { ProfileService } from './app/services/profile.service';

// directives
import { VarDirective } from './app/shared/directives/var.directive';
import { LongPressDirective } from './app/shared/directives/long-press.directive';
import { LongPressCopyDirective } from './app/shared/directives/long-press-copy.directive';

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
import { NavigationPanelComponent } from './app/shared/components/navigation-panel/navigation-panel.component';
import { SessionCardComponent } from './app/shared/components/session/card/session-card.component';
import { SessionMiniComponent } from './app/shared/components/session/mini/session-mini.component';
import { UserCardComponent } from './app/shared/components/user/card/user-card.component';
import { UserMiniComponent } from './app/shared/components/user/mini/user-mini.component';

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
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    //graphql
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const http = httpLink.create({
        uri: `${environment.protocol}${environment.host}:${environment.appPort}/${environment.graphql}`,
        extractFiles: (body) => extractFiles(body, isExtractableFile),
        headers: new HttpHeaders().set('apollo-require-preflight', 'true')
      });
      const ws = new GraphQLWsLink(
        createClient({
          url: `ws://${environment.host}:${environment.appPort}/${environment.graphql}`
        })
      );
      const auth = new SetContextLink(() => {
        const token = localStorage.getItem('token');
        return token ? { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) } : {};
      });
      const error = new ErrorLink(({ error }) => {
        if (CombinedGraphQLErrors.is(error)) {
          // handle GraphQL errors
          error.errors.forEach(({ message, locations, path }) =>
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
          );
        } else if (CombinedProtocolErrors.is(error)) {
          // handle multipart subscription protocol errors
          error.errors.forEach(({ message, extensions }) =>
            console.error(`[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`)
          );
        } else if (LocalStateError.is(error)) {
          console.error(`[LocalState error]: Path: ${error.path}`, error);
          // handle errors thrown by the `LocalState` class
        } else if (ServerError.is(error)) {
          // handle server HTTP errors
          console.error(`[Server error]: Status code: ${error.statusCode}, Body Text: ${error.bodyText}`, error);
        } else if (ServerParseError.is(error)) {
          // handle JSON parse errors
          console.error(`[Server parse error]: Status code: ${error.statusCode}, Body Text: ${error.bodyText}`, error);
        } else if (UnconventionalError.is(error)) {
          // handle errors thrown by irregular types
          console.error('[Unconventional error]', error);
        } else {
          console.error('[Network error]', error);
        }
      });
      const success = new ApolloLink((operation, forward) => {
        return forward(operation);
      });
      const removeTypename = new RemoveTypenameFromVariablesLink();
      const link = ApolloLink.from([
        removeTypename,
        auth,
        error,
        success,
        ApolloLink.split(
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
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
          query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
          mutate: { fetchPolicy: 'network-only', errorPolicy: 'all' }
        }
      };
    }),
    //i18n
    provideTransloco({
      config: {
        availableLangs: [
          'de',
          'en',
          'es',
          'fr',
          'it',
          'pt'
        ],
        defaultLang: 'en',
        fallbackLang: 'en',
        missingHandler: {
          useFallbackTranslation: true
        },
        reRenderOnLangChange: true, // remove this option if doesn't want to support changing language in runtime
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    }),
    //i18n: app initializer for avoid missing translations on first page load
    provideAppInitializer(() => {
      inject(LanguageService).init();
      return firstValueFrom(inject(LanguageService).initialized);
    }),
    //service worker for pwa
    provideServiceWorker('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    //angular material (error matcher configuration)
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    //services
    AuthService,
    MessagesService,
    LanguageService,
    TitleService,
    ProfileService,
    importProvidersFrom(
      //angular modules
      BrowserAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
      HammerModule,
      //modules
      NgOtpInputModule,
      NgxMasonryModule,
      NgxResizeObserverModule,
      JwtModule.forRoot({
        config: {
          tokenGetter: (): string | null => localStorage.getItem('token')
        }
      }),
      InputMaskModule.forRoot({ inputSelector: 'input', isAsync: true }),
      MomentModule.forRoot({ relativeTimeThresholdOptions: { m: 59 } })
    ),
    //directives
    VarDirective,
    LongPressDirective,
    LongPressCopyDirective,
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
    NavigationPanelComponent,
    SessionCardComponent,
    SessionMiniComponent,
    UserCardComponent,
    UserMiniComponent,
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
