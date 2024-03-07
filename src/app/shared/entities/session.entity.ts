import { Injectable } from '@angular/core';

import { gql } from 'apollo-angular';
import { SelectionField, SelectionType } from 'apollo-dynamic';
import { DynamicMutation, DynamicQuery } from 'apollo-dynamic-angular';

import { Device } from './device.entity';
import { User } from './user.entity';

@SelectionType('Session', {
  default: { relations: { device: true }, conditions: { isAdmin: false } }
})
export class Session {
  @SelectionField()
  id?: string;
  @SelectionField(() => User)
  user?: User;
  @SelectionField()
  token?: string;
  @SelectionField(() => Device)
  device?: Device;
  @SelectionField()
  lastActivity?: Date;
  @SelectionField()
  blockedAt?: Date;
  @SelectionField()
  closedAt?: Date;
  @SelectionField()
  createdAt?: Date;
  @SelectionField()
  updatedAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class CloseSession extends DynamicMutation<{ closeSession: Session }> {
  override document = gql`
    mutation CloseSession($id: UUID!) {
      closeSession(id: $id) {
        Session
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindSession extends DynamicQuery<{ session: Session }> {
  override document = gql`
    query Session($id: UUID!) {
      session(id: $id) {
        Session
      }
    }
  `;
}

@Injectable({ providedIn: 'root' })
export class FindSessions extends DynamicQuery<{ sessions: { set: Session[]; count: number } }> {
  override document = gql`
    query Sessions($where: [SessionWhereInput!], $order: [SessionOrderInput!], $pagination: PaginationInput) {
      sessions(where: $where, order: $order, pagination: $pagination) {
        set {
          Session
        }
        count
      }
    }
  `;
}
