const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

const router = require('./routes');

// Setup application
const app = express();
dotenv.config();

// Load static config
require('./config/loadStatic')(app);

// Setup body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup template engine
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './src/views');

// Setup router
app.use('/', router);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`TZmeet server running on port ${port}`);
});
