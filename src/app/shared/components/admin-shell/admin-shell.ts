import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface NavLink {
  path: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private auth = inject(AuthService);
  private router = inject(Router);

  links: NavLink[] = [
    { path: '/dashboard', label: 'Panel de control', description: 'Vista general del sistema' },
    { path: '/empresas', label: 'Empresas', description: 'Gestión de empresas colaboradoras' },
    { path: '/profesores', label: 'Profesores', description: 'Gestión de profesores supervisores' },
    { path: '/alumnos', label: 'Alumnos', description: 'Gestión de estudiantes' },
    { path: '/seguimiento-historico', label: 'Seguimiento Histórico', description: 'Análisis histórico de empresas' },
    { path: '/valoraciones', label: 'Valoraciones', description: 'Sistema de evaluaciones' },
    { path: '/informes', label: 'Informes', description: 'Generación de reportes PDF/Excel' },
  ];

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
      complete: () => this.router.navigate(['/login']),
    });
  }
}
