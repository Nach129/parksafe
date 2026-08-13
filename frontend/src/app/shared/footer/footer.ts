
// Importa el decorador Component, que convierte esta clase vacia en un componente Angular reutilizable.
// selector indica la etiqueta HTML personalizada que otras plantillas pueden usar: <app-footer>.
// templateUrl y styleUrl separan estructura y estilos para mantener ordenado el componente compartido.
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
