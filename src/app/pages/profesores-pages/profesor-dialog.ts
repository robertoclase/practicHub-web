import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Profesor } from '../../services/api.types';

export interface ProfesorDialogData {
  profesor: Profesor | null;
}

@Component({
  selector: 'app-profesor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:8px;">
        {{ data.profesor ? 'edit' : 'person_add' }}
      </mat-icon>
      {{ data.profesor ? 'Editar Profesor' : 'Nuevo Profesor' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre completo</mat-label>
            <input matInput formControlName="name" placeholder="Nombre y apellidos" />
            <mat-error *ngIf="f['name'].errors?.['required']">El nombre es requerido</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="profesor@centro.es" />
            <mat-error *ngIf="f['email'].errors?.['required']">El email es requerido</mat-error>
            <mat-error *ngIf="f['email'].errors?.['email']">Formato inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>{{ data.profesor ? 'Nueva contraseña (opcional)' : 'Contraseña' }}</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Mínimo 6 caracteres" />
            <mat-error *ngIf="f['password'].errors?.['minlength']">Mínimo 6 caracteres</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>DNI</mat-label>
            <input matInput formControlName="dni" placeholder="12345678A" />
            <mat-error *ngIf="f['dni'].errors?.['required']">El DNI es requerido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" placeholder="612345678" />
            <mat-error *ngIf="f['telefono'].errors?.['required']">El teléfono es requerido</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Departamento</mat-label>
            <input matInput formControlName="departamento" placeholder="Ej: Informática" />
            <mat-error *ngIf="f['departamento'].errors?.['required']">Requerido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Especialidad</mat-label>
            <input matInput formControlName="especialidad" placeholder="Ej: Desarrollo de Aplicaciones" />
            <mat-error *ngIf="f['especialidad'].errors?.['required']">Requerida</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-checkbox formControlName="activo" color="primary">Profesor activo</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="submit()">
        <mat-icon>save</mat-icon>
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 500px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 0; }
    mat-dialog-content { max-height: 72vh; overflow-y: auto; }
  `],
})
export class ProfesorDialogComponent {
  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(6)] }),
    dni: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    departamento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    especialidad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  get f() { return this.form.controls; }

  constructor(
    public dialogRef: MatDialogRef<ProfesorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfesorDialogData,
  ) {
    if (data.profesor) {
      this.form.patchValue({
        name: data.profesor.user?.name ?? '',
        email: data.profesor.user?.email ?? '',
        dni: data.profesor.dni,
        departamento: data.profesor.departamento,
        especialidad: data.profesor.especialidad,
        telefono: data.profesor.telefono,
        activo: data.profesor.activo ?? true,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      name: val.name,
      email: val.email,
      dni: val.dni,
      departamento: val.departamento,
      especialidad: val.especialidad,
      telefono: val.telefono,
      activo: val.activo,
    };
    if (val.password) payload['password'] = val.password;
    this.dialogRef.close(payload);
  }
}
