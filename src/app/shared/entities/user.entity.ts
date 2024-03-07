import { Injectable } from '@angular/core';

import { Mutation, Query, gql } from 'apollo-angular';
import { SelectionField, SelectionType } from 'apollo-dynamic';
import { DynamicMutation, DynamicQuery } from 'apollo-dynamic-angular';

import { Profile } from './profile.entity';
import { Session } from './session.entity';

@SelectionType('User', {
  default: { relations: { profile: true }, conditions: { isAdmin: false } }
})
export class User {
  @SelectionField()
  id?: string;
  @SelectionField()
  username?: string;
  @SelectionField()
  email?: string;
  @SelectionField()
  role?: string;
  @SelectionField(() => Profile)
  profile?: Profile;
  @SelectionField()
  verified?: boolean;
  @SelectionField({ include: 'isAdmin' })
  verificationCode?: string;
  @SelectionField({ include: 'isAdmin' })
  lastVerificationTry?: Date;
  @SelectionField()
  createdAt?: Date;
  @SelectionField()
  updatedAt?: Date;
  @SelectionField()
  deletedAt?: Date;
  @SelectionField(() => Session)
  sessions?: Session[];
}

@Injectable({ providedIn: 'root' })
export class Login extends Query<{ login: string }> {
  override document = gql`
    query Login($usernameOrEmail: String!, $password: String!) {
      login(usernameOrEmail: $usernameOrEmail, password: $password)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class Logout extends Query<{ logout: boolean }> {
  override document = gql`
    query Logout {
      logout
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CreateUser extends DynamicMutation<{ createUser: User }> {
  override document = gql`
    mutation CreateUser($userCreateInput: UserCreateInput!) {
      createUser(userCreateInput: $userCreateInput) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateUser extends DynamicMutation<{ updateUser: User }> {
  override document = gql`
    mutation UpdateUser($userUpdateInput: UserUpdateInput!, $avatarFile: Upload) {
      updateUser(userUpdateInput: $userUpdateInput, avatarFile: $avatarFile) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateUserPassword extends DynamicMutation<{ updateUserPassword: User }> {
  override document = gql`
    mutation UpdateUserPassword($id: UUID!, $password: String!, $newPassword: String!) {
      updateUserPassword(id: $id, password: $password, newPassword: $newPassword) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateUserVerificationCode extends DynamicMutation<{ updateUserVerificationCode: User }> {
  override document = gql`
    mutation UpdateUserVerificationCode($id: UUID!) {
      updateUserVerificationCode(id: $id) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class VerifyUser extends DynamicMutation<{ verifyUser: User }> {
  override document = gql`
    mutation VerifyUser($id: UUID!, $code: String!) {
      verifyUser(id: $id, code: $code) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class DeleteUser extends Mutation<{ deleteUser: string }> {
  override document = gql`
    mutation DeleteUser($id: UUID!, $password: String!) {
      deleteUser(id: $id, password: $password)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CheckPasswordUser extends Query<{ checkPasswordUser: boolean }> {
  override document = gql`
    query CheckPasswordUser($id: UUID!, $password: String!) {
      checkPasswordUser(id: $id, password: $password)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindUser extends DynamicQuery<{ user: User }> {
  override document = gql`
    query User($id: UUID!) {
      user(id: $id) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindUsers extends DynamicQuery<{ users: { set: User[]; count: number } }> {
  override document = gql`
    query Users($where: [UserWhereInput!], $order: [UserOrderInput!], $pagination: PaginationInput) {
      users(where: $where, order: $order, pagination: $pagination) {
        set {
          User
        }
        count
      }
    }
  `;
}
