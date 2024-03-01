const { getNodes, sendScheduleData, showAlert } = require('./helpers');

class CalendarForm {
  #errors = {
    missingField: (type) => `Please enter ${type}`,
    wrongFormat: (type) =>
      `${type} can only contain letters and numbers, and must be more than 3 characters long.`,
  };
  #reLetterOrNum = /^(?!\s)[a-zA-Z0-9\p{L}\s]{3,}(?<!\s)$/u;

  constructor(formData, slotSelections, formType, meetingCode = null) {
    this.formData = formData;

    this.formData.append('meeting-code', meetingCode || '');
    this.formData.append(
      'duration',
      this.formData.get(`duration-${this.formData.get('display')}`)
    );
    this.formData.delete('duration-week');
    this.formData.delete('duration-month');

    this.slotSelections = slotSelections || [];
    this.formType = formType; // start-schedule or join-schedule
    this.error = null;
  }

  validateSubmit() {
    return new Promise((resolve, reject) => {
      try {
        const validated = this.#validateForm();
        const url =
          this.formType === 'start-schedule'
            ? '/start-schedule'
            : '/join-schedule';
        sendScheduleData(url, this.#scheduleDataJSON())
          .then((data) => resolve(data))
          .catch(() => reject(this.error));
      } catch (e) {
        console.log('Error - validateSubmit():', e.message);
        reject(this.error);
      }
    });
  }

  #scheduleDataJSON() {
    const scheduleData = {
      zone: this.formData.get('zone-name'),
      name: this.formData.get('name'),
      selections: this.slotSelections,
    };

    if (this.formType === 'start-schedule') {
      scheduleData.title = this.formData.get('title');
      scheduleData.password = this.formData.get('password') || null;
      scheduleData.display = this.formData.get('display');
      scheduleData.duration = this.formData.get('duration');
    } else if (this.formType === 'join-schedule') {
      scheduleData.meetingCode = this.formData.get('meeting-code');
    }

    return JSON.stringify(scheduleData);
  }

  #checkExistsInForm(fieldName, errorMessage) {
    if (!this.formData.get(fieldName)) {
      throw new Error(this.#errors.missingField(errorMessage));
    }
    return;
  }

  #checkFieldValue(fieldName, regex, errorMessage) {
    if (!regex.test(this.formData.get(fieldName).trim())) {
      throw new Error(this.#errors.wrongFormat(errorMessage));
    }
    return;
  }

  #validateForm() {
    try {
      // Check if the form fields are empty
      this.#checkExistsInForm(
        'zone-name',
        'your time zone. Can be found by searching your city or country.'
      );
      this.#checkExistsInForm('name', 'your name.');

      if (!this.slotSelections.length) {
        throw new Error(this.#errors.missingField('at least one time slot.'));
      }

      if (this.formType === 'start-schedule') {
        this.#checkExistsInForm('title', 'a meeting title.');
        this.#checkExistsInForm('duration', 'duration of the meeting.');
        this.#checkExistsInForm('display', 'week or month view.');
      }

      if (this.formType === 'join-schedule') {
        this.#checkExistsInForm('meeting-code', 'the meeting code.');
      }

      // Check if the form fields contain appropriate values
      this.#checkFieldValue('name', this.#reLetterOrNum, 'Your name');
      this.formData.get('title') &&
        this.#checkFieldValue('title', this.#reLetterOrNum, 'Meeting title');
      this.formData.get('password') &&
        this.#checkFieldValue('password', this.#reLetterOrNum, 'Password');
    } catch (error) {
      this.error = error.message;
      throw error;
    }
    return true;
  }
}

module.exports = initCalendarForm = (calendar, meetingCode = null) => {
  const calForm = getNodes('#calendar-form');
  calForm &&
    calForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(calForm);
      const formType = calForm.getAttribute('data-form-type');
      const formSubmission = new CalendarForm(
        formData,
        calendar && calendar.getSelections(),
        formType,
        meetingCode
      );
      formSubmission
        .validateSubmit()
        .then((data) => {
          if (data.meetingCode) {
            window.location.href = `/meeting?meetingCode=${data.meetingCode}&showMatching=1`;
          }
        })
        .catch((err) => {
          showAlert(err, 'danger');
        });
    });
};
