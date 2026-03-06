import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ModalShared } from '../../shared/components/modal-shared/modal-shared';
import { ApiClient } from '../../services/api-client.service';
import { PaginatedResponse, Profesor } from '../../services/api.types';

@Component({
  selector: 'app-profesores-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminShell, ModalShared],
  templateUrl: './profesores-pages.html',
  styleUrl: './profesores-pages.css',
})
export class ProfesoresPages implements OnInit, OnDestroy {
  private api = inject(ApiClient);

  profesores: Profesor[] = [];
  searchTerm = '';

  loading = false;
  saving = false;
  modalOpen = false;
  errorMessage = '';

  editingId: number | null = null;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    departamento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    especialidad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {}

  get filtered(): Profesor[] {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.profesores;
    return this.profesores.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(term) ||
        p.dni?.toLowerCase().includes(term) ||
        p.departamento?.toLowerCase().includes(term) ||
        p.especialidad?.toLowerCase().includes(term),
    );
  }

  load(): void {
    this.loading = true;
    this.api.list<Profesor>('profesores', { per_page: 100 }).subscribe({
      next: (res: PaginatedResponse<Profesor>) => {
        this.profesores = res.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los profesores.';
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.form.reset({ name: '', email: '', password: '', dni: '', departamento: '', especialidad: '', telefono: '', activo: true });
    this.modalOpen = true;
  }

  openEdit(profesor: Profesor): void {
    this.editingId = profesor.id;
    this.errorMessage = '';
    this.form.patchValue({
      name: profesor.user?.name ?? '',
      email: profesor.user?.email ?? '',
      password: '',
      dni: profesor.dni,
      departamento: profesor.departamento,
      especialidad: profesor.especialidad,
      telefono: profesor.telefono,
      activo: profesor.activo ?? true,
    });
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.saving = false;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload = this.form.getRawValue();
    const request = this.editingId
      ? this.api.update<Profesor>('profesores', this.editingId, payload)
      : this.api.create<Profesor>('profesores', payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.modalOpen = false;
        this.load();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'No se pudo guardar el profesor.';
      },
    });
  }

  remove(profesor: Profesor): void {
    if (!confirm(`Eliminar profesor "${profesor.user?.name ?? profesor.dni}"?`)) return;
    this.api.delete('profesores', profesor.id).subscribe({
      next: () => this.load(),
      error: () => (this.errorMessage = 'No se pudo eliminar el profesor.'),
    });
  }
}
