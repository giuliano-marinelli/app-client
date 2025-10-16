import { Injectable, inject, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { FindUser, FindUsers, User } from '../shared/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  _findUser: FindUser = inject(FindUser);
  _findUsers: FindUsers = inject(FindUsers);

  user = signal<User | null>(null);
  loading = signal(false);

  async fetchUser(username: string): Promise<void> {
    this.loading.set(true);
    const result = await lastValueFrom(
      (
        this._findUsers({
          relations: {
            profile: {
              publicEmail: true
            },
            primaryEmail: true,
            ownMetaModels: true,
            pinnedMetaModels: {
              owner: true
            },
            ownModels: true,
            pinnedModels: {
              owner: true
            }
          }
        }) as FindUsers
      ).fetch({ where: { username: { eq: username } } })
    );
    if (result.error) throw result.error;
    if (result.data?.users?.set?.[0]) this.user.set(result.data.users.set[0] as User);
    this.loading.set(false);
  }

  async fetchUserById(id: string): Promise<void> {
    this.loading.set(true);
    const result = await lastValueFrom(
      (
        this._findUser({
          relations: {
            profile: {
              publicEmail: true
            },
            primaryEmail: true,
            ownMetaModels: true,
            pinnedMetaModels: true,
            ownModels: true,
            pinnedModels: true
          }
        }) as FindUser
      ).fetch({ id: id })
    );
    if (result.error) throw result.error;
    if (result.data?.user) this.user.set(result.data?.user as User);
    this.loading.set(false);
  }

  async refetchUser(): Promise<void> {
    if (this.user()?.id) this.fetchUserById(this.user()!.id!);
  }

  reset(): void {
    this.user.set(null);
    this.loading.set(false);
  }
}
