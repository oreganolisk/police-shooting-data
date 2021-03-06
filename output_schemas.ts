
export enum Race { 
    White = 'White',
    Black = 'Black',
    Hispanic = 'Hispanic',
    Other = 'Other'
}

export enum Armed {
    Gun = 'Gun',
    Knife = 'Knife',
    Unarmed = 'Unarmed',
    Other = 'Other'
}

export interface IncidentGroup {
    race: Race;
    armed: Armed;
    n: number; // the total number of records in this category
    ids: number[]; // the ids of records in this category that have "full" content
    idsMissingContent: number[]; // ids that are missing critical content, like photo
}

// lightweight reference to all incidents, binned by [race] and [armed]
export interface IncidentLookupTable {
    description: string; // e.g. "2019 shootings, wapo database, sampled"
    groups: IncidentGroup[];
}

// all info for a specific incident
export interface Incident {
    id: number;
    name: string;
    age: number;
    race: string;
    gender: string;
    armed: string;
    location: string; // e.g. "Portland, OR"
    date: string;
    description: string;
    photo: string; // url
    youtubeEmbed: string; // embed code,
    iframeEmbed: string; // iframe string
    newsLink: string; // url
}
