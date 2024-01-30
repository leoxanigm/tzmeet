class Timezone {
  #format = '12';
  #timeNow = null;

  constructor({ offsetData, zoneNameData }) {
    this.#updateTime();
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

  set format(format) {
    format == '24' ? (this.#format = '24') : (this.#format = '12');
  }

  get format() {
    return this.#format;
  }

  get zone() {
    return this.#timeNow.zoneName;
  }

  #updateTime() {
    this.#timeNow = luxon.DateTime.now();
  }

  setZone(zoneName) {
    this.#timeNow = luxon.Settings.defaultZone = zoneName;
  }

  searchLocation(searchTerm) {}
}

document.addEventListener('DOMContentLoaded', () => {
  const TZ = new Timezone(timezoneData); // timezoneData is loaded in a script tag

  // Update time display every half second
  setInterval(() => updateTimeDisplay(TZ), 500);

  getNodes('input[name="time-format"]').forEach((radio) => {
    radio.addEventListener('change', (e) => modifyFormat(e, TZ));
  });

  // const timeModifyBtns = getNodes('.time-modify-btn');
  // timeModifyBtns.forEach((btn) =>
  //   btn.addEventListener('click', (e) => modifyTime(e, TZ))
  // );

  //   const timezoneConfig = new Timezone();
  //   console.log(timezoneConfig.timezoneData.offsetData['-660'][0])
});

function updateTimeDisplay(TZ) {
  // Get time display elements
  const hour = getNodes('.time-now .hour');
  const minute = getNodes('.time-now .minute');
  const meridiem = getNodes('.time-now .meridiem');
  const secondTicker = getNodes('.time-now .second');
  const formatToggle = getNodes('.time-format-toggle');

  let newTimeNow = TZ.time;

  // Change time display based on format
  if (TZ.format === '24') {
    // Hide am/pm toggle
    meridiem.style.visibility = 'hidden';

    // Set time
    [hour.textContent, minute.textContent] = newTimeNow.split(':');

    formatToggle.querySelector('[value="24"]').checked = true;
  } else {
    // Show am/pm toggle
    meridiem.style.visibility = 'visible';

    // Toggle am/pm
    const amOrPm = newTimeNow.slice(-2);
    newTimeNow = newTimeNow.slice(0, -3);
    meridiem.textContent = amOrPm;
    [hour.textContent, minute.textContent] = newTimeNow.split(':');

    formatToggle.querySelector('[value="12"]').checked = true;
  }

  secondTicker.classList.contains('hide')
    ? secondTicker.classList.remove('hide')
    : secondTicker.classList.add('hide');
}

function modifyFormat(e, TZ) {
  TZ.format = e.target.value;
  updateTimeDisplay(TZ);
}
