import { SelectionField, SelectionType } from 'apollo-dynamic';

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
}
