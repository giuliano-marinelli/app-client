import { Profile } from './profile.model';
import { Session } from './session.model';

export class User {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  profile?: Profile;
  verified?: boolean;
  verificationCode?: string;
  lastVerificationTry?: Date;
  createdAt?: Date;
  updateAt?: Date;
  deletedAt?: Date;
  sessions?: Session[];
}
