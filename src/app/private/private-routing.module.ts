import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListBusinessComponent } from './business/list-business/list-business.component';
import { HomeComponent } from './home/home.component';
import { CreateEditBusinessComponent } from './business/create-edit-business/create-edit-business.component';
import { CommodityComponent } from './commodity/commodity.component';
import { TypeActorComponent } from './type-actor/type-actor.component';
import { BusinessGroupComponent } from './business-group/business-group.component';
import { UsersComponent } from './users/users.component';
import { CreateEditUserComponent } from './users/create-edit-user/create-edit-user.component';
import { CategoriesComponent } from './categories/categories/categories.component';
import { SubcategoriesComponent } from './categories/subcategories/subcategories.component';
import { TopicsComponent } from './categories/topics/topics.component';
import { QuestionBankComponent } from './question-bank/question-bank.component';
import { CreateEditQuestionBankComponent } from './question-bank/create-edit-question-bank/create-edit-question-bank.component';
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
import { VerifyTraceabilityComponent } from './geographicInformation/verify-traceability/verify-traceability.component';
import { VerifyCompanyComponent } from './geographicInformation/verify-company/verify-company.component';
import { AssignVerifyComponent } from './geographicInformation/assign-verify/assign-verify.component';
import { SupplyBaseCompareviewComponent } from './supply-base/supply-base-compareview/supply-base-compareview.component';
import { DeleteBusinessComponent } from './business/delete-business/delete-business.component';
import { ReviewFormVerifyComponent } from './forms/validate-verify-forms/list-forms-company/review-form-verify/review-form-verify.component';
import { ValidateFormListComponent } from './forms/validate-form-list/validate-form-list.component';
import { VerifyFormListComponent } from './forms/verify-form-list/verify-form-list.component';
import { AssignCompanyValidatorComponent } from './geographicInformation/assign-company-validator/assign-company-validator.component';
import { AssignCompanyVerifyComponent } from './geographicInformation/assign-company-verify/assign-company-verify.component';
import { ResumeValidateTraceabilityComponent } from './geographicInformation/resume-validate-traceability/resume-validate-traceability.component';
import { ResumeVerifyTraceabilityComponent } from './geographicInformation/resume-verify-traceability/resume-verify-traceability.component';
import { MyUserComponent } from './users/my-user/my-user.component';
import { ListResultFormComponent } from './forms/list-result-form/list-result-form.component';

