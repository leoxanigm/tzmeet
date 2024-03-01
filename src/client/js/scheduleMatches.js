// Fetches and displays the schedule of matches for the provided meeting code.

const { getNodes, shareToCalendar } = require('./helpers');
const luxon = require('luxon');

// time.toFormat('yyyyMMdd') + time.toFormat('HHmmss')

const fetchMatches = async (meetingCode) => {
  let matches = [];

  await fetch(`/schedule-match?meetingCode=${meetingCode}`)
    .then((res) => res.json())
    .then((data) => (matches = data));

  // Sort matches by number of participants
  return matches.sort(
    (slot1, slot2) => slot2.participants.length - slot1.participants.length
  );
};

const UTCtoLocal = (timeUTC, duration, hourFormat) => {
  const time = luxon.DateTime.fromISO(timeUTC);
  const durationUnit = [4, 8, 12].includes(duration) ? 'hours' : 'minutes';

  hourFormat = hourFormat === '12' ? 'h:mm a' : 'HH:mm';

  return {
    dateMonth: time.toLocaleString({ month: 'short', day: 'numeric' }),
    day: time.toLocaleString({ weekday: 'short' }),
    start: time.toFormat(hourFormat),
    end: time.plus({ [durationUnit]: duration }).toFormat(hourFormat),
  };
};

const availabilityCountNames = (participants) => {
  const availabilityInfo = participants.reduce((countObj, participant) => {
    if (countObj.count) {
      countObj.count++;
      if (countObj.count < 3) {
        countObj.names += `, ${participant}`;
      }
    } else {
      countObj.count = 1;
      countObj.names = participant;
    }
    return countObj;
  }, {});

  if (availabilityInfo.count > 2) {
    availabilityInfo.names += ` and ${availabilityInfo.count - 2} others`;
  }

  return availabilityInfo;
};

const displayMatches = (matches, duration, hourFormat) => {
  const matchesContainer = getNodes('#schedule-matches-container');

  let matchesTable = `
    <table class="schedule-matches table">
      <thead>
        <tr>
          <th scope="col">Save</th>
          <th scope="col">Selected Time</th>
          <th scope="col">
            Availability
            <div class="help-text">
              Number of participants that prefer this time slot
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
  `;

  matches.forEach((match) => {
    const { dateMonth, day, start, end } = UTCtoLocal(
      match.time,
      duration,
      hourFormat
    );

    const { count, names } = availabilityCountNames(match.participants);

    matchesTable += `
      <tr>
        <td>
          <input type="radio" name="time-slot" value="${match.time}"/>
        </td>
        <td>
          <div class="day">
            <span class="date-month">${dateMonth}</span>
            <span class="day-name">${day}</span>
          </div>
          <div class="time">${start}-${end}</div>
        </td>
        <td class="availabilities">
          <span class="count">${count}</span>
          <span class="participants">${names}</span>
        </td>
      </tr>
    `;
  });

  matchesTable += `
      </tbody>
    </table>
  `;
  matchesContainer.innerHTML = matchesTable;
};

module.exports = showScheduleMatches = async (
  meetingCode,
  title,
  duration,
  hourFormat
) => {
  const matches = await fetchMatches(meetingCode);
  displayMatches(matches, duration, hourFormat);

  // Add event listener to save time slot
  getNodes('input[type="radio"][name="time-slot"]').forEach((slotSelector) => {
    slotSelector.addEventListener('click', (e) => {
      if (e.currentTarget.checked) {
        getNodes('.export-calendar-container .btn').forEach((exportBtn) => {
          exportBtn.href = shareToCalendar(
            slotSelector.value,
            title,
            duration,
            exportBtn.dataset.type
          );
        });
      }
    });
  });

  console.log(shareToCalendar(matches[0].time, title, duration, 'ics'));
};
