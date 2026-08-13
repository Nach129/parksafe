

import { Component } from '@angular/core';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [RouterLink, RouterLinkActive],

  templateUrl: './navbar.html',

  styleUrl: './navbar.css',
})
// Componente de navegacion: muestra enlaces, controla menu movil y permite cerrar sesion.
export class Navbar {
  menuOpen = false;

  constructor(
    private authService: AuthService,

    private router: Router,
  ) {}
  // Abre/cierra el menu de navegacion en pantallas pequenas.
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
  // Cierra el menu movil despues de navegar o ejecutar una accion.
  closeMenu(): void {
    this.menuOpen = false;
  }
  // Elimina datos de sesion local y devuelve al usuario al flujo de login.
  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
