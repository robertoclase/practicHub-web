import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ModalShared } from '../../shared/components/modal-shared/modal-shared';
import { ApiClient } from '../../services/api-client.service';
import { PaginatedResponse, Profesor } from '../../services/api.types';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profesores-pages',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminShell,
    ModalShared,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './profesores-pages.html',
  styleUrl: './profesores-pages.css',
})
export class ProfesoresPages implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiClient);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<Profesor>([]);
  displayedColumns = ['nombre', 'dni', 'departamento', 'especialidad', 'estado', 'acciones'];

  loading = false;
  saving = false;
  modalOpen = false;
  errorMessage = '';

  editingId: number | null = null;

  form = new FormGroup({
    dni: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    departamento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    especialidad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {}

  load(): void {
    this.loading = true;
    this.api.list<Profesor>('profesores', { per_page: 100 }).subscribe({
      next: (res: PaginatedResponse<Profesor>) => {
        this.dataSource.data = res.data;
        this.loading = false;
        Promise.resolve().then(() => {
          if (this.sort) this.dataSource.sort = this.sort;
          if (this.paginator) this.dataSource.paginator = this.paginator;
        });
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los profesores.';
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openCreate(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.form.reset({ dni: '', departamento: '', especialidad: '', telefono: '', activo: true });
    this.modalOpen = true;
  }

  openEdit(profesor: Profesor): void {
    this.editingId = profesor.id;
    this.errorMessage = '';
    this.form.patchValue({ ...profesor, activo: profesor.activo ?? true });
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

