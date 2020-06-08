import { createReadStream } from 'fs';
import * as neatCsv from 'neat-csv';
import { MpvRow, WapoRow, UnarmedNewsApiRow, UnarmedYoutubeRow } from './schemas';

interface SourceData {
    mpv: MpvRow[];
    wapo: WapoRow[];
    newsapi: UnarmedNewsApiRow[];
    youtube: UnarmedYoutubeRow[];
}

async function load() {
    console.log('Loading...');
    const mpv = await neatCsv(createReadStream('./assets/mpv_data.csv')) as MpvRow[];
    console.log(`...mpv_data.csv ${mpv.length} rows`)
    const wapo = await neatCsv(createReadStream('./assets/wapo_data.csv')) as WapoRow[];
    console.log(`...wapo_data.csv ${wapo.length} rows`)
    const newsapi = await neatCsv(createReadStream('./assets/unarmed_newsapi.csv')) as UnarmedNewsApiRow[];
    console.log(`...unarmed_newsapi.csv ${newsapi.length} rows`)
    const youtube = await neatCsv(createReadStream('./assets/unarmed_youtube.csv')) as UnarmedYoutubeRow[];
    console.log(`...unarmed_youtube.csv ${youtube.length} rows`)
    console.log('Done.');
    
    return { mpv, wapo, newsapi, youtube } as SourceData;
}

async function build() {
    const data: SourceData = await load();

}

build();
