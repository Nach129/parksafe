

import { ChangeDetectorRef, Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterLink],

  templateUrl: './registro.html',

  styleUrl: './registro.css',
})
// Pantalla de registro de usuario; captura formulario y llama al AuthService.
export class Registro {
  nombre = '';

  nombreUsuario = '';

  correo = '';

  password = '';

  confirmPassword = '';

  loading = false;

  errorMessage = '';

  successMessage = '';

  showPassword = false;

  constructor(
    private authService: AuthService,

    private router: Router,

    private cdr: ChangeDetectorRef,
  ) {}

  // Envia datos de cuenta al backend para crear un usuario nuevo.
  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const nombre = this.nombre.trim();

    const nombreUsuario = this.nombreUsuario.trim().toLowerCase();

    const correo = this.correo.trim().toLowerCase();

    if (!nombre || !nombreUsuario || !correo || !this.password) {
      this.errorMessage = 'Completa todos los campos obligatorios';

      return;
    }

    if (nombre.length < 3) {
      this.errorMessage = 'El nombre debe tener al menos 3 caracteres';

      return;
    }

    if (nombreUsuario.length < 3) {
      this.errorMessage = 'El nombre de usuario debe tener al menos 3 caracteres';

      return;
    }

    if (!this.isValidEmail(correo)) {
      this.errorMessage = 'Ingresa un correo electrónico válido';

      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';

      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';

      return;
    }

    this.loading = true;

    this.authService
      .register({
        nombre,
        nombreUsuario,
        correo,
        password: this.password,
      })
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response: any) => {
          this.loading = false;

          this.successMessage = response?.message || 'Usuario registrado correctamente';

          this.cdr.markForCheck();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1200);
        },

        error: (error) => {
          console.error('Error registrando usuario:', error);

          this.loading = false;

          this.errorMessage = error?.error?.message || 'No fue posible registrar el usuario';

          this.cdr.markForCheck();
        },
      });
  }
  // Alterna visibilidad del password en el formulario de registro/login.
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
