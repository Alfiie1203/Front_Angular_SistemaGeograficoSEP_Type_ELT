export interface Country {
  id?: number;
  slug: string;
  name: string;
  phone?: string;
}

export interface Region {
  id?: number;
  slug: string;
  name: string;
  display_name: string;
}

export interface City {
  id?: number;
  slug: string;
  name: string;
  display_name: string;
}

export interface Goecode  {
  plus_code: Pluscode;
  results: ResultGeocode[];
  status: string;
}

export interface ResultGeocode {
  address_components: Addresscomponent[];
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
  plus_code?: Pluscode;
  types: string[];
}

interface Geometry {
  location: Location;
  location_type: string;
  viewport: Viewport;
  bounds?: Viewport;
}

interface Viewport {
  northeast: Location;
  southwest: Location;
}

interface Location {
  lat: number;
  lng: number;
}

interface Addresscomponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface Pluscode {
  compound_code: string;
  global_code: string;
}

export interface GeocoderAddress {
  results: Address[];
  status: string;
}

interface Address {
  address_components: Addresscomponent[];
  formatted_address: string;
  geometry: GeometryAddress;
  partial_match: boolean;
  place_id: string;
  types: string[];
}

interface GeometryAddress {
  bounds?: Bounds;
  location: Northeast;
  location_type: string;
  viewport: Bounds;
}

interface Bounds {
  northeast: Northeast;
  southwest: Northeast;
}

interface Northeast {
  lat: number;
  lng: number;
}
