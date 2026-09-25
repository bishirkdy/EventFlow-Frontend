import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../api/api';
import { SPONSOR_ENDPOINTS } from '../../api/endpoints/sponsor.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import { CreateSponsorModel } from '../../models/sponsor/create-sponsor.model';
import { SponsorModel } from '../../models/sponsor/sponsor.model';
import { UpdateSponsorModel } from '../../models/sponsor/update-sponsor.model';
@Injectable({providedIn:'root'})
export class SponsorService {
  private readonly http=inject(HttpClient); private readonly api=inject(Api);
  getSponsors(eventId:string):Observable<ApiResponse<SponsorModel[]>> { return this.http.get<ApiResponse<SponsorModel[]>>(this.api.getUrl(SPONSOR_ENDPOINTS.getSponsors(eventId))); }
  getSponsorById(eventId:string,id:string):Observable<ApiResponse<SponsorModel>> { return this.http.get<ApiResponse<SponsorModel>>(this.api.getUrl(SPONSOR_ENDPOINTS.getSponsorById(eventId,id))); }
  createSponsor(eventId:string,request:CreateSponsorModel):Observable<ApiResponse<string>> { return this.http.post<ApiResponse<string>>(this.api.getUrl(SPONSOR_ENDPOINTS.createSponsor(eventId)),this.toFormData(request)); }
  updateSponsor(eventId:string,id:string,request:UpdateSponsorModel):Observable<ApiResponse<object|null>> { return this.http.put<ApiResponse<object|null>>(this.api.getUrl(SPONSOR_ENDPOINTS.updateSponsor(eventId,id)),this.toFormData(request)); }
  deleteSponsor(eventId:string,id:string):Observable<ApiResponse<object|null>> { return this.http.delete<ApiResponse<object|null>>(this.api.getUrl(SPONSOR_ENDPOINTS.deleteSponsor(eventId,id))); }
  private toFormData(request:CreateSponsorModel|UpdateSponsorModel):FormData { const fd=new FormData(); fd.append('Name',request.name); fd.append('Description',request.description??''); fd.append('WebsiteUrl',request.websiteUrl??''); fd.append('SponsorLevel',request.sponsorLevel); fd.append('DisplayOrder',String(request.displayOrder??0)); if('isActive' in request) fd.append('IsActive',String(request.isActive)); if(request.logo) fd.append('Logo',request.logo,request.logo.name); return fd; }
}
