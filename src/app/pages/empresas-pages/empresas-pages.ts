import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ModalShared } from '../../shared/components/modal-shared/modal-shared';
import { EmpresasService } from '../../services/empresas.service';
import { ApiClient } from '../../services/api-client.service';
import { Empresa, EmpresaPayload, PaginatedResponse, Profesor } from '../../services/api.types';

// CIF español: letra + 7 dígitos + dígito/letra (ej: B1234567X o B12345678)
const CIF_PATTERN = /^[A-Za-z]\d{7}[0-9A-Za-z]$/;
// Teléfono español: 9 dígitos
const PHONE_PATTERN = /^[0-9]{9}$/;

@Component({
  selector: 'app-empresas-pages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminShell, ModalShared],
  templateUrl: './empresas-pages.html',
  styleUrl: './empresas-pages.css',
})
export class EmpresasPages implements OnInit, OnDestroy {
  private empresasService = inject(EmpresasService);
  private apiClient = inject(ApiClient);

  empresas: Empresa[] = [];
  profesores: Profesor[] = [];
