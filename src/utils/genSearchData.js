/**
 * This script generates a JSON file that contains all time zone names,
 * their corresponding alternative names, countries and main cities.
 */

const luxon = require('luxon');
const path = require('path');
const fs = require('fs');

// Source: https://github.com/vvo/tzdb/blob/main/raw-time-zones.json
const rawTimezones = require('./raw-time-zones.json');

const runGenerator = async () => {
  // Generate search data for time zone names
  // Format ['City, Country, Alternative name', 'Timezone Name']
  const searchData = rawTimezones.map((zone) => {
    let { name, countryName, mainCities, alternativeName } = zone;
    alternativeName = alternativeName.replace(/[T|t]ime/g, '').trim();
    const searchTerms = `|${[countryName, ...mainCities, alternativeName].join(
      '|'
    )}|`;
    return [searchTerms, name];
  });

  // Write the aggregated data to public folder so it can be sent to client side code
  const filePath = path.join(__dirname, 'searchData.json');
  // const timezoneData = JSON.stringify({
  //   offsetData: Object.fromEntries(offsetData.entries()),
  //   zoneNameData: Object.fromEntries(zoneNameLocations.entries()),
  // });

  fs.writeFile(filePath, JSON.stringify(searchData), (err) => {
    if (err) console.error(err.message);
  });
};

runGenerator().catch((err) => console.error(err));
