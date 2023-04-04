import { Country, Region } from './cities';
import { City } from '../../public/signup/signup.component';
import { Commodity, ActorType, BusinessGroup } from './business';

export interface ListTracebility {
  count: number;
  next?: any;
  previous?: any;
  results: Tracebility[];
}

export interface Tracebility {
  id?: number;
  supplier_company: string;
  company_group: string;
  supplier_tax_number: string;
  supplier_capacity: number;
  supplier_production: number;
  purchased_volume: number;
  certification_model: string;
  latitude: number;
  longitude: number;
  year: number;
  period: number;
}

export interface TracebilityDetails {
  id: number;
  reported_user: any;
  reported_company: string;
  supplier_company: string;
  commodity: any;
  actor_type: any;
  company_group?: any;
  supplier_name: string;
  supplier_tax_number: string;
  supplier_capacity: number;
  supplier_production: number;
  purchased_volume: number;
  certification: string;
  latitude: number;
  longitude: number;
  country: Country;
  region: Region;
  city: any;
  year: number;
  period: any;
  reported_company_nit?:any
}
