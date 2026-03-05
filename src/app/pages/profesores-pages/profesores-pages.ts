import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ApiClient } from '../../services/api-client.service';
import { PaginatedResponse, Profesor } from '../../services/api.types';
import { ProfesorDialogComponent } from './profesor-dialog';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profesores-pages',
  standalone: true,
  imports: [
    CommonModule,
    AdminShell,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './profesores-pages.html',
  styleUrl: './profesores-pages.css',
})
export class ProfesoresPages implements OnInit {
  private api = inject(ApiClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['nombre', 'dni', 'departamento', 'especialidad', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Profesor>();
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (p: Profesor, filter: string) =>
      `${p.user?.name} ${p.user?.email} ${p.dni} ${p.departamento} ${p.especialidad}`.toLowerCase().includes(filter);
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  load(): void {
    this.loading = true;
    this.api.list<Profesor>('profesores', { per_page: '500' }).subscribe({
      next: (res: PaginatedResponse<Profesor>) => {
        this.dataSource.data = res.data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los profesores.', 'Cerrar', { duration: 4000 });
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(ProfesorDialogComponent, {
      width: '560px',
      disableClose: true,
      data: { profesor: null },
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.api.create<Profesor>('profesores', payload).subscribe({
        next: () => { this.snackBar.open('✅ Profesor creado.', 'Cerrar', { duration: 3000 }); this.load(); },
        error: (err) => this.snackBar.open(err?.error?.message || 'Error al crear el profesor.', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  openEdit(profesor: Profesor): void {
    const ref = this.dialog.open(ProfesorDialogComponent, {
      width: '560px',
      disableClose: true,
      data: { profesor },
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.api.update<Profesor>('profesores', profesor.id, payload).subscribe({
        next: () => { this.snackBar.open('✅ Profesor actualizado.', 'Cerrar', { duration: 3000 }); this.load(); },
        error: (err) => this.snackBar.open(err?.error?.message || 'Error al actualizar.', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  remove(profesor: Profesor): void {
    const name = profesor.user?.name ?? 'este profesor';
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    this.api.delete('profesores', profesor.id).subscribe({
      next: () => { this.snackBar.open('Profesor eliminado.', 'Cerrar', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('No se pudo eliminar el profesor.', 'Cerrar', { duration: 4000 }),
    });
  }
}

