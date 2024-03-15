// sort-imports-ignore
//angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//graphql modules
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloDynamic } from 'apollo-dynamic';
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import extractFiles from 'extract-files/extractFiles.mjs';
import isExtractableFile from 'extract-files/isExtractableFile.mjs';
//modules
import { AppRoutingModule } from './app-routing.module';
import { JwtModule } from '@auth0/angular-jwt';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideTippyConfig, TippyDirective } from '@ngneat/helipopper';
import { InputMaskModule } from '@ngneat/input-mask';
import { FontAwesomeModule, FaIconLibrary, FaConfig } from '@fortawesome/angular-fontawesome';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MomentModule } from 'ngx-moment';
import { NarikCustomValidatorsModule } from '@narik/custom-validators';
import { NgOtpInputModule } from 'ng-otp-input';
//environment
import { environment } from '../environments/environment';
//icons
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
//services
import { AuthService } from './services/auth.service';
import { MessagesService } from './services/messages.service';
//directives
import { VarDirective } from './shared/directives/var.directive';
//pipes
import { FilterPipe } from './shared/pipes/filter.pipe';
import { SortPipe } from './shared/pipes/sort.pipe';
import { TruncatePipe } from './shared/pipes/truncate.pipe';
//shared components
import { ConfirmComponent } from './shared/components/confirm/confirm.component';
import { LeaveGuardWarningComponent } from './shared/components/leave-guard-warning/leave-guard-warning.component';
import { SearchComponent } from './shared/components/search/search.component';
import { InvalidFeedbackComponent } from './shared/components/invalid-feedback/invalid-feedback.component';
//components
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account/account.component';
import { ProfileSettingsComponent } from './account/profile-settings/profile-settings.component';
import { AccountSettingsComponent } from './account/account-settings/account-settings.component';
import { EmailsSettingsComponent } from './account/emails-settings/emails-settings.component';
import { SecuritySettingsComponent } from './account/security-settings/security-settings.component';
import { DevicesSettingsComponent } from './account/devices-settings/devices-settings.component';

@NgModule({
  declarations: [
    //directives
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
    //components
    AppComponent,
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
    DevicesSettingsComponent
  ],
  imports: [
    //angular modules
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HammerModule,
    //graphql modules
    ApolloModule,
    //modules
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule,
    ImageCropperModule,
    NarikCustomValidatorsModule,
    NgOtpInputModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: (): string | null => localStorage.getItem('token')
        // whitelistedDomains: ['localhost:3000', 'localhost:4200']
      }
    }),
    InputMaskModule.forRoot({
      inputSelector: 'input',
      isAsync: true
    }),
    MomentModule.forRoot({
      relativeTimeThresholdOptions: {
        m: 59
      }
    }),
    //directives
    TippyDirective
  ],
  providers: [
    //configurations
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
        popper: {
          theme: 'material',
          arrow: true,
          maxWidth: 200,
          animation: 'scale',
          trigger: 'click',
          offset: [0, 5]
        }
      }
    }),
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink, messages: MessagesService) {
        //create an http link
        const http = httpLink.create({
          uri: environment.graphqlHTTPUri,
          //required for upload files
          extractFiles: (body) => {
            return extractFiles(body, isExtractableFile) as any;
          },
          //here we can set the headers for all http requests
          headers: new HttpHeaders().set('apollo-require-preflight', 'true') //required for upload files
        });

        //create a websocket link (if it's needed for subscriptions)
        const ws = new GraphQLWsLink(
          createClient({
            url: environment.graphqlWSUri
          })
        );

        //add authentication token to the headers
        const auth = setContext(() => {
          //get the authentication token from local storage if it exists
          const token = localStorage.getItem('token');

          //add the token to the headers
          return token
            ? {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            : {};
        });

        //general error handling behavior (for all requests)
        //specifically for network errors that only shows from here
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

        //general success handling behavior (for all requests)
        const success = new ApolloLink((operation, forward) => {
          return forward(operation).map((data) => {
            //clear the network error messages
            messages.clear('network-error');
            return data;
          });
        });

        //split for set the link type (http or ws) based on the operation type
        //add the auth context to the link
        //set the general error handling behavior
        const link = ApolloLink.from([
          auth,
          error,
          success,
          split(
            //split based on operation type
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
          cache: new InMemoryCache({
            addTypename: false
          }),
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'cache-and-network',
              errorPolicy: 'all'
            },
            query: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all'
            },
            mutate: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all'
            }
          }
        };
      },
      deps: [HttpLink, MessagesService]
    },
    //services
    MessagesService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(fontawesomeLibrary: FaIconLibrary, fontawesomeConfig: FaConfig) {
    fontawesomeLibrary.addIconPacks(far, fas, fab);
    fontawesomeConfig.defaultPrefix = 'fas';
    fontawesomeConfig.fixedWidth = true;

    ApolloDynamic.cache = true;
  }
}
