/**
 * A central place to load static assets
 */

const express = require('express');
const path = require('path');
const fs = require('fs')

module.exports = app => {
  // Setup static assets
  app.use(
    '/',
    express.static(path.join(__dirname, '../../node_modules/bootstrap/dist/'))
  );
  app.use(
    '/font',
    express.static(path.join(__dirname, '../../node_modules/bootstrap-icons/font/'))
  );
  app.use('/', express.static(path.join(__dirname, '../../public')));
  app.use(
    '/js',
    express.static(path.join(__dirname, '../../node_modules/luxon/build/global/'))
  );
};
