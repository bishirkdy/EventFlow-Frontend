import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpeakerModel } from '../../../../core/models/speaker/speaker.model';
import { SpeakerService } from '../../../../core/services/speaker/speaker.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({ selector:'app-speakers', standalone:true, templateUrl:'./speakers.html', styleUrl:'./speakers.css' })
export class Speakers implements OnInit {
 private readonly service=inject(SpeakerService); private readonly route=inject(ActivatedRoute); private readonly router=inject(Router); private readonly toastr=inject(ToastrService); private readonly state=inject(OrganizerEventStateService);
 speakers=signal<SpeakerModel[]>([]); loading=signal(true); deleting=signal<string|null>(null); eventId='';
 activeCount = computed(() => this.speakers().filter(speaker => speaker.isActive).length);
 organizationCount = computed(() => new Set(this.speakers().map(speaker => speaker.organization?.trim()).filter(Boolean)).size);
 ngOnInit(){this.eventId=this.findEventId(); if(!this.eventId){this.loading.set(false);this.toastr.error('Event ID not found.');return;} this.state.setEventId(this.eventId); this.load();}
 private findEventId(){for(const r of this.route.pathFromRoot){const id=r.snapshot.paramMap.get('eventId');if(id)return id;}return '';}
 load(){this.loading.set(true);this.service.getSpeakers(this.eventId).subscribe({next:r=>{this.speakers.set(r.data??[]);this.loading.set(false);},error:e=>{console.error(e);this.loading.set(false);this.toastr.error('Failed to load speakers.');}})}
 create(){this.router.navigate(['create'],{relativeTo:this.route});} view(id:string){this.router.navigate([id],{relativeTo:this.route});} edit(id:string){this.router.navigate([id,'edit'],{relativeTo:this.route});}
 remove(id:string){if(!confirm('Delete this speaker?'))return;this.deleting.set(id);this.service.deleteSpeaker(this.eventId,id).subscribe({next:r=>{this.deleting.set(null);if(r.isSuccess){this.toastr.success(r.message||'Speaker deleted.');this.load();}else this.toastr.error(r.message||'Delete failed.');},error:e=>{console.error(e);this.deleting.set(null);this.toastr.error('Failed to delete speaker.');}})}
}
