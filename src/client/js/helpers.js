// Description: Helper functions for the client-side JavaScript

const luxon = require('luxon');
const { google, outlook, office365, ics } = require('calendar-link');

module.exports = {
  /**
   * Selects node(s) from the DOM
   * @param {string} selector
   * @returns Node or NodeList
   */
  getNodes: (selector) => {
    const nodes = document.querySelectorAll(selector);
    if (nodes.length === 0) {
      return null;
    }
    if (nodes.length === 1) {
      return nodes[0];
    }
    return nodes;
  },

  saveToLocalStorage: (key, value) => {
    localStorage.setItem(key, value);
  },

  getFromLocalStorage: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  /**
   * Appends a child to a parent with a fade-in effect
   * @param {HTMLElement} el
   * @param {HTMLElement} parent
   * @param {number} duration in milliseconds
   */
  animateAppend: (el, parent, duration) => {
    el.style.opacity = 0;
    parent.appendChild(el);
    window.requestAnimationFrame(() => {
      el.style.transition = `opacity ${duration}ms`;
      el.style.opacity = 1;
    });
  },

  /**
   * Removes an element with a fade-out effect
   * @param {HTMLElement} el
   * @param {number} duration in milliseconds
   */
  animateRemove: (el, duration) => {
    el.style.transition = `opacity ${duration}ms`;
    el.style.opacity = 0;
    setTimeout(() => {
      el.remove();
    }, duration);
  },

  /**
   * Creates a new element and appends it to a parent, adding text and classes
   * @param {HTMLElement} parent Parent element to append to
   * @param {string} tag Tag name of the new element
   * @param {string} text Text content of the new element
   * @param {Array[string]} classes Array of classes to add to the new element
   * @returns HTMLElement
   */
  createAppend: (parent, tag, text, classes) => {
    const el = document.createElement(tag);
    if (text) {
      el.textContent = text;
    }
    if (classes) {
      el.classList.add(...classes);
    }
    parent.appendChild(el);
    return el;
  },

  fetchSearchData: async () => {
    const response = await fetch('/search-data');
    const data = await response.json();
    return JSON.parse(data);
  },

  showAlert: (message, type) => {
    const alertPlaceholder = module.exports.getNodes('.alert-placeholder');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>',
    ].join('');

    alertPlaceholder.append(wrapper);
    window.scrollTo(0, 0);
    setTimeout(() => {
      wrapper.remove();
    }, 3000);
  },

  sendScheduleData: async (url, scheduleDataJSON) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: scheduleDataJSON,
    });
    return response.json();
  },

  copyToCiipBoard: async (selector) => {
    try {
      const meetingCodeEl = module.exports.getNodes(selector);
      if (meetingCodeEl instanceof NodeList) {
        meetingCodeEl.forEach((el) => {
          el.addEventListener('click', async () => {
            await navigator.clipboard.writeText(el.parentNode.innerText.trim());
          });
        });
      } else {
        meetingCodeEl &&
          meetingCodeEl.addEventListener('click', async () => {
            await navigator.clipboard.writeText(
              meetingCodeEl.parentNode.innerText.trim()
            );
          });
      }
    } catch (error) {
      console.error(error.message);
    }
  },

  shareToCalendar: (timeISO, title, duration, calendarType) => {
    durationUnit = [4, 8, 12].includes(duration) ? 'hour' : 'minute';

    const slot = {
      title,
      start: luxon.DateTime.fromISO(timeISO, { setZone: 'utc' }).toJSDate(),
      duration: [duration, durationUnit],
    };

    console.log(slot);

    switch (calendarType) {
      case 'google':
        return google(slot);
      case 'outlook':
        return outlook(slot);
      case 'office365':
        return office365(slot);
      case 'ics':
        return ics(slot);
      default:
        return null;
    }
  },
};
