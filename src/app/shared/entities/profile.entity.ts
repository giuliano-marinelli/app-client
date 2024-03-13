import { SelectionField, SelectionType } from 'apollo-dynamic';

import { Email } from './email.entity';

@SelectionType('Profile')
export class Profile {
  @SelectionField()
  avatar?: string;
  @SelectionField()
  name?: string;
  @SelectionField()
  bio?: string;
  @SelectionField()
  location?: string;
  @SelectionField()
  url?: string;
  @SelectionField(() => Email)
  publicEmail?: Email;
}
