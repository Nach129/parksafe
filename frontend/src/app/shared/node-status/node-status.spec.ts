

// Spec de Angular: archivo de prueba que valida que el componente/servicio pueda crearse correctamente.
// Sirve como base para agregar pruebas mas profundas de comportamiento si se necesitara.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeStatus } from './node-status';

describe('NodeStatus', () => {
  let component: NodeStatus;
  let fixture: ComponentFixture<NodeStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(NodeStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
