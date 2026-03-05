import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../services/api.types';

export interface AlumnoDialogData {
  alumno: User | null;
}

@Component({
  selector: 'app-alumno-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:8px;">
        {{ data.alumno ? 'edit' : 'person_add' }}
      </mat-icon>
      {{ data.alumno ? 'Editar Alumno' : 'Nuevo Alumno' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre completo</mat-label>
          <input matInput formControlName="name" placeholder="Nombre y apellidos" />
          <mat-error *ngIf="f['name'].errors?.['required']">El nombre es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo electrónico</mat-label>
          <input matInput formControlName="email" type="email" placeholder="alumno@email.com" />
          <mat-error *ngIf="f['email'].errors?.['required']">El email es requerido</mat-error>
          <mat-error *ngIf="f['email'].errors?.['email']">Formato de email inválido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ data.alumno ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}</mat-label>
          <input matInput formControlName="password" type="password" placeholder="Mínimo 6 caracteres" />
          <mat-error *ngIf="f['password'].errors?.['minlength']">Mínimo 6 caracteres</mat-error>
        </mat-form-field>
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
    .dialog-form { display: flex; flex-direction: column; gap: 8px; min-width: 400px; padding-top: 8px; }
    .full-width { width: 100%; }
  `],
})
export class AlumnoDialogComponent {
  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(6)] }),
  });

  get f() { return this.form.controls; }

  constructor(
    public dialogRef: MatDialogRef<AlumnoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlumnoDialogData,
  ) {
    if (data.alumno) {
      this.form.patchValue({ name: data.alumno.name, email: data.alumno.email });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    const payload: Record<string, unknown> = { name: val.name, email: val.email };
    if (val.password) payload['password'] = val.password;
    this.dialogRef.close(payload);
  }
}
