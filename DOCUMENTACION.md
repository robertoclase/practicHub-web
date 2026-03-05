# PracticHub – Documentación del Proyecto

> **Proyecto Integrado DAM/DAW** | Curso 2025–2026  
> Gestión integral de prácticas FCT (Formación en Centros de Trabajo)

---

## 1. Descripción

**PracticHub** es una plataforma completa para la gestión de prácticas FCT compuesta por tres aplicaciones:

| Aplicación | Tecnología | Rol |
|---|---|---|
| `practicHub-api` | Laravel 12 + Sanctum | Backend REST API |
| `practicHub-web` | Angular 20 + Angular Material | Panel de administración |
| `practicHub-mobile` | Flutter 3 + BLoC | App móvil para alumnos |

---

## 2. Arquitectura

```
┌─────────────────┐     HTTP/JSON      ┌──────────────────────┐
│  Angular Web    │ ◄─────────────────► │   Laravel API        │
│  (Admin Panel)  │                     │   (REST + Sanctum)   │
└─────────────────┘                     └──────────────────────┘
                                                  ▲
┌─────────────────┐     HTTP/JSON                 │
│  Flutter Mobile │ ◄─────────────────────────────┘
│  (Alumnos App)  │
└─────────────────┘
```

---

## 3. Backend – practicHub-api

### 3.1 Tecnologías
- **Framework:** Laravel 12
- **Autenticación:** Laravel Sanctum (tokens Bearer)
- **Base de datos:** MySQL (vía XAMPP)
- **Almacenamiento:** `storage/app/public` con symlink `public/storage`

### 3.2 Instalación

```bash
cd practicHub-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 3.3 Variables de entorno (.env)
```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=proyecto_api
DB_USERNAME=root
DB_PASSWORD=
```

### 3.4 Endpoints principales

#### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/login` | Login admin (credentials) |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/user` | Usuario autenticado |

#### Empresas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/empresas` | Listar (paginado, `?search=`, `?only_active=true`) |
| POST | `/api/empresas` | Crear (`multipart/form-data` si hay foto) |
| GET | `/api/empresas/{id}` | Detalle |
| PUT | `/api/empresas/{id}` | Actualizar |
| DELETE | `/api/empresas/{id}` | Eliminar |

#### Profesores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/profesores` | Listar (`?search=`, `?only_active=true`) |
| POST | `/api/profesores` | Crear (crea User + Profesor) |
| PUT | `/api/profesores/{id}` | Actualizar |
| DELETE | `/api/profesores/{id}` | Eliminar |

#### Alumnos (Users)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar alumnos (`?search=`) |
| POST | `/api/users` | Crear alumno |
| PUT | `/api/users/{id}` | Actualizar |
| DELETE | `/api/users/{id}` | Eliminar |

#### Cursos académicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cursos-academicos` | Listar |
| POST | `/api/cursos-academicos` | Crear |
| PUT | `/api/cursos-academicos/{id}` | Actualizar |
| DELETE | `/api/cursos-academicos/{id}` | Eliminar |

#### Seguimientos de Prácticas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/seguimientos-practicas` | Listar con filtros |
| POST | `/api/seguimientos-practicas` | Crear |
| GET | `/api/seguimientos-practicas/{id}` | Detalle con relaciones |
| PUT | `/api/seguimientos-practicas/{id}` | Actualizar |

#### Partes Diarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/partes-diarios` | Listar |
| POST | `/api/partes-diarios` | Crear |
| PUT | `/api/partes-diarios/{id}` | Actualizar |

#### Valoraciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/valoraciones` | Listar |
| POST | `/api/valoraciones` | Crear |

### 3.5 Filtrado y Búsqueda

Todos los endpoints de listado soportan el parámetro `?search=término` que realiza búsqueda insensible a mayúsculas en los campos más relevantes del recurso.

Parámetros comunes:
- `?search=texto` – Búsqueda full-text multi-campo
- `?only_active=true` – Solo registros activos
- `?per_page=N` – Tamaño de página (default: 15)
- `?page=N` – Número de página

### 3.6 Subida de Ficheros

El endpoint `POST /api/empresas` y `PUT /api/empresas/{id}` aceptan archivos de imagen en el campo `foto_perfil` mediante `multipart/form-data`.

Los archivos se almacenan en `storage/app/public/empresas/` y se sirven mediante el symlink en `public/storage/`.

Formatos aceptados: `jpeg`, `png`, `jpg`, `gif`, `webp` (máximo 2MB).

### 3.7 Modelos y Relaciones

```
User (alumno/admin)
  └── SeguimientoPractica (hasMany)
        ├── Empresa (belongsTo)
        ├── Profesor (belongsTo)
        │     └── User (belongsTo)
        ├── CursoAcademico (belongsTo)
        ├── ParteDiario (hasMany)
        └── Valoracion (hasMany)
```

---

## 4. Frontend Web – practicHub-web

### 4.1 Tecnologías
- **Framework:** Angular 20 (standalone components)
- **UI Library:** Angular Material 21 (indigo-pink theme)
- **Estilos:** Angular Material + Bootstrap 5 (en paralelo)
- **HTTP:** HttpClient con interceptor de autenticación Bearer
- **Routing:** Angular Router con guardas de autenticación

### 4.2 Instalación

```bash
cd practicHub-web
npm install
ng serve
# Acceder en http://localhost:4200
```

### 4.3 Estructura de Módulos

