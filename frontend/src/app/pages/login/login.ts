

import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterLink],

  templateUrl: './login.html',

  styleUrl: './login.css',
})
// Pantalla de inicio de sesion; valida formulario y navega al inicio cuando el login es correcto.
export class Login {
  identificador = '';
  password = '';

  loading = false;

  errorMessage = '';

  constructor(
    private authService: AuthService,

    private router: Router,
  ) {}

  // Envia credenciales al backend y guarda token/usuario si la autenticacion resulta correcta.
  login(): void {
    this.errorMessage = '';

    // Verifica que el login traiga usuario/correo y password antes de consultar la base.
    if (!this.identificador.trim() || !this.password) {
      this.errorMessage = 'Ingresa tu correo o nombre de usuario y contraseña';

      return;
    }

    this.loading = true;

    this.authService
      .login({
        identificador: this.identificador.trim(),

        password: this.password,
      })
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: () => {
          this.loading = false;

          this.router.navigate(['/inicio']);
        },

        error: (error) => {
          this.loading = false;

          this.errorMessage = error?.error?.message || 'No fue posible iniciar sesión';
        },
      });
  }
}
