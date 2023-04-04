import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DialogModule } from 'primeng/dialog';
import { MatRippleModule } from '@angular/material/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {SkeletonModule} from 'primeng/skeleton';
import {SelectButtonModule} from 'primeng/selectbutton';
import {CalendarModule} from 'primeng/calendar';
import {MultiSelectModule} from 'primeng/multiselect';
import { CaptchaModule } from 'primeng/captcha';
import {AutoCompleteModule} from 'primeng/autocomplete';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    DropdownModule,
    ButtonModule,
    InputSwitchModule,
    DialogModule,
    MatRippleModule,
    PanelMenuModule,
    AccordionModule,
    ToastModule,
    OverlayPanelModule,
    SkeletonModule,
    SelectButtonModule,
    CalendarModule,
    MultiSelectModule,
    CaptchaModule,
    AutoCompleteModule
  ],
  exports: [
    InputTextModule,
    PasswordModule,
    DividerModule,
    DropdownModule,
    ButtonModule,
    InputSwitchModule,
    DialogModule,
    MatRippleModule,
    PanelMenuModule,
    AccordionModule,
    ToastModule,
    OverlayPanelModule,
    SkeletonModule,
    SelectButtonModule,
    CalendarModule,
    MultiSelectModule,
    CaptchaModule,
    AutoCompleteModule
  ]
})
export class PrimeNgModule { }
