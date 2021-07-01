window.csv_to_array = function (data, delimeter) {
  // Retrieve the delimeter
  if (delimeter == undefined) {
    delimeter = ',';
  }
  if (delimeter && delimeter.length > 1) {
    delimeter = ',';
  }

  //Variable initialisation
  var newline = '\n';
  var eof = ''; //End of file
  var i, row, column = 0;
  var c = data.charAt(i);
  var local_array = [];

  while (c != eof) {
    //Skip whitespaces
    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i);
    }

    //Fetch value
    var value = "";
    if (c == '\"') {
      //If values are enclosed in double-quotes
      c = data.charAt(++i);

      while (c != eof && c != '\"') {
        if (c != '\"') {
          //Increment until a delimiter is hit
          value += c;
          c = data.charAt(++i);
        }

        if (c == '\"') {
          var cnext = data.charAt(i + 1);
          if (cnext == '\"') {
            value += '\"';
            i += 2;
            c = data.charAt(i);
          }
        }
      }

      if (c == eof) {
        throw "Unexpected end of data, double-quote expected";
      }

      c = data.charAt(++i);
    } else {
      while (c != eof && c != delimeter && c!= newline && c != ' ' && c != '\t' && c != '\r') {
        value += c;
        c = data.charAt(++i);
      }
    }

    if (local_array.length <= row) {
      local_array.push([]);
    }
    local_array[row].push(value);

    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i);
    }

    if (c == delimeter) {
      column++;
    } else if (c == newline) {
      column = 0;
      row++;
    } else if (c != eof) {
      throw "Delimiter expected after character " + i;
    }

    c = data.charAt(++i);
  }

  return local_array;
}
