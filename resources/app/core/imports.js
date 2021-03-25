const fs = require('fs');
const Jomini = require('jomini');
const path = require('path');

async function importJomini () {
  parser = await Jomini.Jomini.initialize();
}
importJomini();
