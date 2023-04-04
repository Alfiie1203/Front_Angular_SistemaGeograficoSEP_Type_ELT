import { Country, Region, City } from './cities';
export interface ListBusinessGroup {
  count: number;
  next?: any;
  previous?: any;
  results: BusinessGroup[];
}

export interface BusinessGroup {
  id: number;
  name: string;
  status: boolean;
}

export interface ListCommodity {
  count: number;
  next?: any;
  previous?: any;
  results: Commodity[];
  actor_type?: ActorType[];
}

export interface Commodity {
  id?: number;
  name?: any;
  name_es: string;
  name_en: string;
  name_pt: string;
  proforest_commodity_code: string;
  status: boolean;
}

export interface Name {
  en: string;
  es: string;
  pt: string;
}


export interface ListActorType {
  count: number;
  next: string;
  previous?: any;
  results: ActorType[];
}

export interface ActorType {
  id: number;
  name?: any;
  name_es: string;
  name_en: string;
  name_pt: string;
  commodity: Commodity;
  proforest_actortype_code: string;
  status: boolean;
  is_productor?: boolean;
}

export interface ListBusiness {
  count: number;
  next: string;
  previous?: any;
  results: Business[];
}

export interface Business {
  identifier_proforest_company: string;
  id: number;
  name: string;
  country: Country;
  region: Region;
  city: City;
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
  status_revision?: any;
  status: boolean;
}


