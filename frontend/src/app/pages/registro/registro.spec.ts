

// Spec de Angular: archivo de prueba que valida que el componente/servicio pueda crearse correctamente.
// Sirve como base para agregar pruebas mas profundas de comportamiento si se necesitara.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registro } from './registro';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
