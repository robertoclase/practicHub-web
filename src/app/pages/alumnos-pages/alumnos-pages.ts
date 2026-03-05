import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ApiClient } from '../../services/api-client.service';
import { PaginatedResponse, User } from '../../services/api.types';
import { AlumnoDialogComponent } from './alumno-dialog';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-alumnos-pages',
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './alumnos-pages.html',
  styleUrl: './alumnos-pages.css',
})
export class AlumnosPages implements OnInit {
  private api = inject(ApiClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['nombre', 'email', 'creado', 'acciones'];
  dataSource = new MatTableDataSource<User>();
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (user: User, filter: string) =>
      `${user.name} ${user.email}`.toLowerCase().includes(filter);
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  load(): void {
    this.loading = true;
    this.api.list<User>('users', { per_page: '500' }).subscribe({
      next: (res: PaginatedResponse<User>) => {
        this.dataSource.data = res.data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los alumnos.', 'Cerrar', { duration: 4000 });
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(AlumnoDialogComponent, {
      width: '460px',
      disableClose: true,
      data: { alumno: null },
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.api.create<User>('users', payload).subscribe({
        next: () => { this.snackBar.open('✅ Alumno creado.', 'Cerrar', { duration: 3000 }); this.load(); },
        error: (err) => this.snackBar.open(err?.error?.message || 'Error al crear el alumno.', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  openEdit(user: User): void {
    const ref = this.dialog.open(AlumnoDialogComponent, {
      width: '460px',
      disableClose: true,
      data: { alumno: user },
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.api.update<User>('users', user.id, payload).subscribe({
        next: () => { this.snackBar.open('✅ Alumno actualizado.', 'Cerrar', { duration: 3000 }); this.load(); },
        error: (err) => this.snackBar.open(err?.error?.message || 'Error al actualizar.', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  remove(user: User): void {
    if (!confirm(`¿Eliminar al alumno "${user.name}"?`)) return;
    this.api.delete('users', user.id).subscribe({
      next: () => { this.snackBar.open('Alumno eliminado.', 'Cerrar', { duration: 3000 }); this.load(); },
      error: () => this.snackBar.open('No se pudo eliminar el alumno.', 'Cerrar', { duration: 4000 }),
    });
  }
}

