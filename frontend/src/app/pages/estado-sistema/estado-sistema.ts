

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { interval, Subscription } from 'rxjs';

import { Navbar } from '../../shared/navbar/navbar';

import { SystemService } from '../../core/services/system.service';

import { SystemStatusResponse } from '../../core/models/system.model';

@Component({
  selector: 'app-estado-sistema',

  standalone: true,

  imports: [CommonModule, Navbar],

  templateUrl: './estado-sistema.html',

  styleUrl: './estado-sistema.css',
})
// Pantalla de monitoreo: consulta periodicamente Gateway, heartbeat y nodo activo.
export class EstadoSistema implements OnInit, OnDestroy {
  loading = true;

  errorMessage = '';

  system: SystemStatusResponse | null = null;

  autoRefresh = true;

  private refreshSubscription?: Subscription;

  constructor(
    private systemService: SystemService,

    private cdr: ChangeDetectorRef,
  ) {}
  // Hook de Angular que ejecuta la carga inicial cuando el componente aparece en pantalla.
  ngOnInit(): void {
    this.loadStatus();
    this.startAutoRefresh();
  }
  // Hook de Angular que limpia timers/subscripciones para evitar tareas en segundo plano.
  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }
  // Consulta el estado distribuido actual y actualiza tarjetas de Gateway/nodos.
  loadStatus(): void {
    this.errorMessage = '';

    this.systemService
      .getStatus()
      // subscribe separa exito y error de la llamada asincrona para actualizar UI y mensajes.
      .subscribe({
        next: (response) => {
          this.system = response;

          this.loading = false;

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('Error obteniendo estado:', error);

          this.errorMessage =
            error?.error?.message || 'No fue posible consultar el estado del sistema';

          this.loading = false;

          this.cdr.markForCheck();
        },
      });
  }
  // Activa refresco automatico para observar heartbeat/failover en vivo.
  startAutoRefresh(): void {
    this.refreshSubscription = interval(3000).subscribe(() => {
      if (this.autoRefresh) {
        this.loadStatus();
      }
    });
  }
  // Enciende o apaga el refresco automatico desde la pantalla de estado.
  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
  }

  get activeNode(): string {
    return this.system?.nodeManager?.activeNode || 'DESCONOCIDO';
  }

  get activeNodeUrl(): string {
    return this.system?.nodeManager?.activeNodeUrl || '-';
  }

  get primaryStatus(): string {
    return this.system?.heartbeat?.primary?.status || 'UNKNOWN';
  }

  get backupStatus(): string {
    return this.system?.heartbeat?.backup?.status || 'UNKNOWN';
  }

  get primaryRole(): string {
    return this.system?.heartbeat?.primary?.details?.role || '-';
  }

  get backupRole(): string {
    return this.system?.heartbeat?.backup?.details?.role || '-';
  }

  get failoverExecuted(): boolean {
    return this.system?.nodeManager?.failoverExecuted || false;
  }
}
