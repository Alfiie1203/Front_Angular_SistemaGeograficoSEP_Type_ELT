import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { PrimeNgModule } from './prime-ng/prime-ng.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    PrimeNgModule
  ],
  exports: [
    MaterialModule,
    PrimeNgModule
  ]
})
export class ModulesModule { }
