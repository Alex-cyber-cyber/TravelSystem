import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioAsignacion } from './formulario-asignacion';

describe('FormularioAsignacion', () => {
  let component: FormularioAsignacion;
  let fixture: ComponentFixture<FormularioAsignacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAsignacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioAsignacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
