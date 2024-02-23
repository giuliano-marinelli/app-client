import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Global } from '../shared/global/global';
import { Observable } from 'rxjs';

import { Session } from '../shared/models/session.model';

@Injectable()
export class SessionsService {
  constructor(private http: HttpClient) {}

  // getSessions(params?: any): Observable<Session[]> {
  //   return this.http.post<Session[]>('/api/sessions', params);
  // }

  // countSessions(params?: any): Observable<number> {
  //   return this.http.post<number>('/api/sessions/count', params);
  // }

  // editSession(session: Session): Observable<any> {
  //   return this.http.post(`/api/session/${session.id}`, Global.createFormData(session), { responseType: 'text' });
  // }
}
