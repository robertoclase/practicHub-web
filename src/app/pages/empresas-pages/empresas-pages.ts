import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { EmpresasService } from '../../services/empresas.service';
import { ApiClient } from '../../services/api-client.service';
import { Empresa, EmpresaPayload, PaginatedResponse, Profesor } from '../../services/api.types';

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
import { EmpresaDialogComponent } from './empresa-dialog';

@Component({
  selector: 'app-empresas-pages',
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
  templateUrl: './empresas-pages.html',
  styleUrl: './empresas-pages.css',
})
export class EmpresasPages implements OnInit {
  private empresasService = inject(EmpresasService);
  private apiClient = inject(ApiClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['nombre', 'cif', 'sector', 'contacto', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Empresa>();

  profesores: Profesor[] = [];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadProfesores();
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Custom filter predicate: search in nombre, cif, sector, tutor
    this.dataSource.filterPredicate = (empresa: Empresa, filter: string) => {
      const str = `${empresa.nombre} ${empresa.cif} ${empresa.sector} ${empresa.tutor_empresa} ${empresa.email}`.toLowerCase();
      return str.includes(filter);
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private loadProfesores(): void {
    this.apiClient
      .list<Profesor>('profesores', { only_active: 'true', per_page: '100' })
      .subscribe({
        next: (res: PaginatedResponse<Profesor>) => { this.profesores = res.data; },
        error: () => {},
      });
  }

  load(): void {
    this.loading = true;
    this.empresasService.list(1, 1000).subscribe({
      next: (res: PaginatedResponse<Empresa>) => {
        this.dataSource.data = res.data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar las empresas.', 'Cerrar', { duration: 4000 });
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(EmpresaDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { empresa: null, profesores: this.profesores },
    });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.empresasService.create(payload as EmpresaPayload).subscribe({
        next: () => {
          this.snackBar.open('✅ Empresa creada correctamente.', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: (err) =>
          this.snackBar.open(err?.error?.message || 'Error al crear la empresa.', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  openEdit(empresa: Empresa): void {
    const dialogRef = this.dialog.open(EmpresaDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { empresa, profesores: this.profesores },
    });
    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.empresasService.update(empresa.id, payload as EmpresaPayload).subscribe({
        next: () => {
          this.snackBar.open('✅ Empresa actualizada correctamente.', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: (err) =>
          this.snackBar.open(err?.error?.message || 'Error al actualizar la empresa.', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  remove(empresa: Empresa): void {
    if (!confirm(`¿Eliminar la empresa "${empresa.nombre}"?`)) return;
    this.empresasService.delete(empresa.id).subscribe({
      next: () => {
        this.snackBar.open('Empresa eliminada.', 'Cerrar', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('No se pudo eliminar la empresa.', 'Cerrar', { duration: 4000 }),
    });
  }
}

