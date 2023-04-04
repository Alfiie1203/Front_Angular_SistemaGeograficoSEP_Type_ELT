import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { PrivateComponent } from './private.component';
import { ComponentsModule } from '../core/components/components.module';
import { PrivateRoutingModule } from './private-routing.module';
import { ListBusinessComponent } from './business/list-business/list-business.component';
import { BlankComponent } from './blank/blank.component';
import { TranslateModule } from '@ngx-translate/core';
import { ModulesModule } from '../core/modules/modules.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateEditBusinessComponent } from './business/create-edit-business/create-edit-business.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { CommodityComponent } from './commodity/commodity.component';
import { TypeActorComponent } from './type-actor/type-actor.component';
import { BusinessGroupComponent } from './business-group/business-group.component';
import { UsersComponent } from './users/users.component';
import { CreateEditUserComponent } from './users/create-edit-user/create-edit-user.component';
import { PipesModule } from '../core/pipes/pipes.module';
import { HomeComponent } from './home/home.component';
import { CategoriesComponent } from './categories/categories/categories.component';
import { SubcategoriesComponent } from './categories/subcategories/subcategories.component';
import { TopicsComponent } from './categories/topics/topics.component';
import { QuestionBankComponent } from './question-bank/question-bank.component';import { CreateEditQuestionBankComponent } from './question-bank/create-edit-question-bank/create-edit-question-bank.component';
import { TracebilityComponent } from './tracebility/tracebility.component';
import { CreateEditTracebilityComponent } from './tracebility/create-edit-tracebility/create-edit-tracebility.component';
import { ListFormsComponent } from './forms/list-forms/list-forms.component';
import { RegisterFormsComponent } from './forms/register-forms/register-forms.component';
import { ValidateVerifyFormsComponent } from './forms/validate-verify-forms/validate-verify-forms.component';
import { ListFormsCompanyComponent } from './forms/validate-verify-forms/list-forms-company/list-forms-company.component';
import { ReviewFormComponent } from './forms/validate-verify-forms/list-forms-company/review-form/review-form.component';
import { ViewFormComponent } from './forms/list-result-form/view-form/view-form.component';
import { CompleteFormComponent } from './forms/complete-form/complete-form.component';
import { ViewTraceabilityComponent } from './tracebility/view-traceability/view-traceability.component';
import { AssignValidatorComponent } from './geographicInformation/assign-validator/assign-validator.component';
import { CreateEditTraceabilityAdminComponent } from './tracebility/create-edit-traceability-admin/create-edit-traceability-admin.component';
import { ValidateComponent } from './geographicInformation/validate/validate.component';
import { GeographicinformationComponent } from './geographicInformation/geographicinformation.component';
import { ValidateTraceabilityComponent } from './geographicInformation/validate-traceability/validate-traceability.component';
import { SupplyBaseComponent } from './supply-base/supply-base.component';
import { SupplyBaseViewComponent } from './supply-base/supply-base-view/supply-base-view.component';
import { CreateEditSupplyBaseComponent } from './supply-base/create-edit-supply-base/create-edit-supply-base.component';
import { NgChartsModule } from 'ng2-charts';
import { VerifyTraceabilityComponent } from './geographicInformation/verify-traceability/verify-traceability.component';
import { VerifyCompanyComponent } from './geographicInformation/verify-company/verify-company.component';

import { NgxMaskModule, IConfig } from 'ngx-mask';
import { AssignVerifyComponent } from './geographicInformation/assign-verify/assign-verify.component';
import { SupplyBaseCompareviewComponent } from './supply-base/supply-base-compareview/supply-base-compareview.component';
import { DeleteBusinessComponent } from './business/delete-business/delete-business.component'
const maskConfigFunction: () => Partial<IConfig> = () => {
  return {
    validation: false,
  };
};
import { DatePipe } from '@angular/common';
import { ReviewFormVerifyComponent } from './forms/validate-verify-forms/list-forms-company/review-form-verify/review-form-verify.component';
import { ValidateFormListComponent } from './forms/validate-form-list/validate-form-list.component';
import { VerifyFormListComponent } from './forms/verify-form-list/verify-form-list.component';
import { AssignCompanyValidatorComponent } from './geographicInformation/assign-company-validator/assign-company-validator.component';
import { AssignCompanyVerifyComponent } from './geographicInformation/assign-company-verify/assign-company-verify.component';
import { ResumeValidateTraceabilityComponent } from './geographicInformation/resume-validate-traceability/resume-validate-traceability.component';
import { ResumeVerifyTraceabilityComponent } from './geographicInformation/resume-verify-traceability/resume-verify-traceability.component';
import { MyUserComponent } from './users/my-user/my-user.component';
import { ListResultFormComponent } from './forms/list-result-form/list-result-form.component';


@NgModule({
  declarations: [
    PrivateComponent,
    ListBusinessComponent,
    BlankComponent,
    CreateEditBusinessComponent,
    CommodityComponent,
    TypeActorComponent,
    BusinessGroupComponent,
    UsersComponent,
    CreateEditUserComponent,
    HomeComponent,
    CategoriesComponent,
    SubcategoriesComponent,
    TopicsComponent,
    QuestionBankComponent,
    CreateEditQuestionBankComponent,
    TracebilityComponent,
    CreateEditTracebilityComponent,
    ListFormsComponent,
    RegisterFormsComponent,
    ValidateVerifyFormsComponent,
    ListFormsCompanyComponent,
    ReviewFormComponent,
    ViewFormComponent,
    CompleteFormComponent,
    ViewTraceabilityComponent,
    AssignValidatorComponent,
    CreateEditTraceabilityAdminComponent,
    ValidateComponent,
    GeographicinformationComponent,
    ValidateTraceabilityComponent,
    SupplyBaseComponent,
    SupplyBaseViewComponent,
    CreateEditSupplyBaseComponent,
    VerifyTraceabilityComponent,
    VerifyCompanyComponent,
    AssignVerifyComponent,
    SupplyBaseCompareviewComponent,
    DeleteBusinessComponent,
    ReviewFormVerifyComponent,
    ValidateFormListComponent,
    VerifyFormListComponent,
    AssignCompanyValidatorComponent,
    AssignCompanyVerifyComponent,
    ResumeValidateTraceabilityComponent,
    ResumeVerifyTraceabilityComponent,
    MyUserComponent,
    ListResultFormComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    PrivateRoutingModule,
    TranslateModule,
    ModulesModule,
    FormsModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    PipesModule,
    NgChartsModule,
    NgxMaskModule.forRoot(maskConfigFunction)
  ],
  providers: [
    Location,
    DatePipe
  ]
})
export class PrivateModule { }