```
src/app/
├── app.config.ts          # Providers globales (routing, HTTP, animations)
├── app.routes.ts          # Rutas de la aplicación
├── pages/
│   ├── login-pages/       # Página de login
│   ├── dashboard-pages/   # Dashboard con estadísticas
│   ├── empresas-pages/    # CRUD de empresas + EmpresaDialogComponent
│   ├── alumnos-pages/     # CRUD de alumnos + AlumnoDialogComponent
│   ├── profesores-pages/  # CRUD de profesores + ProfesorDialogComponent
│   ├── seguimientos-pages/# Gestión de seguimientos de prácticas
│   └── valoraciones-pages/# Gestión de valoraciones
├── services/
│   ├── api-client.service.ts  # Cliente HTTP genérico (con soporte multipart)
│   ├── api.types.ts           # Interfaces TypeScript de todos los modelos
│   ├── auth.service.ts        # Autenticación y gestión de token
│   ├── empresas.service.ts    # Servicio específico de empresas
│   └── ...
└── shared/
    ├── components/
    │   ├── admin-shell/   # Shell de navegación (MatSidenav + MatToolbar)
    │   └── ...
    └── guards/
        └── auth.guard.ts  # Protección de rutas
```

### 4.4 Angular Material – Componentes utilizados

| Componente | Uso |
|---|---|
| `MatSidenavModule` | Menú lateral de navegación en `AdminShell` |
| `MatToolbarModule` | Barra superior con título y botón hamburguesa |
| `MatNavListModule` | Lista de enlaces de navegación en el sidenav |
| `MatTableModule` | Tablas de datos en todas las páginas CRUD |
| `MatPaginatorModule` | Paginación en todas las tablas |
| `MatSortModule` | Ordenación de columnas en tablas |
| `MatDialogModule` | Modales para crear/editar registros |
| `MatFormFieldModule` | Campos de formulario con validación visual |
| `MatInputModule` | Inputs dentro de los formularios |
| `MatSelectModule` | Selectores desplegables |
| `MatCheckboxModule` | Checkboxes (ej. campo "activo") |
| `MatButtonModule` | Botones (raised, icon, flat) |
| `MatIconModule` | Iconos Material en toda la UI |
| `MatChipsModule` | Chips de estado en tablas |
| `MatSnackBarModule` | Notificaciones/toasts de operaciones |
| `MatProgressSpinnerModule` | Spinner de carga |
| `MatTooltipModule` | Tooltips en botones de acción |

### 4.5 Patrón de CRUDs

Cada página de gestión sigue el mismo patrón con Angular Material:

1. **Tabla reactiva** (`MatTableDataSource`) con ordenación y filtrado cliente/servidor
2. **Búsqueda en tiempo real** (`mat-form-field` + `MatInput` + `filterPredicate`)
3. **Paginación** (`MatPaginator` con opciones 5/10/25/50 por página)
4. **Diálogos** (`MatDialog`) para crear y editar — formularios reactivos con validación
5. **Feedback** (`MatSnackBar`) para confirmar operaciones
6. **Subida de archivos** (campo `<input type="file">` dentro del dialog de empresa)

### 4.6 Subida de Ficheros (Frontend)

El `EmpresaDialogComponent` incluye un campo de archivo para el logo de la empresa:
- Vista previa de la imagen antes de subir
- El servicio usa `multipart/form-data` automáticamente cuando hay un `File` en el payload
- Para actualizaciones se usa method spoofing (`_method=PUT`) por limitaciones de `multipart/PUT`

---

## 5. Frontend Mobile – practicHub-mobile

### 5.1 Tecnologías
- **Framework:** Flutter 3
- **Gestión de estado:** BLoC pattern
- **HTTP:** `dio` / `http` package
- **Autenticación:** Bearer token (Laravel Sanctum)

### 5.2 Instalación

```bash
cd practicHub-mobile
flutter pub get
flutter run
```

### 5.3 Funcionalidades

- Login de alumnos y profesores
- Visualización de prácticas asignadas
- Registro de partes diarios
- Consulta de valoraciones
- Vista de seguimiento por parte del tutor

---

## 6. Despliegue y Ejecución

### Iniciar todos los servicios en local

```bash
# 1. Iniciar XAMPP (Apache + MySQL)

# 2. Backend Laravel
cd practicHub-api
php artisan serve
# Escuchando en http://localhost:8000

# 3. Frontend Angular
cd practicHub-web
ng serve
# Acceder en http://localhost:4200

# 4. App Flutter (opcional)
cd practicHub-mobile
flutter run
```

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@practicHub.com` | `password` |

---

## 7. Seguridad

- **Autenticación:** Bearer tokens via Laravel Sanctum
- **Autorización:** Middleware `auth:sanctum` en todas las rutas protegidas
- **CORS:** Configurado en `config/cors.php` para permitir `http://localhost:4200`
- **Validación:** Validación de datos en servidor (Laravel `$request->validate()`)
- **Contraseñas:** Hasheadas con `bcrypt` (BCRYPT_ROUNDS=12)
- **Subida de archivos:** Validación de tipo MIME y tamaño máximo (2MB)

---

## 8. Gestión de versiones (Git)

El proyecto usa Git con la convención de commits **Conventional Commits**:

```
feat(scope): descripción    → Nueva funcionalidad
fix(scope): descripción     → Corrección de bug
refactor(scope): descripción → Refactorización
docs(scope): descripción    → Documentación
chore(scope): descripción   → Tareas de mantenimiento
```

Ramas:
- `main` – Rama principal, código estable
- `develop` – Integración de features (si se usa)
- `feature/*` – Desarrollo de nuevas funcionalidades

---

## 9. Testing

### Backend (PHPUnit)

```bash
cd practicHub-api
php artisan test
```

### Frontend (Jest / Karma)

```bash
cd practicHub-web
ng test
```

---

## 10. Colección Postman

El archivo `practicHub-api/postman_api_collection.json` contiene todos los endpoints documentados y configurados para pruebas directas.

Importar en Postman y configurar la variable `{{base_url}}` como `http://localhost:8000`.
