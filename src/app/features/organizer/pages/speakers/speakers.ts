import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { SpeakerModel } from '../../../../core/models/speaker';
import { SpeakerService } from '../../../../core/services/speaker/speaker.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { createAsyncAction } from 'core/state';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';

@Component({ selector:'app-speakers', standalone:true, imports:[Skeleton], templateUrl:'./speakers.html', styleUrl:'./speakers.css' })
export class Speakers implements OnInit {
 private readonly service=inject(SpeakerService); private readonly route=inject(ActivatedRoute); private readonly router=inject(Router); private readonly toastr=inject(NotificationService); private readonly state=inject(OrganizerEventStateService);
 speakers=signal<SpeakerModel[]>([]); deleting=signal<string|null>(null); eventId='';
 private readonly loadAction=createAsyncAction(()=>this.service.getSpeakers(this.eventId),{toastErrors:true,errorFallback:'Failed to load speakers.',onSuccess:r=>this.speakers.set(r.data??[])});
 private readonly removeAction=createAsyncAction((id:string)=>this.service.deleteSpeaker(this.eventId,id),{onSettled:()=>this.deleting.set(null),onSuccess:r=>{if(r.isSuccess){this.toastr.success(r.message||'Speaker deleted.');this.load();}else this.toastr.error(r.message||'Delete failed.');}});
 loading=this.loadAction.pending;
 activeCount = computed(() => this.speakers().filter(speaker => speaker.isActive).length);
 organizationCount = computed(() => new Set(this.speakers().map(speaker => speaker.organization?.trim()).filter(Boolean)).size);
 ngOnInit(){this.eventId=this.findEventId(); if(!this.eventId){this.toastr.error('Event ID not found.');return;} this.state.setEventId(this.eventId); this.load();}
 private findEventId(){for(const r of this.route.pathFromRoot){const id=r.snapshot.paramMap.get('eventId');if(id)return id;}return '';}
 load(){this.loadAction.run();}
 create(){this.router.navigate(['create'],{relativeTo:this.route});} view(id:string){this.router.navigate([id],{relativeTo:this.route});} edit(id:string){this.router.navigate([id,'edit'],{relativeTo:this.route});}
 remove(id:string){if(!confirm('Delete this speaker?'))return;this.deleting.set(id);this.removeAction.run(id);}
}
