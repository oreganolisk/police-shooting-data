import { createReadStream, exists, existsSync } from 'fs';
import { promises as fsp } from 'fs';
import * as neatCsv from 'neat-csv';
import { MpvRow, WapoRow, NewsApiRow, YoutubeRow, ManualRow } from './asset_schemas';
import { IncidentLookupTable, Incident, Race, Armed } from './output_schemas';
import * as rimraf from 'rimraf';

interface SourceData {
    mpv: MpvRow[];
    wapo: WapoRow[];
    newsapi: NewsApiRow[];
    youtube: YoutubeRow[];
    manual: ManualRow[];
}

async function load(): Promise<SourceData> {
    console.log('Loading...');
    const mpv = await neatCsv(createReadStream('./assets/mpv_data.csv')) as MpvRow[];
    console.log(`...mpv_data.csv ${mpv.length} rows`)
    const wapo = await neatCsv(createReadStream('./assets/wapo_data.csv')) as WapoRow[];
    console.log(`...wapo_data.csv ${wapo.length} rows`)
    const newsapi = await neatCsv(createReadStream('./assets/newsapi.csv')) as NewsApiRow[];
    console.log(`...newsapi.csv ${newsapi.length} rows`)
    const youtube = await neatCsv(createReadStream('./assets/youtube.csv')) as YoutubeRow[];
    console.log(`...youtube.csv ${youtube.length} rows`)
    const manual = await neatCsv(createReadStream('./assets/manual_data.csv')) as ManualRow[];
    console.log(`...manual_data.csv ${manual.length} rows`)
    console.log('Done.');
    
    return { mpv, wapo, newsapi, youtube, manual } as SourceData;
}

interface OutData {
    db: IncidentLookupTable;
    content: Incident[];
}

async function write(data: OutData): Promise<void> {
    console.log('Cleaning...');
    rimraf.sync('./dist');
    await fsp.mkdir('./dist');
    await fsp.mkdir('./dist/db');
    console.log('Done.');

    console.log('Writing...');
    await fsp.writeFile('./dist/db.json', JSON.stringify(data.db, null, 2));
    console.log('...db.json');
    console.log(`Writing ${data.content.length} content files...`);
    const incr = Math.ceil(data.content.length / 10);
    for (var i = 0; i < 10; i++) {
        for (var j = i * incr; j < (i + 1) * incr && j < data.content.length; j++) {
            await fsp.writeFile(`./dist/db/${data.content[j].id}.json`, JSON.stringify(data.content[j], null, 2));
        }
        if (i < 9) {
            console.log(`...${(i + 1) * 10}%`);
        }
    }
    console.log('Done.');
}

interface CollatedRow {
    mpv: MpvRow;
    wapo: WapoRow;
    newsapi: NewsApiRow;
    youtube: YoutubeRow;
    manual: ManualRow;
}

function collate(data: SourceData): CollatedRow[] {
    // for now documents are organized on their wapo ids. Records without wapo ids are ignored
    return data.wapo.map(row => ({
        wapo: row,
        mpv: data.mpv.find(other => row.id === other.wapo_id),
        newsapi: data.newsapi.find(other => row.id === other.wapo_id),
        youtube: data.youtube.find(other => row.id === other.wapo_id),
        manual: data.manual.find(other => row.id === other.id)
    }));
}

function merge(rows: CollatedRow[]): Incident[] {
    return rows.map(row => ({
            ...row.newsapi, // note: all properties are added in addition to the canonical properties
            ...row.youtube,
            ...row.mpv,
            ...row.wapo,
            ...row.manual,
            id: parseInt(row.wapo?.id),
            name: row.wapo?.name,
            age: parseInt(row.wapo?.age),
            race: row.wapo?.race,
            gender: row.wapo?.gender,
            armed: row.wapo?.armed,
            location: row.wapo?.city,
            date: row.wapo?.date,
            photo: row.manual?.photo || row.mpv?.photo,
            youtubeEmbed: row.manual?.youtubeEmbed || row.youtube?.video_id,
            iframeEmbed: row.manual?.iframeEmbed || row.newsapi?.video,
            description: row.manual?.description || row.mpv?.description,
            newsLink: row.manual?.newsLink || row.newsapi?.news || row.mpv?.news_link
    }));
}

function youtubeIdFromUrl(url: string): string {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length==11)? match[7] : null;
}

function repair(rows: Incident[]): Incident[] {
    var ytedits = 0;
    rows = rows.map(row => {
        if (!!row.iframeEmbed) {
            const ytembed = youtubeIdFromUrl(row.iframeEmbed);
            if (ytembed) {
                row.youtubeEmbed = ytembed;
                row.iframeEmbed = undefined;
                ytedits++;
            }
        }

        return row;
    });

    console.log(`Repaired ${ytedits} iframe embed strings to youtube embed ids`);

    return rows;
}

function whereFilter(rows: Incident[]): Incident[] {
    return rows.filter(row =>
        new Date(row.date).getFullYear() === 2019);
}

function toRace(race: string): Race {
    switch (race.toLowerCase()) {
        case 'w': return Race.White;
        case 'b': return Race.Black;
        case 'h': return Race.Hispanic;
        default: return Race.Other;
    }
}

function toArmed(armed: string): Armed {
    switch (armed.toLowerCase()) {
        case 'gun': return Armed.Gun;
        case 'knife': return Armed.Knife;
        case 'unarmed': return Armed.Unarmed;
        default: return Armed.Other;
    }
}

interface IncidentGroup {
    race: Race,
    armed: Armed,
    incidents: Incident[]
}

function group(rows: Incident[]): IncidentGroup[] {
    const groups: IncidentGroup[] = [];
    for (var race of [Race.White, Race.Black, Race.Hispanic, Race.Other]) {
        for (var armed of [Armed.Gun, Armed.Knife, Armed.Unarmed, Armed.Other]) {
            groups.push({
                race,
                armed,
                incidents: rows.filter(row =>
                    toRace(row.race) === race && toArmed(row.armed) === armed)
            });
        }
    }

    return groups.sort((a, b) => a.incidents.length - b.incidents.length);
}

function hasContent(row: Incident): boolean {
    return !!row.photo && !!(row.youtubeEmbed || row.iframeEmbed) && !!row.description;
}

function build(data: SourceData): OutData {
    const collated = collate(data);
    const merged = merge(collated);
    console.log(`Collated and merged ${merged.length} records`);
    const repaired = repair(merged);
    const filtered = whereFilter(repaired);
    console.log(`Filtered to ${filtered.length} records`);
    const groups = group(filtered);
    console.log(`Merged to ${groups.length} groups by Race, Armed`);

    const db: IncidentLookupTable = {
        description: "Draft database, filtered to 2019, content for unarmed only",
        groups: groups.map(grp => ({
            armed: grp.armed,
            race: grp.race,
            n: grp.incidents.length,
            ids: grp.incidents.filter(hasContent).map(row => row.id),
            idsMissingContent: grp.incidents.filter(row => !hasContent(row)).map(row => row.id)
        }))
    };

    console.log('Sufficient content by group...');
    for (var grp of db.groups) {
        console.log(`...${grp.ids.length}/${grp.n} for ${grp.armed} | ${grp.race}`)
    }
    console.log(`Overall, database has sufficient content for ${filtered.filter(hasContent).length}/${filtered.length} records.`);

    return { db, content: filtered };
}

async function main() {
    await write(build(await load()));
}

main();
