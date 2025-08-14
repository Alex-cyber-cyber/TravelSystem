import { Component, EventEmitter, Output, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-sucursales-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './sucursales-form.html',
  styleUrls: ['./sucursales-form.scss']
})
export class SucursalesForm {
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Input() darkMode: boolean = false;

  branchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document
    
  ) {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(10)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      manager: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    const observer = new MutationObserver(() => {
    });
    
    observer.observe(this.document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private checkDarkMode(): void {
    this.darkMode = this.document.body.classList.contains('dark-theme');
  }

  onSubmit(): void {
    if (this.branchForm.valid) {
      this.formSubmit.emit(this.branchForm.value);
    } else {
      this.branchForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}