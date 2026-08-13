
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Navbar } from '../../shared/navbar/navbar';

import { VehicleService } from '../../core/services/vehicle.service';

import { Vehicle } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-vehiculos',

  standalone: true,

  imports: [CommonModule, FormsModule, Navbar],

  templateUrl: './vehiculos.html',

  styleUrl: './vehiculos.css',
})
// Pantalla de administracion de vehiculos del usuario.
export class Vehiculos implements OnInit {
  vehicles: Vehicle[] = [];

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';

  showForm = false;

  patente = '';
  marca = '';
  modelo = '';
  color = '';

  constructor(
    private vehicleService: VehicleService,

    private cdr: ChangeDetectorRef,
  ) {}
  // Hook de Angular que ejecuta la carga inicial cuando el componente aparece en pantalla.
  ngOnInit(): void {
    this.loadVehicles();
  }

  // Obtiene vehiculos del usuario para mostrarlos o cruzarlos con reservas.
  loadVehicles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.vehicleService
      .getVehicles()
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response) => {
          this.vehicles = Array.isArray(response.data) ? response.data : [];

          this.loading = false;

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Error cargando vehículos:', error);

          this.errorMessage = error?.error?.message || 'No fue posible cargar tus vehículos';

          this.loading = false;

          this.cdr.markForCheck();
        },
      });
  }
  // Muestra u oculta el formulario de nuevo vehiculo.
  toggleForm(): void {
    this.showForm = !this.showForm;

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.showForm) {
      this.resetForm();
    }
  }

  // Registra un vehiculo nuevo con patente y atributos opcionales.
  createVehicle(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const normalizedPlate = this.patente.trim().toUpperCase();

    if (!normalizedPlate) {
      this.errorMessage = 'La patente es obligatoria';

      return;
    }

    if (normalizedPlate.length < 5 || normalizedPlate.length > 10) {
      this.errorMessage = 'La patente debe tener entre 5 y 10 caracteres';

      return;
    }

    this.saving = true;

    this.vehicleService
      .createVehicle({
        patente: normalizedPlate,

        marca: this.marca.trim(),

        modelo: this.modelo.trim(),

        color: this.color.trim(),
      })
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response) => {
          this.saving = false;

          this.successMessage = response.message || 'Vehículo registrado correctamente';

          if (response.data) {
            this.vehicles = [...this.vehicles, response.data];
          }

          this.resetForm();

          this.showForm = false;

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Error registrando vehículo:', error);

          this.saving = false;

          this.errorMessage = error?.error?.message || 'No fue posible registrar el vehículo';

          this.cdr.markForCheck();
        },
      });
  }
  // Limpia campos y mensajes del formulario de vehiculos.
  resetForm(): void {
    this.patente = '';
    this.marca = '';
    this.modelo = '';
    this.color = '';
  }

  get vehicleCount(): number {
    return this.vehicles.length;
  }
}
