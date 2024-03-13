import { Injectable } from '@angular/core';

import { Mutation, Query, gql } from 'apollo-angular';
import { SelectionField, SelectionType } from 'apollo-dynamic';
import { DynamicMutation, DynamicQuery } from 'apollo-dynamic-angular';

import { Email } from './email.entity';
import { Profile } from './profile.entity';
import { Session } from './session.entity';

@SelectionType('User', {
  default: {
    relations: {
      profile: {
        publicEmail: true
      },
      primaryEmail: true
    },
    conditions: { isAdmin: false }
  }
})
export class User {
  @SelectionField()
  id?: string;
  @SelectionField()
  username?: string;
  @SelectionField()
  role?: string;
  @SelectionField(() => Email)
  primaryEmail?: Email;
  @SelectionField(() => Profile)
  profile?: Profile;
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
  @SelectionField(() => Email)
  emails?: Email[];
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
export class UpdateUserPasswordCode extends DynamicMutation<{ updateUserPasswordCode: User }> {
  override document = gql`
    mutation UpdateUserPasswordCode($usernameOrEmail: String!) {
      updateUserPasswordCode(usernameOrEmail: $usernameOrEmail) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateUserVerificationCode extends DynamicMutation<{ updateUserVerificationCode: Email }> {
  override document = gql`
    mutation UpdateUserVerificationCode($id: UUID!) {
      updateUserVerificationCode(id: $id) {
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
export class UpdateUserPrimaryEmail extends DynamicMutation<{ updateUserPrimaryEmail: User }> {
  override document = gql`
    mutation UpdateUserPrimaryEmail($id: UUID!, $password: String!, $code: String!, $email: EmailRefInput!) {
      updateUserPrimaryEmail(id: $id, password: $password, code: $code, email: $email) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class ResetUserPassword extends DynamicMutation<{ resetUserPassword: User }> {
  override document = gql`
    mutation ResetUserPassword($code: String!, $newPassword: String!) {
      resetUserPassword(code: $code, newPassword: $newPassword) {
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
export class CheckUserVerificationCode extends Query<{ checkUserVerificationCode: boolean }> {
  override document = gql`
    query CheckUserVerificationCode($id: UUID!, $code: String!) {
      checkUserVerificationCode(id: $id, code: $code)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CheckUserPassword extends Query<{ checkUserPassword: boolean }> {
  override document = gql`
    query CheckUserPassword($id: UUID!, $password: String!) {
      checkUserPassword(id: $id, password: $password)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CheckUserUsernameExists extends Query<{ checkUserUsernameExists: boolean }> {
  override document = gql`
    query CheckUserUsernameExists($username: String!) {
      checkUserUsernameExists(username: $username)
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
