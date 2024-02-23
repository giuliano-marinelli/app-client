import { gql } from 'apollo-angular';

import { User } from '../app/shared/models/user.model';

export type UserResult = {
  createUser: User;
  updateUser: User;
  updateUserPassword: User;
  deleteUser: string;
  user: User;
  users: User[];
};

const USER_FIELDS = `
  id
  username
  email
  role
  profile @include(if: $includeProfile){
    avatar
    name
    bio
    location
    url
  }
  verified
  verificationCode @include(if: $isAdmin)
  lastVerificationTry @include(if: $isAdmin)
  createdAt
  updatedAt
  deletedAt
  sessions @include(if: $includeSessions) {
    id
    token @include(if: $isAdmin)
    device {
      client
      os
      brand
      model
      type
      bot
      ip
    }
    lastActivity
    blockedAt
    closedAt
    createdAt
    updatedAt
  }
`;

const USER_PARAMS = `$isAdmin: Boolean = false, $includeProfile: Boolean = false, $includeSessions: Boolean = false`;

export const CREATE_USER = gql`
  mutation CreateUser($userCreateInput: UserCreateInput!, ${USER_PARAMS}) {
    createUser(userCreateInput: $userCreateInput) {
      ${USER_FIELDS}
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($userUpdateInput: UserUpdateInput!, ${USER_PARAMS}) {
    updateUser(userUpdateInput: $userUpdateInput) {
      ${USER_FIELDS}
    }
  }
`;

export const UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword($id: UUID!, $password: String!, ${USER_PARAMS}) {
    updateUserPassword(id: $id, password: $password) {
      ${USER_FIELDS}
    }
  }
`;

export const UPDATE_USER_VERIFICATION_CODE = gql`
  mutation UpdateUserVerificationCode($id: UUID!, ${USER_PARAMS}) {
    updateUserVerificationCode(id: $id) {
      ${USER_FIELDS}
    }
  }
`;

export const VERIFY_USER = gql`
  mutation VerifyUser($id: UUID!, $code: String!, ${USER_PARAMS}) {
    verify(id: $id, code: $code) {
      ${USER_FIELDS}
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: UUID!) {
    deleteUser(id: $id)
  }
`;

export const USER = gql`
  query User($id: UUID!, ${USER_PARAMS}) {
    user(id: $id) {
      ${USER_FIELDS}
    }
  }
`;

export const USERS = gql`
  query Users($where: [UserWhereInput!], $order: [UserOrderInput!], $pagination: PaginationInput, ${USER_PARAMS}) {
    users(where: $where, order: $order, pagination: $pagination) {
      ${USER_FIELDS}
    }
  }
`;
