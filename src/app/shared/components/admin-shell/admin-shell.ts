import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Angular Material
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavLink {
  path: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  links: NavLink[] = [
    { path: '/dashboard', label: 'Panel de control', description: 'Vista general del sistema', icon: 'dashboard' },
    { path: '/empresas', label: 'Empresas', description: 'Gestión de empresas colaboradoras', icon: 'business' },
    { path: '/profesores', label: 'Profesores', description: 'Gestión de profesores supervisores', icon: 'school' },
    { path: '/alumnos', label: 'Alumnos', description: 'Gestión de estudiantes', icon: 'people' },
    { path: '/seguimiento-historico', label: 'Seguimientos', description: 'Historial de prácticas FCT', icon: 'history' },
    { path: '/valoraciones', label: 'Valoraciones', description: 'Sistema de evaluaciones', icon: 'star' },
    { path: '/informes', label: 'Informes', description: 'Generación de reportes', icon: 'assessment' },
  ];

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
      complete: () => this.router.navigate(['/login']),
    });
  }
}
