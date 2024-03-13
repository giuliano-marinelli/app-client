import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { FindUsers, User } from '../shared/entities/user.entity';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userLoading: boolean = true;

  user?: User;

  //router params
  username!: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public titleService: Title,
    public changeDetector: ChangeDetectorRef,
    private _findUsers: FindUsers
  ) {
    this.route.params.subscribe((params) => {
      this.username = params['username'];
    });
  }

  ngOnInit(): void {
    if (!this.username) this.router.navigate(['/']);
    this.getUser();
  }

  getUser(): void {
    this.userLoading = true;
    this._findUsers
      .fetch({ where: { username: { eq: this.username } } })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.router.navigate(['not-found']);
            return;
          }
          if (data?.users?.set) {
            this.user = data.users.set[0] ?? null;
            if (this.user) {
              this.titleService.setTitle(
                this.user.username + (this.user.profile?.name ? ' (' + this.user.profile?.name + ')' : '')
              );
            } else {
              this.router.navigate(['not-found']);
            }
          }
        }
      })
      .add(() => {
        this.userLoading = false;
      });
  }
}
