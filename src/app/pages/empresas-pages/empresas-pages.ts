import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ModalShared } from '../../shared/components/modal-shared/modal-shared';
import { EmpresasService } from '../../services/empresas.service';
import { ApiClient } from '../../services/api-client.service';
import { Empresa, EmpresaPayload, PaginatedResponse, Profesor } from '../../services/api.types';

// CIF español: letra + 7 dígitos + dígito/letra (ej: B1234567X o B12345678)
const CIF_PATTERN = /^[A-Za-z]\d{7}[0-9A-Za-z]$/;
// Teléfono español: 9 dígitos
const PHONE_PATTERN = /^[0-9]{9}$/;

@Component({
  selector: 'app-empresas-pages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminShell, ModalShared],
  templateUrl: './empresas-pages.html',
  styleUrl: './empresas-pages.css',
})
export class EmpresasPages implements OnInit, OnDestroy {
  private empresasService = inject(EmpresasService);
  private apiClient = inject(ApiClient);

  empresas: Empresa[] = [];
  profesores: Profesor[] = [];

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
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cif: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(CIF_PATTERN)],
    }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PHONE_PATTERN)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    sector: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tutor_empresa: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email_tutor: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.load();
    this.loadProfesores();
  }

  ngOnDestroy(): void {}

  load(page = 1): void {
    this.loading = true;
    this.page = page;
    this.empresasService.list(this.page, this.perPage).subscribe({
      next: (res) => {
        this.empresas = res.data;
        this.lastPage = res.last_page;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las empresas.';
        this.loading = false;
      },
    });
  }

  loadProfesores(): void {
    this.apiClient.list<Profesor>('profesores', { per_page: 100 }).subscribe({
      next: (res) => (this.profesores = res.data),
      error: () => (this.profesores = []),
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.form.reset({
      nombre: '',
      cif: '',
      direccion: '',
      telefono: '',
      email: '',
      sector: '',
      tutor_empresa: '',
      email_tutor: '',
      activo: true,
    });
    this.modalOpen = true;
  }

  openEdit(empresa: Empresa): void {
    this.editingId = empresa.id;
    this.errorMessage = '';
    this.form.patchValue({ ...empresa, activo: empresa.activo ?? true });
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
    const payload = this.form.getRawValue() as EmpresaPayload;
    const request = this.editingId
      ? this.empresasService.update(this.editingId, payload)
      : this.empresasService.create(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.modalOpen = false;
        this.load(this.page);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'No se pudo guardar la empresa.';
      },
    });
  }

  remove(empresa: Empresa): void {
    if (!confirm(`Eliminar empresa "${empresa.nombre}"?`)) return;
    this.empresasService.delete(empresa.id).subscribe({
      next: () => this.load(this.page),
      error: () => (this.errorMessage = 'No se pudo eliminar la empresa.'),
    });
  }
}
