

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { finalize, forkJoin } from 'rxjs';

import { Navbar } from '../../shared/navbar/navbar';

import { ParkingService } from '../../core/services/parking.service';

import { SystemService } from '../../core/services/system.service';

import { Parking, ParkingSpace } from '../../core/models/parking.model';

import { SystemStatusResponse } from '../../core/models/system.model';

@Component({
  selector: 'app-inicio',

  standalone: true,

  imports: [CommonModule, RouterLink, Navbar],

  templateUrl: './inicio.html',

  styleUrl: './inicio.css',
})
// Pantalla inicial privada; carga resumen de estacionamientos y estado general para el usuario.
export class Inicio implements OnInit {
  loading = true;

  errorMessage = '';

  parkings: Parking[] = [];

  spaces: ParkingSpace[] = [];

  systemStatus: SystemStatusResponse | null = null;

  constructor(
    private parkingService: ParkingService,

    private systemService: SystemService,

    private cdr: ChangeDetectorRef,
  ) {}
  // Hook de Angular que ejecuta la carga inicial cuando el componente aparece en pantalla.
  ngOnInit(): void {
    this.loadDashboard();
  }
  // Carga datos resumidos para la pagina de inicio desde los servicios del frontend.
  loadDashboard(): void {
    this.loading = true;

    this.errorMessage = '';

    /*
     * En Angular zoneless notificamos
     * manualmente que cambió el estado.
     */
    this.cdr.markForCheck();

    forkJoin({
      parking: this.parkingService.getStatus(),

      spaces: this.parkingService.getSpaces(),

      system: this.systemService.getStatus(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;

          /*
           * Angular 21 está trabajando
           * sin Zone.js, por lo que debemos
           * avisar que la vista debe
           * actualizarse.
           */
          this.cdr.markForCheck();
        }),
      )
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: ({ parking, spaces, system }) => {
          console.log('PARKING STATUS:', parking);

          console.log('SPACES:', spaces);

          console.log('SYSTEM STATUS:', system);

          /*
           * Estacionamientos.
           */
          this.parkings = Array.isArray(parking.data)
            ? parking.data
            : parking.data
              ? [parking.data]
              : [];

          /*
           * Espacios.
           */
          this.spaces = Array.isArray(spaces.data) ? spaces.data : [];

          /*
           * Estado distribuido.
           */
          this.systemStatus = system;

          /*
           * Fuerza la actualización
           * visual en modo zoneless.
           */
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('ERROR DASHBOARD:', error);

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'No fue posible cargar la información de ParkSafe';

          this.cdr.markForCheck();
        },
      });
  }

  get totalSpaces(): number {
    return this.spaces.length;
  }

  get availableSpaces(): number {
    return this.spaces.filter((space) => space.estado === 'DISPONIBLE').length;
  }

  get reservedSpaces(): number {
    return this.spaces.filter((space) => space.estado === 'RESERVADO').length;
  }

  get occupiedSpaces(): number {
    return this.spaces.filter((space) => space.estado === 'OCUPADO').length;
  }

  get unavailableSpaces(): number {
    return this.spaces.filter((space) => space.estado === 'FUERA_DE_SERVICIO').length;
  }

  get activeNode(): string {
    return this.systemStatus?.nodeManager?.activeNode || 'DESCONOCIDO';
  }

  get activeNodeUrl(): string {
    return this.systemStatus?.nodeManager?.activeNodeUrl || '-';
  }

  get primaryStatus(): string {
    return this.systemStatus?.heartbeat?.primary?.status || 'UNKNOWN';
  }

  get backupStatus(): string {
    return this.systemStatus?.heartbeat?.backup?.status || 'UNKNOWN';
  }

  get availabilityPercentage(): number {
    if (this.totalSpaces === 0) {
      return 0;
    }

    return Math.round((this.availableSpaces / this.totalSpaces) * 100);
  }
}
