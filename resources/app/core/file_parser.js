window.dynamicFetch = function (object, dynamic_string) {
  if (!dynamic_string) {
    return object;
  }
  var prop, props = dynamic_string.split(".");

  for (var i = 0, i_length = props.length - 1; i < i_length; i++) {
    prop = props[i];

    var candidate = object[prop];

    if (candidate !== undefined) {
      object = candidate;
    } else {
      break;
    }
  }

  //Return fetched object
  return object[props[i]];
}

window.parseFile = async function (file_path) {
  const file_content = fs.readFileSync(file_path, "utf8").toString();
  //parse file into JSON using jomini
  const out = parser.parseText(file_content);
  return out;
}
