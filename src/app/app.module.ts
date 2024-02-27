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
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
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
//components
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

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
    //components
    AppComponent,
    NotFoundComponent,
    LoginComponent,
    RegisterComponent
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
      useFactory(httpLink: HttpLink) {
        //create an http link
        const http = httpLink.create({
          uri: environment.graphqlHTTPUri,
          headers: new HttpHeaders().set('apollo-require-preflight', 'true') //required for upload files (here we can set the headers for all http requests)
        });

        //create a websocket link (if it's needed for subscriptions)
        const ws = new GraphQLWsLink(
          createClient({
            url: environment.graphqlWSUri
          })
        );

        //create authentication link (it will add the user auth token to the headers on all requests)
        const authLink = new ApolloLink((operation, forward) => {
          //get the authentication token from local storage if it exists
          const token = localStorage.getItem('token');

          //use the setContext method to set the HTTP headers.
          operation.setContext({
            headers: {
              Authorization: token ? `Bearer ${token}` : ''
            }
          });

          //call the next link in the middleware chain.
          return forward(operation);
        });

        //using the ability to split links, you can send data to each link
        //depending on what kind of operation is being sent
        const link = split(
          //split based on operation type
          ({ query }) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
          },
          ws,
          http
        );
        return {
          link: authLink.concat(link),
          cache: new InMemoryCache()
        };
      },
      deps: [HttpLink]
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
  }
}
