import { Injectable } from '@angular/core';

import { Mutation, Query, gql } from 'apollo-angular';
import { SelectionField, SelectionType } from 'apollo-dynamic';
import { DynamicMutation, DynamicQuery } from 'apollo-dynamic-angular';

import { User } from './user.entity';

@SelectionType('Email', {
  default: { conditions: { isAdmin: false } }
})
export class Email {
  @SelectionField()
  id?: string;
  @SelectionField()
  address?: string;
  @SelectionField(() => User)
  user?: User;
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
}

@Injectable({ providedIn: 'root' })
export class CreateEmail extends DynamicMutation<{ createEmail: Email }> {
  override document = gql`
    mutation CreateEmail($emailCreateInput: EmailCreateInput!) {
      createEmail(emailCreateInput: $emailCreateInput) {
        Email
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class UpdateEmailVerificationCode extends DynamicMutation<{ updateEmailVerificationCode: Email }> {
  override document = gql`
    mutation UpdateEmailVerificationCode($id: UUID!) {
      updateEmailVerificationCode(id: $id) {
        Email
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class VerifyEmail extends DynamicMutation<{ verifyEmail: Email }> {
  override document = gql`
    mutation VerifyEmail($id: UUID!, $code: String!) {
      verifyEmail(id: $id, code: $code) {
        Email
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class DeleteEmail extends Mutation<{ deleteEmail: string }> {
  override document = gql`
    mutation DeleteEmail($id: UUID!, $password: String!, $code: String!) {
      deleteEmail(id: $id, password: $password, code: $code)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class CheckEmailAddressExists extends Query<{ checkEmailAddressExists: boolean }> {
  override document = gql`
    query CheckEmailAddressExists($address: String!) {
      checkEmailAddressExists(address: $address)
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindEmail extends DynamicQuery<{ email: Email }> {
  override document = gql`
    query Email($id: UUID!) {
      email(id: $id) {
        Email
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindEmails extends DynamicQuery<{ emails: { set: Email[]; count: number } }> {
  override document = gql`
    query Emails($where: [EmailWhereInput!], $order: [EmailOrderInput!], $pagination: PaginationInput) {
      emails(where: $where, order: $order, pagination: $pagination) {
        set {
          Email
        }
        count
      }
    }
  `;
}
