//
// To Do
// - Change that users can only search and change time zone


class Timezone {
  #format = '24';
  #timeNow = luxon.DateTime.now();

  constructor({ offsetData, zoneNameData }) {
    this.offset = this.#timeNow.offset; // store current offset
    this.zoneName = this.#timeNow.zoneName;

    // imported json data (script tag)
    this.offsetData = offsetData;
    this.zoneNameData = zoneNameData;
  }

  /**
   * Get current time in 24h or 12h format
   * @returns {string} current time
   */
  get time() {
    const format = this.#format == '24' ? 'HH:mm' : 'hh:mm a';
    return this.#timeNow.toFormat(format);
  }

  /**
   * Set current time specified by user
   * @param {string} time of format 'HH:mm' or 'hh:mm a'
   */
  set time(time) {
    // Detect if time is in 24h or 12h format
    const format =
      time.includes('AM') || time.includes('PM') ? 'hh:mm a' : 'HH:mm';

    // Convert time to luxon DateTime object
    this.#timeNow = luxon.DateTime.fromFormat(time, format);

    this.#calculateOffset();
  }

  /**
   * Set current time format
   * @param {string} format - '24' or '12'
   */
  set format(format) {
    format == '24' ? (this.#format = '24') : (this.#format = '12');
  }

  get format() {
    return this.#format;
  }

  #calculateOffset() {
    // Special case for 45 minute offsets
    const offset45 = [345, 525, 825, 765];

    // calculate new offset based on current time
    const milliseconds = this.#timeNow - luxon.DateTime.utc();
    let offsetMinutes = milliseconds / 1000 / 60;

    if (!offset45.includes(offsetMinutes)) {
      offsetMinutes = Math.round(offsetMinutes / 30) * 30; // round to nearest multiple of 30

      // Luxon only lets you set offset from current time zone. Hence, we need to
      // add the current offset and then set the new time zone
      offsetMinutes += this.offset;

      // If offset is not in the data, find the nearest offset
      while (this.offsetData[offsetMinutes] == undefined) {
        offsetMinutes += 5;
      }
    }
    this.offset = offsetMinutes;
  }

  #changeTimeZone() {
    // change time zone
    this.timeNow = this.timeNow.setZone(this.zoneName);
  }

  #getZoneNameFromOffset() {
    // get zone name from offset
    this.zoneName = this.timezoneData[this.offset];
  }

  searchLocation(searchTerm) {}
}

document.addEventListener('DOMContentLoaded', () => {
  const TZ = new Timezone(timezoneData); // timezoneData is loaded in a script tag

  // Change display time and time zone on first load
  updateTimeDisplay(TZ);

  const timeModifyBtns = getNodes('.time-modify-btn');
  timeModifyBtns.forEach((btn) =>
    btn.addEventListener('click', (e) => modifyTime(e, TZ))
  );

  //   const timezoneConfig = new Timezone();
  //   console.log(timezoneConfig.timezoneData.offsetData['-660'][0])
});

function modifyTime(e, TZ) {
  e.stopImmediatePropagation();

  let value = e.currentTarget.dataset.value;
  let type = e.currentTarget.dataset.type;

  // Change time format
  if (type === 'format') {
    TZ.format = value;
    updateTimeDisplay(TZ);
    return;
  }

  if (type === 'hour' || type === 'minute' || type === 'meridiem') {
    // Get current time
    let newTimeNow = TZ.time;
    const format = TZ.format;

    // Change time based on type
    if (type === 'hour') {
      let hour = parseInt(newTimeNow.slice(0, 2));
      hour += parseInt(value);
      hour = ((hour + parseInt(format)) % parseInt(format)) + '';
      hour = hour < 10 ? `0${hour}` : hour;
      newTimeNow = newTimeNow.replace(/^[0-9]{2}/, hour);
    } else if (type === 'minute') {
      let minute = parseInt(newTimeNow.slice(3, 5));
      minute += parseInt(value);
      minute = ((minute + 60) % 60) + '';
      minute = minute < 10 ? `0${minute}` : minute;
      newTimeNow = newTimeNow.replace(/:[0-9]{2}/, `:${minute}`);
    } else if (type === 'meridiem' && TZ.format === '12') {
      newTimeNow = newTimeNow.replace(/ AM| PM/g, '');
      newTimeNow += ` ${value}`;
    }

    TZ.time = newTimeNow;

    // Finally change display time
    // updateTimeDisplay(TZ);
  }

  // // Modify time based on type
  // TZ.setTime(value, type);

  // // Finally change display time
  // updateTimeDisplay(timeInput.value);
}

function updateTimeDisplay(TZ) {
  // Get time display elements
  const hourInput = getNodes('#hour-input');
  const minuteInput = getNodes('#minute-input');
  const amInput = getNodes('#time-am');
  const pmInput = getNodes('#time-pm');
  const format24Input = getNodes('#time-format-24');
  const format12Input = getNodes('#time-format-12');

  let newTimeNow = TZ.time;

  // Change time display based on format

  if (TZ.format === '24') {
    // Hide am/pm toggle
    getNodes('.am-pm-container').style.display = 'none';

    // Set time
    [hourInput.value, minuteInput.value] = newTimeNow.split(':');

    format24Input.checked = true;
  } else {
    // Show am/pm toggle
    getNodes('.am-pm-container').style.display = 'inline-flex';

    // Toggle am/pm
    const amOrPm = newTimeNow.slice(-2);
    amInput.checked = true ? amOrPm == 'AM' : false;
    pmInput.checked = true ? amOrPm == 'PM' : false;

    newTimeNow = newTimeNow.replace(/ AM| PM/g, '');
    [hourInput.value, minuteInput.value] = newTimeNow.split(':');

    format12Input.checked = true;
  }
}