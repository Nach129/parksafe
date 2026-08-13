
// Spec de Angular: archivo de prueba que valida que el componente/servicio pueda crearse correctamente.
// Sirve como base para agregar pruebas mas profundas de comportamiento si se necesitara.

import { TestBed } from '@angular/core/testing';

import { Reservations } from './reservations';

describe('Reservations', () => {
  let service: Reservations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reservations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
