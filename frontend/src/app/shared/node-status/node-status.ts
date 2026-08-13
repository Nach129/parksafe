
// Importa el decorador Component, necesario para registrar este bloque visual dentro de Angular.
// selector define la etiqueta <app-node-status>, pensada para mostrar estado de nodos en la interfaz.
// templateUrl/styleUrl separan la vista y los estilos del componente que apoya el monitoreo del sistema.
import { Component } from '@angular/core';

@Component({
  selector: 'app-node-status',
  imports: [],
  templateUrl: './node-status.html',
  styleUrl: './node-status.css',
})
// Monitorea nodos y decide a cual enviar trafico cuando ocurre una falla.
// Componente compartido reservado para visualizar estado de nodos/heartbeat.
export class NodeStatus {}
