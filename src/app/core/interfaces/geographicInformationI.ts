export interface CoordinatesResults {
    id: number;
    name: string;
    validated: string;
    status_revision?: any;
    deadline_validation?: any;
    commodity: number;
    actor_type: number;
}

export interface CoordinateAdminList {
    count: number;
    next?: string;
    previous: string;
    results: CoordinatesResults[];
}

export interface CoordinatesVerifyResults {
    id: number,
    name: string,
    nit: number,
    status_revision: string,
    validator_user: string,
    deadline_validation: string,
    commodity: number,
    actor_type: number,
    country: {
        id: number,
        name: string,
        slug: string,
        phone: string
    },
    region: {
        id: number,
        name: string,
        display_name: string,
        slug: string
    },
    city: {
        id: number,
        name: string,
        display_name: string,
        slug: string
    },
    latitude: number,
    longitude:number,
    note_revision?: string
}
export interface CoordinateVerifyList {
    count: number;
    next?: string;
    previous: string;
    results: CoordinatesVerifyResults[];
}

export interface TraceabilityList {
    id:number,
    reported_user:string,
    reported_company:string,
    supplier_company:string
}

