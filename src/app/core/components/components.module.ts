import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { NavLeftComponent } from './nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './nav-bar/nav-right/nav-right.component';
import { NavSearchComponent } from './nav-bar/nav-left/nav-search/nav-search.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NavLogoComponent } from './navigation/nav-logo/nav-logo.component';
import { NavContentComponent } from './navigation/nav-content/nav-content.component';
import { NavCollapseComponent } from './navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './navigation/nav-content/nav-group/nav-group.component';
import { NavItemComponent } from './navigation/nav-content/nav-item/nav-item.component';
import { NavigationItem } from '../interfaces/navigation';
import { TranslateModule } from '@ngx-translate/core';
import { SpinnerComponent } from './spinner/spinner.component';
import { LoadComponent } from './load/load.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModulesModule } from '../modules/modules.module';
import { LoadTableComponent } from './load-table/load-table.component';
import { SelectOneComponent } from './question-bank/select-one/select-one.component';
import { MatrixSelectOneComponent } from './question-bank/matrix-select-one/matrix-select-one.component';
import { SelectMultipleComponent } from './question-bank/select-multiple/select-multiple.component';
import { MatrixSelectMultipleComponent } from './question-bank/matrix-select-multiple/matrix-select-multiple.component';
import { SelectOneListComponent } from './question-bank/select-one-list/select-one-list.component';
import { OpenQuestionComponent } from './question-bank/open-question/open-question.component';
import { UploadFileComponent } from './question-bank/upload-file/upload-file.component';
import { MatrixListComponent } from './question-bank/matrix-list/matrix-list.component';
import { ListFormsClientComponent } from './forms/list-forms-client/list-forms-client.component';
import { ListFormsColaboratorsComponent } from './forms/list-forms-colaborators/list-forms-colaborators.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    FooterComponent,
    NavCollapseComponent,
    NavGroupComponent,
    NavItemComponent,
    NavLeftComponent,
    NavRightComponent,
    NavSearchComponent,
    NavBarComponent,
    NavigationComponent,
    NavLogoComponent,
    NavContentComponent,
    SpinnerComponent,
    LoadComponent,
    LoadTableComponent,
    SelectOneComponent,
    MatrixSelectOneComponent,
    SelectMultipleComponent,
    MatrixSelectMultipleComponent,
    SelectOneListComponent,
    OpenQuestionComponent,
    UploadFileComponent,
    MatrixListComponent,
    ListFormsClientComponent,
    ListFormsColaboratorsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    ModulesModule,
    ReactiveFormsModule,
    PipesModule
  ],
  exports: [
    NavBarComponent,
    NavigationComponent,
    SpinnerComponent,
    LoadComponent,
    LoadTableComponent,
    SelectOneComponent,
    MatrixSelectOneComponent,
    SelectMultipleComponent,
    MatrixSelectMultipleComponent,
    SelectOneListComponent,
    OpenQuestionComponent,
    UploadFileComponent,
    MatrixListComponent,
    ListFormsClientComponent,
    ListFormsColaboratorsComponent
  ],
  providers: [
    NavigationItem,
    Location
  ]
})
export class ComponentsModule { }
