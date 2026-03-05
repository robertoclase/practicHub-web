import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ApiClient } from '../../services/api-client.service';
import { PaginatedResponse, User } from '../../services/api.types';

@Component({
  selector: 'app-alumnos-pages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminShell],
  templateUrl: './alumnos-pages.html',
  styleUrl: './alumnos-pages.css',
})
export class AlumnosPages implements OnInit, OnDestroy {
  private api = inject(ApiClient);

  alumnos: User[] = [];
  loading = false;
  saving = false;
  modalOpen = false;
  errorMessage = '';

  page = 1;
  perPage = 10;
  lastPage = 1;
  total = 0;

  editingId: number | null = null;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {}

  load(page = 1): void {
    this.loading = true;
    this.page = page;
    this.api.list<User>('users', { page: this.page, per_page: this.perPage }).subscribe({
      next: (res: PaginatedResponse<User>) => {
        this.alumnos = res.data;
        this.lastPage = res.last_page;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los alumnos.';
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.form.reset({ name: '', email: '', password: '' });
    this.modalOpen = true;
  }

  openEdit(alumno: User): void {
    this.editingId = alumno.id;
    this.errorMessage = '';
    this.form.patchValue({ name: alumno.name, email: alumno.email, password: '' });
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
      ? this.api.update<User>('users', this.editingId, payload)
      : this.api.create<User>('users', payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.modalOpen = false;
        this.load(this.page);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'No se pudo guardar el alumno.';
      },
    });
  }

  remove(alumno: User): void {
    if (!confirm(`Eliminar alumno "${alumno.name}"?`)) return;
    this.api.delete('users', alumno.id).subscribe({
      next: () => this.load(this.page),
      error: () => (this.errorMessage = 'No se pudo eliminar el alumno.'),
    });
  }
}

