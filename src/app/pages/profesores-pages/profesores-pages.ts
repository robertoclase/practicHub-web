import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminShell } from '../../shared/components/admin-shell/admin-shell';
import { ModalShared } from '../../shared/components/modal-shared/modal-shared';
import { ApiClient } from '../../services/api-client.service';
import { PaginatedResponse, Profesor } from '../../services/api.types';

