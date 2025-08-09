import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';

import { FindUsers } from '../entities/user.entity';
import { map } from 'rxjs';

export const UserExistsGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const _findUsers = inject(FindUsers);
  const username = segments[0].path; // assuming the username is the first segment of the path

  return _findUsers.fetch({ where: { username: { eq: username } } }).pipe(
    map(({ data, errors }) => {
      if (errors) return false;
      if (data?.users?.set) {
        return data.users.set.length > 0; // check if any user exists with the given username
      }
      return false; // no user found
    })
  );
};
