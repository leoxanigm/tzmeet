const { showAlert, getNodes } = require('./helpers');

class JoinForm {
  constructor(formData) {
    this.formData = formData;
    if (!this.formData.has('meeting-code')) {
      this.formData.append(
        'meeting-code',
        new URLSearchParams(window.location.search).get('meetingCode')
      );
    }
  }

  activateSubmitButton = () => {
    const submitButton = getNodes('button[type="submit"]');
    submitButton.innerHTML = 'Join Schedule';
    submitButton.disabled = false;
  };

  disableSubmitButton = () => {
    const submitButton = getNodes('button[type="submit"]');
    submitButton.innerHTML =
      '<span class="spinner-border" role="status"></span>';
    submitButton.disabled = true;
  };

  showPasswordInput = () => {
    const passwordInput = getNodes('input[name="meeting-password"]');
    passwordInput.hidden = false;
    passwordInput.disabled = false;
    passwordInput.required = true;
    passwordInput.focus();
    passwordInput.value = '';
    this.activateSubmitButton();
  };

  submitForm = () => {
    const body = { meetingCode: this.formData.get('meeting-code') };
    this.disableSubmitButton();

    if (!body.meetingCode || body.meetingCode.length < 5) {
      showAlert('Invalid meeting code', 'danger');
      this.activateSubmitButton();
      return;
    }

    if (this.formData.has('meeting-password')) {
      body.password = this.formData.get('meeting-password');
      if (!body.password) {
        showAlert('Password required', 'danger');
        this.activateSubmitButton();
        return;
      }
    }

    fetch('/join-schedule-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.alert) {
          showAlert(data.alert.message, data.alert.type);
          this.activateSubmitButton();
        } else if (!data.success) {
          if (
            data.message === 'password required' &&
            !this.formData.has('meeting-password')
          ) {
            this.requiresPassword = true;
            this.showPasswordInput();
          } else {
            showAlert(data.message, 'danger');
            this.activateSubmitButton();
          }
        } else if (data.success) {
          window.location.href = `/meeting?meetingCode=${body.meetingCode}&password=${body.password}`;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
}

module.exports = initJoinForm = () => {
  const form = getNodes('.join-schedule-form');
  form &&
    form.addEventListener('submit', (e) => {
      const joinForm = new JoinForm(new FormData(form));
      e.preventDefault();
      joinForm.submitForm();
    });
};
