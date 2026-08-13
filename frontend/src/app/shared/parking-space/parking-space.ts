
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ParkingSpace } from '../../core/models/parking.model';

@Component({
  selector: 'app-parking-space',

  standalone: true,

  imports: [],

  templateUrl: './parking-space.html',

  styleUrl: './parking-space.css',
})
// Componente visual de un cupo; emite el espacio seleccionado cuando el usuario interactua.
export class ParkingSpaceComponent {
  @Input({
    required: true,
  })
  space!: ParkingSpace;

  @Input()
  selectable = false;

  @Output()
  selected = new EventEmitter<ParkingSpace>();
  // Emite al componente padre el espacio clickeado para intentar reservarlo.
  selectSpace(): void {
    if (!this.selectable || this.space.estado !== 'DISPONIBLE') {
      return;
    }

    this.selected.emit(this.space);
  }
}
