import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Empresa, Profesor } from '../../services/api.types';

const CIF_PATTERN = /^[A-Za-z]\d{7}[0-9A-Za-z]$/;
const PHONE_PATTERN = /^[0-9]{9}$/;

export interface EmpresaDialogData {
  empresa: Empresa | null;
  profesores: Profesor[];
}

@Component({
  selector: 'app-empresa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:8px;">
        {{ data.empresa ? 'edit' : 'add_business' }}
      </mat-icon>
      {{ data.empresa ? 'Editar Empresa' : 'Nueva Empresa' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre de la empresa</mat-label>
            <input matInput formControlName="nombre" placeholder="Ej: TechSolutions S.L." />
            <mat-error *ngIf="f['nombre'].errors?.['required']">El nombre es requerido</mat-error>
            <mat-error *ngIf="f['nombre'].errors?.['minlength']">Mínimo 3 caracteres</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>CIF</mat-label>
            <input matInput formControlName="cif" placeholder="B1234567X" />
            <mat-hint>Letra + 7 dígitos + letra/dígito</mat-hint>
            <mat-error *ngIf="f['cif'].errors?.['required']">El CIF es requerido</mat-error>
            <mat-error *ngIf="f['cif'].errors?.['pattern']">Formato CIF inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Sector</mat-label>
            <input matInput formControlName="sector" placeholder="Ej: Tecnología" />
            <mat-error *ngIf="f['sector'].errors?.['required']">El sector es requerido</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Dirección</mat-label>
            <input matInput formControlName="direccion" placeholder="Calle, número, ciudad" />
            <mat-error *ngIf="f['direccion'].errors?.['required']">La dirección es requerida</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" placeholder="612345678" />
            <mat-hint>9 dígitos sin espacios</mat-hint>
            <mat-error *ngIf="f['telefono'].errors?.['required']">El teléfono es requerido</mat-error>
            <mat-error *ngIf="f['telefono'].errors?.['pattern']">Debe tener 9 dígitos</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Email corporativo</mat-label>
            <input matInput formControlName="email" type="email" placeholder="info@empresa.es" />
            <mat-error *ngIf="f['email'].errors?.['required']">El email es requerido</mat-error>
            <mat-error *ngIf="f['email'].errors?.['email']">Formato de email inválido</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tutor de empresa (Profesor)</mat-label>
            <mat-select formControlName="profesor_id" (selectionChange)="onProfesorChange($event.value)">
              <mat-option *ngFor="let prof of data.profesores" [value]="prof.id">
                {{ prof.user?.name }} — {{ prof.especialidad }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="f['tutor_empresa'].errors?.['required']">El tutor es requerido</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Nombre tutor</mat-label>
            <input matInput formControlName="tutor_empresa" placeholder="Nombre del tutor" readonly />
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Email tutor</mat-label>
            <input matInput formControlName="email_tutor" type="email" readonly />
          </mat-form-field>
        </div>

        <div *ngIf="!data.empresa" class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Mínimo 6 caracteres" />
            <mat-error *ngIf="f['password'].errors?.['minlength']">Mínimo 6 caracteres</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-checkbox formControlName="activo" color="primary">Empresa activa</mat-checkbox>
        </div>

        <!-- File Upload -->
        <div class="form-row file-upload-row">
          <label class="file-upload-label">
            <mat-icon>cloud_upload</mat-icon>
            <span>{{ selectedFileName || 'Logo / foto de perfil (opcional)' }}</span>
            <input type="file" accept="image/*" (change)="onFileSelected($event)" style="display:none" />
          </label>
          <img *ngIf="previewUrl || data.empresa?.foto_perfil" [src]="previewUrl || data.empresa?.foto_perfil" class="foto-preview" />
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="saving">
        <mat-icon>save</mat-icon>
        {{ saving ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 520px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .full-width { width: 100%; }
    .half-width { flex: 1; min-width: 0; }
    mat-dialog-content { max-height: 72vh; overflow-y: auto; }
    .file-upload-row { align-items: center; gap: 16px; }
    .file-upload-label {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      border: 2px dashed #c5c6c7; border-radius: 8px; padding: 10px 16px;
      color: #555; font-size: 0.875rem; flex: 1;
      transition: border-color 0.2s;
    }
    .file-upload-label:hover { border-color: #3f51b5; color: #3f51b5; }
    .foto-preview { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #ddd; }
  `],
})
export class EmpresaDialogComponent {
  saving = false;
  selectedFile: File | null = null;
  selectedFileName = '';
  previewUrl: string | null = null;

  form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    cif: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(CIF_PATTERN)] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(PHONE_PATTERN)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    sector: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tutor_empresa: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email_tutor: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    activo: new FormControl(true, { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
    profesor_id: new FormControl<number | null>(null),
  });

  get f() { return this.form.controls; }

  constructor(
    public dialogRef: MatDialogRef<EmpresaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmpresaDialogData,
  ) {
    if (data.empresa) {
      const e = data.empresa;
      this.form.patchValue({
        nombre: e.nombre,
        cif: e.cif,
        direccion: e.direccion,
        telefono: e.telefono,
        email: e.email,
        sector: e.sector,
        tutor_empresa: e.tutor_empresa,
        email_tutor: e.email_tutor,
        activo: e.activo ?? true,
      });
      // Pre-select professor
      const prof = data.profesores.find(p => p.user?.name === e.tutor_empresa);
      if (prof) this.form.patchValue({ profesor_id: prof.id });
    }
  }

  onProfesorChange(profesorId: number): void {
    const prof = this.data.profesores.find(p => p.id === profesorId);
    if (prof) {
      this.form.patchValue({
        tutor_empresa: prof.user?.name ?? '',
        email_tutor: prof.user?.email ?? '',
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      nombre: val.nombre,
      cif: val.cif,
      direccion: val.direccion,
      telefono: val.telefono,
      email: val.email,
      sector: val.sector,
      tutor_empresa: val.tutor_empresa,
      email_tutor: val.email_tutor,
      activo: val.activo,
    };
    if (!this.data.empresa && val.password) payload['password'] = val.password;
    if (this.selectedFile) payload['foto_perfil'] = this.selectedFile;
    this.dialogRef.close(payload);
  }
}
