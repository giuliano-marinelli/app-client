import { Injectable } from '@angular/core';

import { ApolloQueryResult } from '@apollo/client';

import {
  CREATE_USER,
  DELETE_USER,
  UPDATE_USER,
  UPDATE_USER_PASSWORD,
  UPDATE_USER_VERIFICATION_CODE,
  USERS,
  UserResult,
  VERIFY_USER
} from '../../graphql/users.graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

import { User } from '../shared/models/user.model';

import { AuthService } from './auth.service';

@Injectable()
export class UsersService {
  constructor(
    private apollo: Apollo,
    public auth: AuthService
  ) {}

  conditions = {
    isUser: this.auth.loggedUser,
    isAdmin: this.auth.isAdmin(),
    includeProfile: true,
    includeSessions: false
  };

  create(user: User): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.mutate({
      mutation: CREATE_USER,
      variables: {
        userCreateInput: user,
        ...this.conditions
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  update(user: User): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.mutate({
      mutation: UPDATE_USER,
      variables: {
        userUpdateInput: user,
        ...this.conditions
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  updateUserPassword(user: User | string, password: string): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.mutate({
      mutation: UPDATE_USER_PASSWORD,
      variables: {
        id: typeof user == 'object' ? user.id : user,
        password: password,
        ...this.conditions
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  updateVerificationCode(user: User | string): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.mutate({
      mutation: UPDATE_USER_VERIFICATION_CODE,
      variables: {
        id: typeof user == 'object' ? user.id : user,
        ...this.conditions
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  verify(user: User | string, code: string): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.mutate({
      mutation: VERIFY_USER,
      variables: {
        id: typeof user == 'object' ? user.id : user,
        code: code,
        ...this.conditions
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  delete(user: User | string): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.mutate({
      mutation: DELETE_USER,
      variables: {
        id: typeof user == 'object' ? user.id : user
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  findOne(user: User | string): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.query({
      query: USERS,
      variables: {
        id: typeof user == 'object' ? user.id : user,
        ...this.conditions
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  findMany(params?: any): Observable<ApolloQueryResult<UserResult>> {
    return this.apollo.query({
      query: USERS,
      variables: {
        where: params?.where,
        order: params?.order,
        pagination: params?.pagination,
        isUser: this.auth.loggedUser,
        isAdmin: this.auth.isAdmin(),
        includeProfile: params?.includeProfile ?? this.conditions.includeProfile,
        includeSessions: params?.includeSessions ?? this.conditions.includeSessions
      }
    }) as Observable<ApolloQueryResult<UserResult>>;
  }

  // forgotPassword(email: string): Observable<any> {
  //   return this.http.get(`/api/user/forgot/${email}`, { responseType: 'text' });
  // }
}
