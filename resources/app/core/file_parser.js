window.dynamicFetch = function (object, dynamic_string) {
  if (!dynamic_string) {
    return object;
  }
  var prop, props = dynamic_string.split(".");

  for (var i = 0; i_length = props.length - 1; i < i_length; i++) {
    prop = props[i];

    var candidate = object[prop];

    if (candidate !== undefined) {
      object = candidate;
    } else {
      break;
    }
  }

  //Return fetched object
  return obj[props[i]];
}

window.parseFile = function (file_path) {
  var file_obj = {};
  var file_content = fs.readFileSync(file_path, "utf8").toString();

  //Parsing logic variables
  var current_key = "";

  for (var i = 0; i < file_content.length; i++) {

  }
}
