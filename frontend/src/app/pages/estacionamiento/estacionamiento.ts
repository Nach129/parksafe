

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { forkJoin } from 'rxjs';

import { Navbar } from '../../shared/navbar/navbar';

import { ParkingSpaceComponent } from '../../shared/parking-space/parking-space';

import { ParkingService } from '../../core/services/parking.service';

import { VehicleService } from '../../core/services/vehicle.service';

import { Parking, ParkingSpace } from '../../core/models/parking.model';

import { Vehicle } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-estacionamiento',

  standalone: true,

  imports: [CommonModule, FormsModule, Navbar, ParkingSpaceComponent],

  templateUrl: './estacionamiento.html',

  styleUrl: './estacionamiento.css',
})
// Pantalla principal de reservas: carga estacionamientos/espacios, selecciona cupo y reserva.
export class Estacionamiento implements OnInit {
  loading = true;

  reserving = false;

  errorMessage = '';

  successMessage = '';

  parkings: Parking[] = [];

  spaces: ParkingSpace[] = [];

  vehicles: Vehicle[] = [];

  selectedParkingId: number | null = null;

  selectedVehicleId: number | null = null;

  constructor(
    private parkingService: ParkingService,

    private vehicleService: VehicleService,

    private cdr: ChangeDetectorRef,
  ) {}
  // Hook de Angular que ejecuta la carga inicial cuando el componente aparece en pantalla.
  ngOnInit(): void {
    this.loadData();
  }
  // Carga estacionamientos, espacios y vehiculos necesarios para reservar.
  loadData(): void {
    this.loading = true;

    this.errorMessage = '';

    forkJoin({
      parking: this.parkingService.getStatus(),

      spaces: this.parkingService.getSpaces(),

      vehicles: this.vehicleService.getVehicles(),
    })
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: ({ parking, spaces, vehicles }) => {
          this.parkings = Array.isArray(parking.data) ? parking.data : [];

          this.spaces = Array.isArray(spaces.data) ? spaces.data : [];

          this.vehicles = Array.isArray(vehicles.data) ? vehicles.data : [];

          // Valida que el estacionamiento seleccionado sea un id numerico valido.
          if (this.parkings.length > 0 && this.selectedParkingId === null) {
            this.selectedParkingId = this.parkings[0].id;
          }

          this.loading = false;

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Error cargando estacionamiento:', error);

          this.errorMessage = error?.error?.message || 'No fue posible cargar el estacionamiento';

          this.loading = false;

          this.cdr.markForCheck();
        },
      });
  }

  selectParking(parkingId: number): void {
    this.selectedParkingId = parkingId;

    this.successMessage = '';
    this.errorMessage = '';
  }

  getSpacesByParking(parkingId: number): ParkingSpace[] {
    return this.spaces.filter((space) => space.estacionamiento_id === parkingId);
  }

  getAvailableCount(parkingId: number): number {
    return this.getSpacesByParking(parkingId).filter((space) => space.estado === 'DISPONIBLE')
      .length;
  }
  // Busca el objeto estacionamiento actualmente seleccionado.
  getSelectedParking(): Parking | undefined {
    return this.parkings.find((parking) => parking.id === this.selectedParkingId);
  }
  // Envia una solicitud de reserva con vehiculo y estacionamiento seleccionados.
  reserve(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Valida que el vehiculo seleccionado exista como id numerico antes de reservar.
    if (!this.selectedVehicleId) {
      this.errorMessage = 'Selecciona un vehículo';

      return;
    }

    // Valida que el estacionamiento seleccionado sea un id numerico valido.
    if (!this.selectedParkingId) {
      this.errorMessage = 'Selecciona un estacionamiento';

      return;
    }

    const available = this.getAvailableCount(this.selectedParkingId);

    if (available <= 0) {
      this.errorMessage = 'No existen espacios disponibles en este estacionamiento';

      return;
    }

    this.reserving = true;

    this.parkingService
      .reserveSpace({
        vehiculoId: this.selectedVehicleId,

        estacionamientoId: this.selectedParkingId,
      })
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response) => {
          this.reserving = false;

          const spaceCode = response?.data?.space?.code;

          this.successMessage = spaceCode
            ? `Reserva realizada correctamente. Espacio asignado: ${spaceCode}`
            : response.message;

          this.selectedVehicleId = null;

          /*
           * Volvemos a consultar al
           * backend para mostrar el
           * estado real replicado.
           */
          this.reloadSpaces();

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Error reservando espacio:', error);

          this.reserving = false;

          this.errorMessage = error?.error?.message || 'No fue posible realizar la reserva';

          this.cdr.markForCheck();
        },
      });
  }
  // Vuelve a consultar espacios para reflejar cambios despues de reservar o refrescar.
  reloadSpaces(): void {
    this.parkingService
      .getSpaces()
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response) => {
          this.spaces = Array.isArray(response.data) ? response.data : [];

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Error actualizando espacios:', error);
        },
      });
  }
}
