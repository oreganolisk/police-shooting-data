export interface MpvRow {
    name: string;
    age: string;
    gender: string;
    race: string;
    photo: string;
    date: string; // month/day/year
    address: string;
    city: string;
    state: string;
    zipcode: string;
    county: string;
    agency_responsible: string;
    cause_of_death: string;
    description: string;
    official_disposition: string; // justified or other
    criminal_charges: string;
    news_link: string;
    mental_illness: string,
    unarmed: string;
    weapon: string;
    threat_level: string;
    fleeing: string;
    body_camera: string;
    wapo_id: string;
    off_duty: string;
    geography: string; // urban/rural/...
    id: string;
}

export interface WapoRow {
    id: string;
    name: string;
    date: string;
    manner_of_death: string;
    armed: string;
    age: string;
    gender: string;
    race: string;
    city: string;
    state: string;
    signs_of_mental_illness: string;
    threat_level: string;
    flee: string;
    body_camera: string;
}

export interface UnarmedNewsApiRow {
    name: string;
    wapo_id: string;
    city: string;
    race: string;
    date: string;
    video: string;
    news: string;
}

export interface UnarmedYoutubeRow {
    video_id: string;
    upload_date: string;
    title: string;
    description: string;
    name: string;
    wapo_id: string;
    weapon: string;
    race: string;
    mpv_description: string;
}