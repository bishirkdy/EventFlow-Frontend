import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../api/api';
import { SPEAKER_ENDPOINTS } from '../../api/endpoints/speaker.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import { CreateSpeakerModel } from '../../models/speaker/create-speaker.model';
import { SpeakerDetailsModel, SpeakerModel } from '../../models/speaker/speaker.model';
import { UpdateSpeakerModel } from '../../models/speaker/update-speaker.model';
@Injectable({providedIn:'root'})
export class SpeakerService {
  private readonly http=inject(HttpClient); private readonly api=inject(Api);
  getSpeakers(eventId:string):Observable<ApiResponse<SpeakerModel[]>> { return this.http.get<ApiResponse<SpeakerModel[]>>(this.api.getUrl(SPEAKER_ENDPOINTS.getSpeakers(eventId))); }
  getSpeakerById(eventId:string,id:string):Observable<ApiResponse<SpeakerDetailsModel>> { return this.http.get<ApiResponse<SpeakerDetailsModel>>(this.api.getUrl(SPEAKER_ENDPOINTS.getSpeakerById(eventId,id))); }
  createSpeaker(eventId:string,request:CreateSpeakerModel):Observable<ApiResponse<string>> { return this.http.post<ApiResponse<string>>(this.api.getUrl(SPEAKER_ENDPOINTS.createSpeaker(eventId)),this.toFormData(request)); }
  updateSpeaker(eventId:string,id:string,request:UpdateSpeakerModel):Observable<ApiResponse<object|null>> { return this.http.put<ApiResponse<object|null>>(this.api.getUrl(SPEAKER_ENDPOINTS.updateSpeaker(eventId,id)),this.toFormData(request)); }
  deleteSpeaker(eventId:string,id:string):Observable<ApiResponse<object|null>> { return this.http.delete<ApiResponse<object|null>>(this.api.getUrl(SPEAKER_ENDPOINTS.deleteSpeaker(eventId,id))); }
  private toFormData(request:CreateSpeakerModel|UpdateSpeakerModel):FormData { const fd=new FormData(); fd.append('Name',request.name); fd.append('Bio',request.bio??''); fd.append('Designation',request.designation??''); fd.append('Organization',request.organization??''); fd.append('Email',request.email??''); fd.append('DisplayOrder',String(request.displayOrder??0)); if('isActive' in request) fd.append('IsActive',String(request.isActive)); if(request.image) fd.append('Image',request.image,request.image.name); return fd; }
}
