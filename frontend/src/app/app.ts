
// Componente raiz: contiene el router-outlet donde se muestran las paginas.
// Sirve como contenedor general de la interfaz ParkSafe.

import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',

  imports: [RouterOutlet],

  templateUrl: './app.html',

  styleUrl: './app.css',
})
// Componente raiz de Angular; aloja el router-outlet donde se renderizan las pantallas.
export class App {}
