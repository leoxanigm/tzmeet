const getNodes = (selector) => {
  const nodes = document.querySelectorAll(selector);
  if (nodes.length === 0) {
    return null;
  }
  if (nodes.length === 1) {
    return nodes[0];
  }
  return nodes;
};

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

const getFromLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

/**
 * Appends a child to a parent with a fade-in effect
 * @param {HTMLElement} el
 * @param {HTMLElement} parent
 * @param {number} duration in milliseconds
 */
const animateAppend = (el, parent, duration) => {
  el.style.opacity = 0;
  parent.appendChild(el);
  window.requestAnimationFrame(() => {
    el.style.transition = `opacity ${duration}ms`;
    el.style.opacity = 1;
  });
};

/**
 * Removes an element with a fade-out effect
 * @param {HTMLElement} el
 * @param {number} duration in milliseconds
 */
const animateRemove = (el, duration) => {
  el.style.transition = `opacity ${duration}ms`;
  el.style.opacity = 0;
  setTimeout(() => {
    el.remove();
  }, duration);
};
