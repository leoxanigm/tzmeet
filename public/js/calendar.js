class Calendar {
  #display = 'month';
  #duration = '60';
  #timezone = null;
  #calStart = null;
  #currWeek = null;
  #currMonth = null;

  constructor(TZ) {
    this.#timezone = TZ;
    this.init();
  }

  init() {
    // Show placeholder while calendar is being loaded
    getNodes('#cal-placeholder').style.display = 'block';

    this.#display = getFromLocalStorage('display') || this.#display;
    this.#duration = getFromLocalStorage('duration') || this.#duration;

    // This will give the date of the start of the week (Monday)
    this.#calStart = this.#timezone.timeObj
      .startOf(this.#display)
      .startOf('week');

    this.#currWeek = this.#timezone.timeObj.weekNumber;
    this.#currMonth = this.#timezone.timeObj.month;

    const calHeader = getNodes('#calendar-header');
    const calBody = getNodes('#calendar-body');

    calHeader.innerHTML = '';
    calBody.innerHTML = '';

    // TODO
    // Fix display of calendar

    drawCalendar(calHeader, calBody, this.#timezone, this.#calStart, this.#display);

    // this.initCalHeader();

    // if (this.#display === 'week') {
    //   this.initWeekCalBody();
    //   this.initWeekCalHover();
    // } else {
    //   this.initMonthCalBody();
    // }

    // Hide placeholder after calendar is loaded
    getNodes('#cal-placeholder').style.display = 'none';
  }

  set display(value) {
    this.#display = value;
    saveToLocalStorage('display', value);
  }

  get display() {
    return this.#display;
  }

  set duration(value) {
    this.#duration = value;
    saveToLocalStorage('duration', value);
  }

  get duration() {
    return this.#duration;
  }

  initCalHeader() {
    const calHeader = getNodes('#calendar-header');

    if (this.#display === 'week') {
      const hoursNode = document.createElement('div');
      hoursNode.classList.add('calendar-header-item', 'col', 'hour-labels');
      calHeader.appendChild(hoursNode);
    }

    // Add days (name and number) to calendar header
    let startDay = this.#timezone.timeObj.startOf('week').startOf('day');
    for (let i = 0; i < 7; i++) {
      const dayNode = document.createElement('div');
      dayNode.classList.add('col', 'day');
      if (
        startDay.toFormat('yyyy-MM-dd') ===
        this.#timezone.timeObj.toFormat('yyyy-MM-dd')
      ) {
        dayNode.classList.add('current-day');
      }
      dayNode.innerHTML = `<span class="day-name">${startDay.toFormat(
        'ccc'
      )}</span>`;
      if (this.#display === 'week') {
        dayNode.innerHTML += `<span class="day-number">${startDay.day}</span>`;
      }
      calHeader.appendChild(dayNode);
      startDay = startDay.plus({ days: 1 });
    }
  }

  initWeekCalBody() {
    const hourFormat = this.#timezone.format === '24' ? 'HH:mm' : 'hh:mm a';
    const dayStart = luxon.DateTime.fromObject({ hour: 0 });

    const calBody = getNodes('#calendar-body');
    const hourContainer = document.createElement('div');
    hourContainer.className = 'hours';

    // Add 24 hour rows to calendar body
    for (let i = 0; i < 24; i++) {
      const hourNode = document.createElement('div');
      hourNode.classList.add('hour');

      if (this.#timezone.timeObj.toFormat('H') === i.toString()) {
        hourNode.classList.add('current-hour');
      }

      hourNode.textContent = dayStart.plus({ hours: i }).toFormat(hourFormat);

      hourContainer.appendChild(hourNode);
    }
    calBody.appendChild(hourContainer);

    const divisionsContainer = document.createElement('div');
    divisionsContainer.className = 'divisions';
    calBody.appendChild(divisionsContainer);
  }

  initWeekCalHover() {
    // Get width of day columns
    const container = document.querySelector('#calendar-body .divisions');

    this.#duration = '10';

    // Get the number of columns and rows sub-divisions of each hour for each duration
    const division_factor = {
      4: { cols: 3, rows: 2 }, // Month display, 4 hrs
      8: { cols: 3, rows: 1 }, // Month display, 8 hrs
      'all-day': { cols: 1, rows: 1 }, // Month display, all day
      60: { cols: 7, rows: 24 }, // Week display, 60 mins
      30: { cols: 14, rows: 24 }, // Week display, 30 mins
      15: { cols: 14, rows: 48 }, // Week display, 15 mins
      10: { cols: 21, rows: 48 }, // Week display, 10 mins
    };

    let { width: hoverWidth, height: hoverHeight } =
      container.getBoundingClientRect();

    hoverWidth /= division_factor[this.#duration].cols;
    hoverHeight /= division_factor[this.#duration].rows;

    const hoverDivs = [];

    const options = {
      container,
      events: ['hover', 'click'],
      subdivision: division_factor[this.#duration],
      outputFunction: (x, y, event) => {
        // Draw a hover rectangle based on the x and y coordinates, and remove
        // drawn rectangles if x and y are different from the previous x and y.
        if (event === 'hover') {
          hoverDivs.forEach((div) => div.remove());
          hoverDivs.length = 0;
          const hoverDiv = document.createElement('div');
          hoverDiv.className = 'hover-div';
          hoverDiv.style.left = `${x}px`;
          hoverDiv.style.top = `${y}px`;
          hoverDiv.style.width = `${hoverWidth}px`;
          hoverDiv.style.height = `${hoverHeight}px`;
          container.appendChild(hoverDiv);
          hoverDivs.push(hoverDiv);
        }
      },
    };
    const mouseToPos = new MouseToPos(options);
  }

  initMonthCalBody() {
    let monthStart = this.#calStart;
    const calBody = getNodes('#calendar-body');
    calBody.classList.add('month');
    const calHeader = getNodes('#calendar-header');
    calHeader.classList.add('month');

    // Add 6 rows of 7 days to calendar body
    for (let i = 0; i < 6; i++) {
      const rowNode = document.createElement('div');
      rowNode.classList.add('row', 'week');

      for (let j = 0; j < 7; j++) {
        const dayNode = document.createElement('div');
        dayNode.classList.add('day', 'col');

        if (monthStart.month !== this.#currMonth) {
          dayNode.classList.add('not-current-month');
        } else if (
          monthStart.toFormat('yyyy-MM-dd') ===
          this.#timezone.timeObj.toFormat('yyyy-MM-dd')
        ) {
          dayNode.classList.add('current-day');
        }

        const dateDiv = document.createElement('div');
        dateDiv.classList.add('date');
        dateDiv.textContent = monthStart.day;
        
        const divisionsContainer = document.createElement('div');
        divisionsContainer.className = 'divisions';
        
        dayNode.appendChild(dateDiv);
        dayNode.appendChild(divisionsContainer);
        rowNode.appendChild(dayNode);

        monthStart = monthStart.plus({ days: 1 });
      }
      calBody.appendChild(rowNode);
    }
  }
}

function initCalendar(TZ) {
  const calendar = new Calendar(TZ);
}
