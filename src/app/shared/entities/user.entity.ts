import { Injectable } from '@angular/core';

import { gql } from 'apollo-angular';
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
export class UpdateUser extends DynamicMutation {
  override document = gql`
    mutation UpdateUser($userUpdateInput: UserUpdateInput!) {
      updateUser(userUpdateInput: $userUpdateInput) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateUserPassword extends DynamicMutation {
  override document = gql`
    mutation UpdateUserPassword($id: UUID!, $password: String!) {
      updateUserPassword(id: $id, password: $password) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateUserVerificationCode extends DynamicMutation {
  override document = gql`
    mutation UpdateUserVerificationCode($id: UUID!) {
      updateUserVerificationCode(id: $id) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class VerifyUser extends DynamicMutation {
  override document = gql`
    mutation VerifyUser($id: UUID!, $code: String!) {
      verifyUser(id: $id, code: $code) {
        User
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class DeleteUser extends DynamicMutation {
  override document = gql`
    mutation DeleteUser($id: UUID!) {
      deleteUser(id: $id)
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
export class FindUsers extends DynamicQuery<{ users: User[] }> {
  override document = gql`
    query Users($where: [UserWhereInput!], $order: [UserOrderInput!], $pagination: PaginationInput) {
      users(where: $where, order: $order, pagination: $pagination) {
        User
      }
    }
  `;
}
