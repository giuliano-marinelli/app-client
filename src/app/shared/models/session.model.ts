import { Device } from './device.model';
import { User } from './user.model';

export class Session {
  id?: string;
  user?: User;
  token?: string;
  device?: Device;
  lastActivity?: Date;
  blockedAt?: Date;
  closedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
