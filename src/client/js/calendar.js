const {
  getNodes,
  saveToLocalStorage,
  getFromLocalStorage,
} = require('./helpers');
const { drawCalendar, drawDiv } = require('./drawToDOM');
const MouseToPos = require('./mousetopos');
const luxon = require('luxon');

class Calendar {
  #display = 'week';
  #duration = '60';
  #timezone = null;
  #weekNumber = null;
  #yearNumber = null;
  #selectedSlots = {};
  #selectionDivs = {}; // 'xy': div, where x and y are the coordinates of the div

  constructor(TZ, display = null, duration = null) {
    this.#timezone = TZ;
    this.#weekNumber = this.#timezone.timeObj.weekNumber;
    this.#yearNumber = this.#timezone.timeObj.weekYear;

    this.display = display || getFromLocalStorage('display') || this.#display;
    this.duration =
      duration || getFromLocalStorage('duration') || this.#duration;

    this.init();
  }

  init() {
    this.calStart =
      this.#display === 'week'
        ? this.#currWeek()
        : this.#currWeek().startOf('month').startOf('week');

    // Show placeholder while calendar is being loaded
    getNodes('#cal-placeholder').style.display = 'block';
    // Change duration selection options
    getNodes('.meeting-duration') &&
      getNodes('.meeting-duration').setAttribute('data-display', this.#display);
    // Change current time window
    getNodes('.cal-navigation .current-window') &&
      (getNodes('.cal-navigation .current-window').textContent =
        this.#currWindow());

    const calHeader = getNodes('#calendar-header');
    const calBody = getNodes('#calendar-body');

    calHeader.innerHTML = '';
    calBody.innerHTML = '';

    try {
      drawCalendar(
        calHeader,
        calBody,
        this.#timezone,
        this.calStart,
        this.#display
      );

      // Init calendar selection
      this.#initCalendarSelection();

      // Hide placeholder after calendar is loaded
      getNodes('#cal-placeholder').style.display = 'none';
    } catch (error) {
      calHeader.innerHTML = '';
      calBody.innerHTML = '';
      console.error('Error drawing calendar:', error);
    }
  }

  set display(value) {
    this.#display = value;

    // Reset selections
    this.#selectedSlots = [];
    this.#selectionDivs = {};

    saveToLocalStorage('display', value);
    this.init();
  }

  get display() {
    return this.#display;
  }

  set duration(value) {
    this.#duration = value;

    // Reset selections
    this.#selectedSlots = [];
    this.#selectionDivs = {};

    saveToLocalStorage('duration', value);
    this.init();
  }

  get duration() {
    return this.#duration;
  }

  /**
   * @returns {luxon.DateTime} The start of current week
   */
  #currWeek() {
    return luxon.DateTime.fromObject(
      {
        weekNumber: this.#weekNumber,
        weekYear: this.#yearNumber,
      },
      { locale: this.#timezone.locale }
    );
  }

  #currWindow() {
    if (this.#display === 'week') {
      return `${this.calStart.toFormat('MMM d')} - ${this.calStart
        .plus({ days: 6 })
        .toFormat('MMM d')}`;
    } else {
      return this.#currWeek().toFormat('MMMM yyyy');
    }
  }

  #checkSlotInObj(x, y, obj) {
    return `${x},${y},${this.calStart.toFormat('yyyyLLddHHmm')}` in obj;
  }

