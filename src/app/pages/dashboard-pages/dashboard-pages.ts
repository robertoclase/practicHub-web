import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ApiClient } from '../../services/api-client.service';
import { DashboardStats } from '../../services/api.types';

@Component({
  selector: 'app-dashboard-pages',
  standalone: true,
  imports: [CommonModule, AdminShell, DatePipe],
  templateUrl: './dashboard-pages.html',
  styleUrl: './dashboard-pages.css',
})
export class DashboardPages implements OnInit {
  private api = inject(ApiClient);

  stats: DashboardStats | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.api.getRaw<DashboardStats>('dashboard/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las estadísticas.';
        this.loading = false;
      },
    });
  }

  iconForTipo(tipo: string): string {
    return tipo === 'seguimiento' ? '📋' : '📝';
  }
}

