
// Spec de Angular: archivo de prueba que valida que el componente/servicio pueda crearse correctamente.
// Sirve como base para agregar pruebas mas profundas de comportamiento si se necesitara.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoSistema } from './estado-sistema';

describe('EstadoSistema', () => {
  let component: EstadoSistema;
  let fixture: ComponentFixture<EstadoSistema>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoSistema],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoSistema);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
