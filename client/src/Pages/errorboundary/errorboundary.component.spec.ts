import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorboundaryComponent } from './errorboundary.component';

describe('ErrorboundaryComponent', () => {
  let component: ErrorboundaryComponent;
  let fixture: ComponentFixture<ErrorboundaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorboundaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorboundaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
