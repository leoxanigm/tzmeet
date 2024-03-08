// Handlebars helpers
const hbs = require('handlebars');
module.exports = () => {
  hbs.registerHelper('loop', (context, options) => {
    if (typeof context === 'undefined') return;
    if (typeof context === 'number') {
      let ret = '';
      for (let i = 0; i < context; i++) {
        ret += options.fn();
      }
      return ret;
    }
    if (typeof context === 'string') {
      input = context.split(',').map((input) => input.trim());
      return input.map((val) => options.fn({ val })).join('');
    }
    return options.fn(this);
  });

  hbs.registerHelper('eq', (a, b, options) => {
    return a === b;
  });

  hbs.registerHelper('checked', (curr, target) => {
    return curr === target ? 'checked' : '';
  });

  hbs.registerHelper('currentYear', () => {
    return new Date().getFullYear();
  });
};
