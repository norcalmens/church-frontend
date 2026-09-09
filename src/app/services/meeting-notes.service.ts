import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MeetingNoteAttachment {
  id: number;
  fileName: string;
  contentType?: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface MeetingNote {
  id?: number;
  title: string;
  meetingDate: string;         // ISO date "YYYY-MM-DD"
  body?: string;
  attendees?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: MeetingNoteAttachment[];
}

@Injectable({ providedIn: 'root' })
export class MeetingNotesService {
  private http = inject(HttpClient);

  list(): Observable<MeetingNote[]> {
    return this.http.get<MeetingNote[]>('/api/meeting-notes');
  }
  get(id: number): Observable<MeetingNote> {
    return this.http.get<MeetingNote>(`/api/meeting-notes/${id}`);
  }
  create(note: MeetingNote): Observable<MeetingNote> {
    return this.http.post<MeetingNote>('/api/meeting-notes', note);
  }
  update(id: number, note: MeetingNote): Observable<MeetingNote> {
    return this.http.put<MeetingNote>(`/api/meeting-notes/${id}`, note);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/meeting-notes/${id}`);
  }

  /** Upload a single file to a meeting note. Multipart -- browser sets
   *  the boundary Content-Type automatically. */
  uploadAttachment(noteId: number, file: File): Observable<MeetingNoteAttachment> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<MeetingNoteAttachment>(
      `/api/meeting-notes/${noteId}/attachments`, form);
  }

  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`/api/meeting-notes/attachments/${attachmentId}`);
  }

  /** Absolute URL for the file-download endpoint. Same origin swap the
   *  apiUrlInterceptor does for /api/ calls -- attachments open in a new
   *  tab so the browser gets a Content-Disposition download prompt. */
  downloadUrl(attachmentId: number): string {
    const base = environment.production ? environment.apiUrl : '';
    return `${base}/api/meeting-notes/attachments/${attachmentId}/download`;
  }
}