  #addSlotToObj(x, y, obj, data) {
    obj[`${x},${y},${this.calStart.toFormat('yyyyLLddHHmm')}`] = data;
    return true;
  }

  #removeSlotFromObj(x, y, obj) {
    if (
      typeof obj[`${x},${y},${this.calStart.toFormat('yyyyLLddHHmm')}`]
        .remove === 'function'
    ) {
      // Check if the target value is a DOM element
      obj[`${x},${y},${this.calStart.toFormat('yyyyLLddHHmm')}`].remove();
    }

    delete obj[`${x},${y},${this.calStart.toFormat('yyyyLLddHHmm')}`];
    return true;
  }

  #getSlotFromObj(x, y, obj) {
    return obj[`${x},${y},${this.calStart.toFormat('yyyyLLddHHmm')}`];
  }

  #redrawDivSlots() {
    for (let slot in this.#selectionDivs) {
      const [, , time] = slot.split(',');
      if (time === this.calStart.toFormat('yyyyLLddHHmm')) {
        getNodes('#calendar-body .divisions').appendChild(
          this.#selectionDivs[slot]
        );
      }
    }
  }

  changeTimeWindow(nav) {
    // Change the current time window based on the navigation button clicked
    const amount = nav === 'next' ? 1 : -1;
    let newWeek;
    if (this.#display === 'week') {
      newWeek = this.#currWeek().plus({ weeks: amount });
    } else {
      newWeek = this.#currWeek().plus({ months: amount });
    }
    this.#weekNumber = newWeek.weekNumber;
    this.#yearNumber = newWeek.weekYear;
    this.init();
  }

  #calculateSlotTime(x, y, division_factor, calStart) {
    // Calculate the time slot based on the x and y coordinates and calendar start
    if (this.#display === 'week') {
      // console.log(Math.floor(x / (60 / this.#duration) / division_factor.cols));
      const mainDivisionX = division_factor.cols / 7;
      const currDaySlot = Math.floor(Math.round(x) / mainDivisionX);
      const currMinuteSlot =
        (x - currDaySlot * mainDivisionX) * this.#duration +
        y * mainDivisionX * this.#duration;

      const slotStart = calStart.plus({
        days: currDaySlot,
        minutes: currMinuteSlot,
      });
      return slotStart;
    } else {
      const mainDivisionX = division_factor.cols / 7;
      const mainDivisionY = division_factor.rows / 6;
      const currDaySlot =
        Math.floor(Math.round(x) / mainDivisionX) +
        Math.floor(Math.round(y) / mainDivisionY) * 7;
      const currHourSlot =
        (x - Math.floor(Math.round(x) / mainDivisionX) * mainDivisionX) *
          this.#duration +
        (y - Math.floor(Math.round(y) / mainDivisionY) * mainDivisionY) *
          mainDivisionX *
          this.#duration;

      const slotStart = this.calStart.plus({
        days: currDaySlot,
        hours: currHourSlot,
      });

      return slotStart;
    }
  }

  /**
   * Draw a time slot div at the given coordinates and return time ISO string
   * @param {number} x
   * @param {number} y
   * @param {number} hoverWidth
   * @param {number} hoverHeight
   * @param {HTMLElement} container
   * @param {object} division_factor
   * @param {object} divObject
   * @param {string} divClass
   * @returns ISO time string
   */
  #drawTimeSlot(
    x,
    y,
    hoverWidth,
    hoverHeight,
    container,
    division_factor,
    divObject,
    divClassList
  ) {
    const slotTime = this.#calculateSlotTime(
      x / hoverWidth,
      y / hoverHeight,
      division_factor[this.#duration],
      this.calStart
    );

    const hourFormats = {
      12: luxon.DateTime.TIME_SIMPLE,
      24: luxon.DateTime.TIME_24_SIMPLE,
    };

    this.#addSlotToObj(
      x,
      y,
      divObject,
      drawDiv(
        container,
        x,
        y,
        hoverWidth,
        hoverHeight,
        divClassList,
        slotTime.toLocaleString(hourFormats[this.#timezone.format])
      )
    );

    return slotTime.toISO();
  }

  #initCalendarSelection() {
    // Redraw selected div slots for current time window
    this.#redrawDivSlots();

    // Get the number of columns and rows sub-divisions of each hour for each duration
    const division_factor = {
      4: { cols: 21, rows: 12 }, // Month display, 4 hrs
      8: { cols: 21, rows: 6 }, // Month display, 8 hrs
      12: { cols: 14, rows: 6 }, // Month display, 12 hrs
      10: { cols: 21, rows: 48 }, // Week display, 10 mins
      15: { cols: 14, rows: 48 }, // Week display, 15 mins
      30: { cols: 14, rows: 24 }, // Week display, 30 mins
      60: { cols: 7, rows: 24 }, // Week display, 60 mins
    };

    const hoverDivs = {}; // object to track hover divs

    // Get width of day columns
    const container = document.querySelector('#calendar-body .divisions');

    let { width: hoverWidth, height: hoverHeight } =
      container.getBoundingClientRect();

    hoverWidth /= division_factor[this.#duration].cols;
    hoverHeight /= division_factor[this.#duration].rows;

    const options = {
      container,
      events: ['hover', 'click'],
      subdivision: division_factor[this.#duration],
      outputFunction: (x, y, event) => {
        // Draw a hover rectangle based on the x and y coordinates, and remove
        // drawn rectangles if x and y are different from the previous x and y.

        // x = +x.toFixed(3); // Only keep 3 decimal places (might not round properly)
        // y = +y.toFixed(3);

        if (event === 'hover') {
          for (let div in hoverDivs) {
            hoverDivs[div].remove();
            delete hoverDivs[div];
          }

          const hoverClasses = this.#checkSlotInObj(x, y, this.#selectionDivs)
            ? ['hover-div', 'selected']
            : ['hover-div'];

          this.#drawTimeSlot(
            x,
            y,
            hoverWidth,
            hoverHeight,
            container,
            division_factor,
            hoverDivs,
            hoverClasses
          );
        } else if (event === 'click') {
          if (this.#checkSlotInObj(x, y, this.#selectionDivs)) {
            this.#removeSlotFromObj(x, y, this.#selectionDivs);
            this.#getSlotFromObj(x, y, hoverDivs).classList.remove('selected');
            this.#removeSlotFromObj(x, y, this.#selectedSlots);
            return;
          }

          const slotTime = this.#drawTimeSlot(
            x,
            y,
            hoverWidth,
            hoverHeight,
            container,
            division_factor,
            this.#selectionDivs,
            ['selected-div']
          );

          this.#addSlotToObj(x, y, this.#selectedSlots, slotTime);
        }
      },
    };
    const mouseToPos = new MouseToPos(options);
  }

  getSelections() {
    const selections = [];
    for (let slot in this.#selectedSlots) {
      // Convert ISO string to UTC string
      const UTCTime = luxon.DateTime.fromISO(this.#selectedSlots[slot])
        .toUTC()
        .toISO();
      selections.push(UTCTime);
    }
    return selections;
  }
}

/**
 * Get selected duration based on display
 * @param {string} display week or month
 * @returns {string} selected duration
 */
function getSelectedDuration(display) {
  return getNodes(`.${display} input[name^="duration"]:checked`).value;
}

module.exports = initCalendar = (TZ, display = null, duration = null) => {
  const calendar = new Calendar(TZ, display, duration);

  // Set up event listener for time format change
  getNodes('input[name="time-format"]').forEach((button) => {
    button.addEventListener('change', (e) => {
      if (calendar.display === 'week') {
        calendar.init();
      }
    });
  });

  // Set up event listeners for calendar controls
  !display &&
    getNodes('input[name="display"]').forEach((button) => {
      if (button.value === calendar.display) {
        button.checked = true;
      }
      button.addEventListener('click', (e) => {
        if (e.target.value !== calendar.display) {
          calendar.display = e.target.value;
          calendar.duration = getSelectedDuration(calendar.display);
        }
      });
    });

  // Set up event listeners for duration controls
  !duration &&
    getNodes('input[name^="duration"]').forEach((button) => {
      if (button.value === calendar.duration) {
        button.checked = true;
      }
      button.addEventListener('click', (e) => {
        calendar.duration = getSelectedDuration(calendar.display);
      });
    });

  // Set up event listeners for calendar navigation
  getNodes('.cal-navigation button[data-nav]').forEach((button) => {
    button.addEventListener('click', (e) => {
      calendar.changeTimeWindow(e.currentTarget.getAttribute('data-nav'));
    });
  });

  return calendar;
};
