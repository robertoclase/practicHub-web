export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DashboardStats {
  totales: {
    empresas: number;
    alumnos: number;
    profesores: number;
    partes: number;
    seguimientos: number;
    seguimientos_activos: number;
    partes_pendientes: number;
  };
  actividad_reciente: {
    tipo: 'seguimiento' | 'parte';
    descripcion: string;
    detalle: string;
    empresa: string;
    fecha: string;
  }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Empresa {
  id: number;
  nombre: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  sector: string;
  tutor_empresa: string;
  email_tutor: string;
  activo?: boolean;
  foto_perfil?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmpresaPayload {
  nombre: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  sector: string;
  tutor_empresa: string;
  email_tutor: string;
  activo: boolean;
  foto_perfil?: File | null;
  password?: string;
}

export interface Profesor {
  id: number;
  user_id: number;
  dni: string;
  departamento: string;
  especialidad: string;
  telefono: string;
  activo?: boolean;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface CursoAcademico {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SeguimientoPractica {
  id: number;
  empresa_id: number;
  profesor_id: number;
  curso_academico_id: number;
  user_id: number;
  titulo: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  horas_totales: number;
  estado?: string | null;
  objetivos?: string | null;
  actividades?: string | null;
  empresa?: Empresa;
  profesor?: Profesor;
  curso_academico?: CursoAcademico;
  cursoAcademico?: CursoAcademico;
  alumno?: User;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface ParteDiario {
  id: number;
  seguimiento_practica_id: number;
  fecha: string;
  horas_realizadas: number;
  actividades_realizadas: string;
  observaciones?: string | null;
  dificultades?: string | null;
  soluciones_propuestas?: string | null;
  validado_tutor?: boolean;
  validado_profesor?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Valoracion {
  id: number;
  seguimiento_practica_id: number;
  profesor_id: number;
  puntuacion: number;
  comentarios: string;
  aspecto_valorado: string;
  profesor?: Profesor;
  seguimientoPractica?: SeguimientoPractica;
  created_at?: string;
  updated_at?: string;
}
