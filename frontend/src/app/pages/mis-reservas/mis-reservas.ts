

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Navbar } from '../../shared/navbar/navbar';

import { ParkingService } from '../../core/services/parking.service';

import { VehicleService } from '../../core/services/vehicle.service';

import { Vehicle } from '../../core/models/vehicle.model';

interface ParkingReservation {
  id: number;
  code: string;
  userId: number;
  vehicleId: number;
  parkingId: number;
  parkingName: string;

  space: {
    id: number;
    code: string;
  };

  type: string;
  status: string;
  processedBy: string;
  operationId: string;
}

@Component({
  selector: 'app-mis-reservas',

  standalone: true,

  imports: [CommonModule, Navbar],

  templateUrl: './mis-reservas.html',

  styleUrl: './mis-reservas.css',
})
// Pantalla que lista reservas del usuario y cruza datos con sus vehiculos registrados.
export class MisReservas implements OnInit {
  loading = true;

  errorMessage = '';

  reservations: ParkingReservation[] = [];

  vehicles: Vehicle[] = [];

  constructor(
    private parkingService: ParkingService,

    private vehicleService: VehicleService,

    private cdr: ChangeDetectorRef,
  ) {}
  // Hook de Angular que ejecuta la carga inicial cuando el componente aparece en pantalla.
  ngOnInit(): void {
    this.loadReservations();
  }
  // Obtiene las reservas del usuario y actualiza la lista visible.
  loadReservations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.parkingService
      .getReservations()
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response: any) => {
          this.reservations = Array.isArray(response.data) ? response.data : [];

          this.loadVehicles();
        },

        error: (error) => {
          console.error('Error cargando reservas:', error);

          this.errorMessage = error?.error?.message || 'No fue posible cargar tus reservas';

          this.loading = false;

          this.cdr.markForCheck();
        },
      });
  }

  // Obtiene vehiculos del usuario para mostrarlos o cruzarlos con reservas.
  loadVehicles(): void {
    this.vehicleService
      .getVehicles()
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response) => {
          this.vehicles = Array.isArray(response.data) ? response.data : [];

          this.loading = false;

          this.cdr.markForCheck();
        },

        error: () => {
          this.loading = false;

          this.cdr.markForCheck();
        },
      });
  }

  getVehicle(vehicleId: number): Vehicle | undefined {
    return this.vehicles.find((vehicle) => vehicle.id === vehicleId);
  }

  get activeReservations(): ParkingReservation[] {
    return this.reservations.filter((reservation) => reservation.status === 'ACTIVO');
  }

  get totalReservations(): number {
    return this.reservations.length;
  }

  get processedByPrimary(): number {
    return this.reservations.filter((reservation) => reservation.processedBy === 'PRIMARIO').length;
  }

  get processedByBackup(): number {
    return this.reservations.filter((reservation) => reservation.processedBy === 'RESPALDO').length;
  }
}
