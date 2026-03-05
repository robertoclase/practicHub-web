import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';
import { Empresa, EmpresaPayload, PaginatedResponse } from './api.types';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private api = inject(ApiClient);

  list(page: number, perPage: number): Observable<PaginatedResponse<Empresa>> {
    return this.api.list<Empresa>('empresas', {
      page,
      per_page: perPage,
    });
  }

  create(payload: EmpresaPayload): Observable<Empresa> {
    return this.api.create<Empresa>('empresas', payload);
  }

  update(id: number, payload: EmpresaPayload): Observable<Empresa> {
    return this.api.update<Empresa>('empresas', id, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete('empresas', id);
  }
}
