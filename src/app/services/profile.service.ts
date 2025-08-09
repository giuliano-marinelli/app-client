import { Injectable, signal } from '@angular/core';

import { FindUser, FindUsers, User } from '../shared/entities/user.entity';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  public user = signal<User | null>(null);
  public loading = signal(false);

  constructor(
    private _findUser: FindUser,
    private _findUsers: FindUsers
  ) {}

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
    if (result.errors) throw result.errors;
    if (result.data?.users?.set?.[0]) this.user.set(result.data.users.set[0]);
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
    if (result.errors) throw result.errors;
    if (result.data?.user) this.user.set(result.data?.user);
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
