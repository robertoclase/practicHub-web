import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './api.types';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api';

  list<T>(resource: string, params?: Record<string, unknown>): Observable<PaginatedResponse<T>> {
    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${resource}` || '', {
      params: this.buildParams(params),
    });
  }

  get<T>(resource: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${resource}/${id}`);
  }

  getRaw<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`);
  }

  create<T>(resource: string, payload: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${resource}`, payload);
  }

  createMultipart<T>(resource: string, payload: Record<string, unknown>): Observable<T> {
    const fd = this.buildFormData(payload);
    return this.http.post<T>(`${this.baseUrl}/${resource}`, fd);
  }

  update<T>(resource: string, id: number | string, payload: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${resource}/${id}` || '', payload);
  }

  updateMultipart<T>(resource: string, id: number | string, payload: Record<string, unknown>): Observable<T> {
    const fd = this.buildFormData(payload);
    fd.append('_method', 'PUT'); // Laravel method spoofing
    return this.http.post<T>(`${this.baseUrl}/${resource}/${id}`, fd);
  }

  private buildFormData(payload: Record<string, unknown>): FormData {
    const fd = new FormData();
    for (const [key, val] of Object.entries(payload)) {
      if (val === null || val === undefined) continue;
      if (val instanceof File) {
        fd.append(key, val, val.name);
      } else {
        fd.append(key, String(val));
      }
    }
    return fd;
  }

  delete(resource: string, id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${resource}/${id}`);
  }

  private buildParams(params?: Record<string, unknown>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    const filtered = Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value === undefined || value === null) {
        return acc;
      }
      acc[key] = String(value);
      return acc;
    }, {});

    return new HttpParams({ fromObject: filtered });
  }
}
