Uses the assets in `assets/*` to generate:
1) `db.json`, a lightweight grouping of the record ids
2) `db/[id].json`, a set of content blobs, one for each record id

To generate the output:
`npm install`
`npm run build`

The asset files are:
- manual_data.csv
    Manually curated data that overrides all other records. Use this for manually fixing or extending existing records
- mpv_data.csv
    The Mapping Police Violence database, [source](https://mappingpoliceviolence.org/)
- newsapi.csv
    A set of news search results for some records
- wapo_data.csv
    The Washington Post police shootings database, [source](https://github.com/washingtonpost/data-police-shootings). This
    database provides the canonical record IDs for this package
- youtube.csv
    A set of youtube search results for some records

This project is published under the [Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/) license.