const routes: Routes = [
   {
    path: 'home',
    component: HomeComponent
   },
   {
    path: 'business/list-business',
    component: ListBusinessComponent
   },
   {
    path: 'business/create-edit-business',
    component: CreateEditBusinessComponent
   },
   {
    path: 'business/delete-business',
    component: DeleteBusinessComponent
   },
   {
    path: 'commodity',
    component: CommodityComponent
   },
   {
    path: 'type-actor',
    component: TypeActorComponent
   },
   {
    path: 'business-group',
    component: BusinessGroupComponent
   },
   {
    path: 'users/list',
    component: UsersComponent
   },
   {
    path: 'my-user',
    component: MyUserComponent
   },
   {
    path: 'users/create-edit-user',
    component: CreateEditUserComponent
   },
   {
    path: 'categories/categories',
    component: CategoriesComponent
   },
   {
    path: 'categories/subcategories',
    component: SubcategoriesComponent
   },
   {
    path: 'categories/topics',
    component: TopicsComponent
   },
   {
    path: 'question-bank',
    component: QuestionBankComponent
   },
   {
    path: 'question-bank/create-edit-question-bank',
    component: CreateEditQuestionBankComponent
   },
   {
    path: 'traceability',
    component: TracebilityComponent
   },
   {
    path: 'traceability/create-edit-tracebility',
    component: CreateEditTracebilityComponent
   },
   {
    path: 'traceability/create-edit-tracebility/:id',
    component: CreateEditTracebilityComponent,
    data: {
      SCENARIO: 'update'
    }
   },
   {
    path: 'traceability/create-edit-traceability-admin',
    component: CreateEditTraceabilityAdminComponent
   },
   {
    path: 'traceability/create-edit-traceability-admin/:id',
    component: CreateEditTraceabilityAdminComponent,
    data: {
      SCENARIO: 'update'
    }
   },
   
   {
    path: 'traceability/view/:id',
    component: ViewTraceabilityComponent
   },
   {
    path: 'forms/list-forms',
    component: ListFormsComponent
   },
   {
    path: 'forms/view-forms',
    component: ListResultFormComponent
   },
   {
    path: 'forms/view-forms/view-form',
    component: ViewFormComponent
   },
   {
    path: 'forms/assing-form',
    component: ListFormsComponent,
    data: {
      assing: true
    }
   },
   {
    path: 'forms/list-forms/register-forms',
    component: RegisterFormsComponent
   },
   {
    path: 'forms/validated-forms',
    component: ValidateVerifyFormsComponent,
    data:{
      type: 'validate'
    }
   },
   {
    path: 'forms/validate-forms/validate-form-list',
    component: ValidateFormListComponent
   },
   
   {
    path: 'forms/validate-forms/verify-form-list',
    component: VerifyFormListComponent
   },
   {
    path: 'forms/validated-forms/list-forms-company',
    component: ListFormsCompanyComponent
   },
   {
    path: 'forms/validated-forms/list-forms-company/review-form',
    component: ReviewFormComponent
   },
   {
    path: 'forms/verified-forms',
    component: ValidateVerifyFormsComponent,
    data:{
      type: 'verified'
    }
   },
   {
    path: 'forms/verified-forms/list-forms-company',
    component: ListFormsCompanyComponent
   },
   {
    path: 'forms/verified-forms/list-forms-company/review-form-verify',
    component: ReviewFormVerifyComponent
   },
   {
    path: 'forms/view-form',
    component: ViewFormComponent
   },
   
   //ValidateFormsComponent
   {
    path: 'forms/complete-form',
    component: CompleteFormComponent
   },
   {
    path: 'geographic-information',
    component: GeographicinformationComponent,
   },
   {
    path: 'geographic-information/assign-company-validator',
    component: AssignCompanyValidatorComponent,
   },
   {
    path: 'geographic-information/assign-company-verify',
    component: AssignCompanyVerifyComponent,
   },
   
   {
    path: 'geographic-information/assign-validator',
    component: AssignValidatorComponent,
   },
   ///geographic-information/assign-verify
   {
    path: 'geographic-information/assign-checker',
    component: AssignVerifyComponent,
   },
   {
    path: 'geographic-information/verify-traceability',
    component: VerifyTraceabilityComponent
   },
   {
    path: 'geographic-information/verify-company',
    component: VerifyCompanyComponent
   },   
   {
    path: 'geographic-information/validate-traceability',
    component: ValidateTraceabilityComponent
   },
   {
    path: 'geographic-information/validate-traceability/resume-validate-traceability',
    component: ResumeValidateTraceabilityComponent
   },
   {
    path: 'geographic-information/verify-traceability/resume-verify-traceability',
    component: ResumeVerifyTraceabilityComponent
   },
   {
    path: 'geographic-information/validate-company',
    component: ValidateComponent
   },
   
   {
    path: 'supply-base',
    component: SupplyBaseComponent
   },
   {
    path: 'supply-base/view/:id',
    component: SupplyBaseViewComponent
   },
   {
    path: 'supply-base/create',
    component: CreateEditSupplyBaseComponent,
    data: {
      scenario: 'create'
    }
   },
   {
    path: 'supply-base/admin/create',
    component: CreateEditSupplyBaseComponent,
    data: {
      scenario: 'create',
      rol: 'admin'
    }
   },
   {
    path: 'supply-base/compareview/:id',
    component: SupplyBaseCompareviewComponent,
   },
   
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class PrivateRoutingModule { }
