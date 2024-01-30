const luxon = require('luxon');
const path = require('path');
const fs = require('fs');

// Source: https://github.com/vvo/tzdb/blob/main/raw-time-zones.json
const rawTimezones = require('./raw-time-zones.json');

const runGenerator = async () => {
  // Get all time zone names in Intl database
  const timezoneNames = Intl.supportedValuesOf('timeZone');

  // Generate 12 UTC dates for each month
  // This is to get all offsets for a time zone name - including its daylight saving
  const timeUTCNow = luxon.DateTime.fromISO('2000-01-01T06:00:00.000Z', {
    setZone: 'utc',
  });
  const timeUTCList = Array(12)
    .fill(null)
    .map((_, i) => timeUTCNow.plus({ months: i }));

  // This contains a map of offsets as keys and array of time zone names
  // with their corresponding alternative names as values
  const offsetData = timezoneNames.reduce((offsetMap, zoneName) => {
    const currentZone = luxon.IANAZone.create(zoneName);

    if (!currentZone.isValid) return offsetMap; // luxon can't find zone name

    let offsetValue;

    // Iterate over 12 months of UTC and calculate every possible offset for a zone
    timeUTCList.forEach((timeUTC) => {
      const newOffset = currentZone.offset(timeUTC);

      // No need to process the same offset value
      if (offsetValue !== newOffset) {
        offsetValue = newOffset;

        // Get long offset name and short offset name and put them together
        // Eg long offset: Central European Standard Time
        // Eg short offset: GMT+1
        const alternativeNameLong = currentZone.offsetName(timeUTC, {
          format: 'long',
          locale: 'en-US',
        });
        const alternativeNameShort = currentZone.offsetName(timeUTC, {
          format: 'short',
          locale: 'en-US',
        });
        const alternativeName = `${alternativeNameLong} (${alternativeNameShort})`;

        offsetMap.has(offsetValue)
          ? offsetMap.get(offsetValue).push([zoneName, alternativeName])
          : offsetMap.set(offsetValue, [[zoneName, alternativeName]]);
      }
    });

    return offsetMap;
  }, new Map());

  // Initialize zone name locations container map
  // This will be used when users use city or country to search for time zone
  const zoneNameLocations = new Map(
    timezoneNames.map((zoneName) => [zoneName, {}])
  );

  for (const { name, countryName, mainCities } of rawTimezones) {
    zoneNameLocations.set(name, [countryName, ...mainCities]);
  }

  // Write the aggregated data to public folder so it can be sent to client side code
  const filePath = path.join(__dirname, 'timezoneData.json');
  const timezoneData = JSON.stringify({
    offsetData: Object.fromEntries(offsetData.entries()),
    zoneNameData: Object.fromEntries(zoneNameLocations.entries()),
  });

  fs.writeFile(filePath, timezoneData, (err) => {
    if (err) console.error(err.message);
  });
};

runGenerator().catch((err = console.error(err)));
