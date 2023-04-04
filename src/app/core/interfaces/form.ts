import { Name, Business, Commodity, ActorType } from './business';
import { Rol } from './user';
import { Country, Region } from './cities';
import { City } from '../../public/signup/signup.component';
export interface ListCategories {
  count: number;
  next?: any;
  previous?: any;
  results: Category[];
}

export interface Category {
  id?: number;
  name: any;
  name_es: string;
  name_en: string;
  name_pt: string;
  code: string;
  status: boolean;
  subcategory: Subcategory[]; 
}

export interface ListSubcategory {
  count: number;
  next?: any;
  previous?: any;
  results: Subcategory[];
}

export interface Subcategory {
  id?: number;
  name: any;
  name_es: string;
  name_en: string;
  name_pt: string;
  code?: any;
  category?: Category;
  status: boolean;
}


export interface ListTopics {
    count: number;
    next?: any;
    previous?: any;
    results: Topic[];
}
  
export interface Topic {
  id?: number;
  name: any;
  name_es: string;
  name_en: string;
  name_pt: string;
  code: string;
  status: boolean;
  subcategory?: Subcategory;
  category?: Category;
}
  
export interface ListQuestionsBank {
  count: number;
  next?: any;
  previous?: any;
  results: Question[];
}


export interface Question {
  id: number;
  status: boolean;
  type: string;
  question_data: QuestionData;
  category: number;
  subcategory: number;
  topic: number;
}

export interface QuestionData {
  type?: string;
  group?: number;
  label?: Label;
  choices?: any;
  enabled?: boolean;
  required?: boolean;
  appearance?: string;
}


export interface Label {
  en: string;
  es: string;
  pt: string;
}

export interface TypeQuestion {
  name: string;
  code: string;
  img: string;
  type?: string
}


export interface QuestionSelectOne {
  id?: number;
  status?: boolean;
  type?: string;
  question_data?: QuestionData;
  category?: number;
  subcategory?: number;
  topic?: number;
}

export interface ListForm {
  count: number;
  next?: any;
  previous?: any;
  results: Form[];
}

export interface Form {
  id: number;
  version: number;
  code_form: string;
  name: string;
  created_by: number;
  open_date: string;
  expiration_date?: any;
  reported_period?: any;
  validity_period: number;
  period: Period;
}


export interface ListColaborators {
  count: number;
  next?: any;
  previous?: any;
  results: Colaborators[];
}

export interface Colaborators {
  id: number;
  email?: string;
  full_name: string;
  role?: Rol;
  groups?: Rol;
}


export interface ListPeriod {
  count: number;
  next?: any;
  previous?: any;
  results: Period[];
}

export interface Period {
  id: number;
  name: string;
  code: string;
  months: number;
}

export interface ListFormClient {
  count: number;
  next: string;
  previous?: any;
  results: FormClient[];
}

export interface FormClient {
  id: number;
  proforestform: number;
  code_form: string;
  name: string;
  created_by: number;
  open_date: string;
  expiration_date?: any;
  validity_period: number;
  revision_status: string;
  status_form: string;
  assigned_company: string;
  percentage_completion: number;
  evidence?: any;
  revisor?: any;
  days_of_revision?: any;
  deadline_revision?: any;
  send_to_company_suply_base: boolean;
  period?: Period;
  bank_questions: number[];
}



export interface CompleteForm {
  id: number;
  code_form: string;
  name: string;
  created_by: number;
  open_date: string;
  percentage_completion: number;
  expiration_date?: any;
  validity_period: number;
  period?: any;
  question_package: any;
  name_group:any;
  revision_status: string;
  status_form: string;
}

export interface ListFormCompany {
  count: number;
  next?: any;
  previous?: any;
  results: FormCompany[];
}

export interface FormCompany {
  id: number;
  proforestform: number;
  code_form: string;
  name: string;
  created_by: number;
  open_date: string;
  expiration_date: string;
  validity_period: number;
  allocating_company?: any;
  revision_status: string;
  status_form: string;
  assigned_company: Business;
  evidence?: any;
  revisor?: any;
  days_of_revision?: any;
  deadline_revision?: any;
  send_to_company_suply_base: boolean;
  period: Period;
  bank_questions: number[];
  percentage_validated: number;
  percentage_verified: number;
}

export interface ResultObservation {
  count: number;
  next?: any;
  previous?: any;
  results: Observation[];
}

export interface Observation {
  id: number;
  created_at: string;
  validation: string;
  reviewed_by: Reviewedby;
  reviewer_observations: string;
  profile: string;
}

export interface Reviewedby {
  id: number;
  email: string;
  full_name: string;
}

export interface ViewForm {
  id: number;
  code_form: string;
  name: string;
  created_by: number;
  open_date: string;
  expiration_date: string;
  validity_period: number;
  period: number;
  bank_questions: number[];
  version: number;
  collaborators: any;
  question_package: any;
  group_logic: any;
  name_group:any;
}


export interface ListVerifyValidate {
  count: number;
  next?: any;
  previous?: any;
  results: FormCompany[];
  formulario_name: string;
}


export interface Allocatingcompany {
  identifier_proforest_company: string;
  id: number;
  name: string;
  country: Country;
  region: Region;
  city: City;
  latitude?: any;
  longitude?: any;
  identifier_global_company: string;
  nit: string;
  commodity: Commodity;
  actor_type: ActorType;
  company_group?: any;
  validator_user?: any;
  company_profile: string;
  status_revision: string;
  status: boolean;
}
