import { HttpClient } from '@angular/common/http'; import { inject, Injectable } from '@angular/core'; import { Observable } from 'rxjs';
import { Api } from '../../api/api'; import { SESSION_SPEAKER_ENDPOINTS } from '../../api/endpoints/session-speaker.endpoint'; import { ApiResponse } from '../../models/common/api-response'; import { SpeakerModel } from '../../models/speaker/speaker.model';
@Injectable({providedIn:'root'}) export class SessionSpeakerService { private readonly http=inject(HttpClient); private readonly api=inject(Api);
 get(eventId:string,sessionId:string):Observable<ApiResponse<Array<{id:string;speakerId:string;name:string;designation:string|null;organization:string|null;imageUrl:string|null}>>> { return this.http.get<ApiResponse<any[]>>(this.api.getUrl(SESSION_SPEAKER_ENDPOINTS.get(eventId,sessionId))); }
 assign(eventId:string,sessionId:string,speakerId:string):Observable<ApiResponse<object|null>> { return this.http.post<ApiResponse<object|null>>(this.api.getUrl(SESSION_SPEAKER_ENDPOINTS.assign(eventId,sessionId,speakerId)),{}); }
 remove(eventId:string,sessionId:string,speakerId:string):Observable<ApiResponse<object|null>> { return this.http.delete<ApiResponse<object|null>>(this.api.getUrl(SESSION_SPEAKER_ENDPOINTS.remove(eventId,sessionId,speakerId))); }
}
