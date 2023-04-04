import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeTitlePipe } from './change-title.pipe';
import { ExistAddQuestionPipe } from './exist-add-question.pipe';
import { PeriodNamePipe } from './period-name.pipe';
import { FormatPercentPipe } from './format-percent.pipe';



@NgModule({
  declarations: [
    ChangeTitlePipe,
    ExistAddQuestionPipe,
    PeriodNamePipe,
    FormatPercentPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ChangeTitlePipe,
    PeriodNamePipe,
    FormatPercentPipe
  ]
})
export class PipesModule { }
