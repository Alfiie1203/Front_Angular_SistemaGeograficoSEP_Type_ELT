import { City, Country, Region } from './cities';
import { Commodity, ActorType, BusinessGroup } from './business';

export interface ResultUsers {
  count: number;
  next?: any;
  previous?: any;
  results: User[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  second_name: string;
  surname: string;
  second_surname: string;
  role?: Rol;
  groups: SubRol;
  company?: CompanyUser;
  phone: string;
  country?: Country;
  indicative: string;
  region?: Region;
  city?: Region;
  status: boolean;
  permissions: string[];
  permissions_detail: PermissionsDetail;
}

export interface CompanyUser {
  identifier_proforest_company: string;
  id: number;
  name: string;
  country: Country;
  region: Region;
  city: Region;
  latitude: number;
  longitude: number;
  identifier_global_company: string;
  nit: string;
  commodity: Commodity;
  actor_type: ActorType;
  company_group: BusinessGroup;
  manage_user?: any;
  validator_user?: any;
  company_profile: string;
  validated: string;
  status: boolean;
}

export interface PermissionsDetail {
  actortype: string[];
  commodity: string[];
  company: string[];
  companygroup: string[];
  validatecompany: string[];
  verifycompany: string[];
  formulario: string[];
  question: string[];
  proforestform: string[];
  category: string[];
  questionbank: string[];
  subcategory: string[];
  topic: string[];
  traceability: string[];
  validatetraceability: string[];
  verifytraceability: string[];
  user: string[];
}

export interface Rol {
  id: number;
  name: string;
  items?: SubRol[];
}

export interface SubRol {
  id: number;
  name: string;
  role_id?: number;
}

export interface RolPermission {
  id: number;
  name: string;
  permissions: string[];
}


export interface PermissionStatus {
  actortype: boolean;
  commodity: boolean;
  company: boolean;
  companygroup: boolean;
  proforestform: boolean;
  category: boolean;
  questionbank: boolean;
  subcategory: boolean;
  topic: boolean;
  user: boolean;
}