var provinceArray = [];
var stateArray = [];

selectedProvince = 0;
var zoomLevel = 1;
var map_mode = "provinces";

{
  //Provinces
  province_data = {};

  //States
  state_count = 0;
  state_colors = [];

  colors = [];

  //Defines
  colors_amount = 23000;
  rounded_provinces = 13200;
  map_width = 5616;
  map_height = 2048;

  //Loading
  water_rendering_done = false;
  state_rendering_done = false;
} //Variables

for (var i = 0; i < colors_amount; i++) {
  state_colors.push([getRandom(0,255), getRandom(0,255), getRandom(0,255)]);
}
function getRandom (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function redraw () { //Initialise Canvas element
  c = document.getElementById("map-canvas");
  ctx = c.getContext("2d");
  d = document.getElementById("map-canvas-2");
  dtx = d.getContext("2d");
  e = document.getElementById("map-canvas-3");
  etx = e.getContext("2d");

  img = document.getElementById("provinces_bmp");
  provinces = [];
  ctx.drawImage(img, 0, 0, img.width, img.height);
  dtx.drawImage(img, 0, 0, img.width, img.height);
  etx.drawImage(img, 0, 0, img.width, img.height);

  image_data = ctx.getImageData(0, 0, img.width, img.height);

  function getCursorPosition(c, event) {
    var panY  = window.pageYOffset || document.documentElement.scrollTop,
      panX = window.pageXOffset || document.documentElement.scrollLeft;
    const rect = c.getBoundingClientRect();
    const x = ((event.clientX)*(img.width/c.offsetWidth))+(panX/zoomLevel);
    const y = ((event.clientY)*(img.width/c.offsetWidth))+(panY/zoomLevel);
    return [x,y];
    console.log(y);
  }

  function replace_color (colour1, colour2) {
    for (var x = 0; x < image_data.data.length; x+=4) {
      if (image_data.data[x] == colour1[0] && image_data.data[x+1] == colour1[1] && image_data.data[x+2] == colour1[2]) {
        image_data.data[x] = colour2[0];
        image_data.data[x+1] = colour2[1];
        image_data.data[x+2] = colour2[2];
      }
    }
  }

  c.addEventListener('click', function(e) {
    //if (state_rendering_done && water_rendering_done) {
      mouse_coordinates = getCursorPosition(c, e);
      var coordinate_data = etx.getImageData(mouse_coordinates[0], mouse_coordinates[1], 1, 1);
      console.log(coordinate_data);
      console.log("x: " + mouse_coordinates[0] + " y: " + mouse_coordinates[1]);
      for (var i = 0; i < definition.length; i++) {
        if (coordinate_data.data[0] == parseInt(definition[i][1]) && coordinate_data.data[1] == parseInt(definition[i][2]) && coordinate_data.data[2] == parseInt(definition[i][3])) {
          if (province_data[i] != undefined) {
            selectedProvince = definition[i][0];
            var currentProvince = definition[i][0];
            var province_color = [parseInt(definition[i][1]), parseInt(definition[i][2]), parseInt(definition[i][3])];
            var currentState = province_data[i][1];
            var stateColour = state_colors[currentState];
            console.log("You have clicked on Province " + selectedProvince + "\nState: " + currentState);

            if (map_mode == "provinces") {
              replace_color(province_color, [255, 255, 255]);
              dtx.putImageData(image_data, 0, 0);

              setTimeout(function(){
                replace_color([255, 255, 255], province_color);
                dtx.putImageData(image_data, 0, 0);
              },100);
            } else if (map_mode == "states") {
              replace_color(stateColour, [255, 255, 255]);
              dtx.putImageData(image_data, 0, 0);

              setTimeout(function(){
                replace_color([255, 255, 255], stateColour);
                dtx.putImageData(image_data, 0, 0);
              },100);
            }
          }

          reload();
        }
      }
    //}
  });

  var fs = require('fs');

  try {
    definition = fs.readFileSync("./resources/app/map/definition.csv", "utf8");
    definition = window.csv_to_array(definition.toString(), ";");
  } catch(e) {
    console.log('Error:', e.stack);
  }

  zoom(1); //Call in case the map is not vanilla.

  {
    rounded_provinces = Math.ceil(definition.length/100)*100;
    province_state_count = 0;
    var x = 0;

    setInterval(function(){
      if (definition[province_state_count] != undefined) {
        if (definition[province_state_count][6] != "ocean" && definition[province_state_count][6] != "lakes" && province_data[province_state_count] != undefined) {
          replace_color([parseInt(definition[province_state_count][1]), parseInt(definition[province_state_count][2]), parseInt(definition[province_state_count][3])], state_colors[parseInt(province_data[province_state_count][1])]);
          dtx.putImageData(image_data, 0, 0);
          reload();

          if (state_rendering_done != true) {
            console.log(Math.round((province_state_count/definition.length)*100) + "% done with rendering land provinces!");
          }
        }
        province_state_count++;
        if (province_state_count >= definition.length-1) {
          state_rendering_done = true;
        }
      }
    }, 0);
    //Generate random state colors
    province_count = 0;
    setInterval(function(){
      if (state_rendering_done) {
        if (province_count != rounded_provinces) {
          if (water_rendering_done == false) {
            for (var i = 0; i < 100; i++) {
              if (definition[province_count+i] != undefined) {
                if (definition[province_count+i][6] == "ocean" || definition[province_count+i][6] == "lakes") {
                  replace_color([parseInt(definition[province_count+i][1]), parseInt(definition[province_count+i][2]), parseInt(definition[province_count+i][3])], [176, 203, 244]);
                  dtx.putImageData(image_data, 0, 0);
                  reload();
                }
                console.log(Math.round((province_count/definition.length)*100) + "% done with rendering water provinces!");
              }
            }
            if (province_count < definition.length-1) {
              province_count = province_count + 100;
            }
          }
        } else {
          if (water_rendering_done == false) {
            saveImage("map-canvas", "cache/map_c.png");
            saveImage("map-canvas-2", "cache/map_d.png");
            saveImage("map-canvas-3", "cache/map_e.png");
          }
          water_rendering_done = true;
        }
      }
    }, 0);
  } //Fill all ocean provinces and states

  //Regex for getting provinces in a state
  //((?<=provinces= {\r|provinces= {\n|provinces= {\r\n)[^\r\n]+)|((?<=provinces = {\r|provinces = {\n|provinces = {\r\n)[^\r\n]+)|((?<=provinces ={\r|provinces ={\n|provinces ={\r\n)[^\r\n]+)|((?<=provinces={\r|provinces={\n|provinces={\r\n)[^\r\n]+)
  {
    {
      var current_colors_file_content = fs.readFileSync('resources/app/common/countries/colors.txt', 'utf8').toString();
      colors = current_colors_file_content.match(/([A-Z]\w\w)|((?<=color = ).*)/gm).toString();
      colors = colors.replace(/rgb/gm, "");
      colors = colors.replace(/(#)|[a-z]/gm, "");
      colors = colors.replace(/(  )/gm, " ");
      colors = colors.replace(/{/gm, "");
      colors = colors.replace(/}/gm, "");
      colors = colors.split(",");

      for (var i = 0; i < colors.length; i++) {
        colors[i] = colors[i].split(" ");
      }

      console.log(colors);
    } //Parse colors.txt file
    //joining path of directory
    const states_directory_path = path.join(__dirname, '/history/states');

    //Provinces: [id, state, owner, controller]

    //passsing states_directory_path and callback function
    var id_aliases = [/(?<=id=).*/gm, /(?<=id = ).*/gm, /(?<=id =).*/gm, /(?<=id= ).*/gm];
    fs.readdir(states_directory_path, function (err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //listing all files using forEach
      files.forEach(function (file) {
        // Do whatever you want to do with the file
        var current_history_file_content = fs.readFileSync('resources/app/history/states/' + file, 'utf8');
        var provinces = [];
        var state_id = 0;
        var state_colour = [];
        var owner_id = "";
        var controller_id = "";

        state_count++; //Increment provinces

        //Parse provinces
        provinces = current_history_file_content.match(/provinces([\S\s]*?)}/gm);

        if (provinces != undefined && provinces != null) {
          provinces = provinces.toString();

          provinces = provinces.replace(/provinces/gm, "");
          provinces = provinces.replace(/\,/gm, "");
          provinces = provinces.replace(/\t/gm, "");
          provinces = provinces.replace(/[{}]/gm, "");
          provinces = provinces.replace(/=/gm, "");
          provinces = provinces.split(" ");

          //Parse State ID
          console.log("Currently parsing File: " + file);

          var local_state_id = "";
          for (var i = 0; i < id_aliases.length; i++) {
            if (current_history_file_content.match(id_aliases[i]) != undefined && current_history_file_content.match(id_aliases[i]) != null) {
              local_state_id = current_history_file_content.match(id_aliases[i]);
            }
          }

          state_id = parseInt(local_state_id).toString();

          //Parse Owner and Controller
          owner_id = current_history_file_content.match(/(?<=owner = ).*/gm);

          if (owner_id != undefined && owner_id != null) {
            owner_id = owner_id.toString().split(",");
            if (owner_id.length > 1) {
              owner_id = owner_id[0];
            }

            console.log("State #" + state_id + "\nProvinces: " + provinces + "\nOwner: " + owner_id);

            for (var i = 0; i < provinces.length; i++) {
              provinces[i] = provinces[i].trim();
              provinces[i] = parseInt(provinces[i]).toString();
            }
            for (var i = 0; i < provinces.length; i++) {
              if (isNaN(parseInt(provinces[i])) == false) {
                if (province_data[parseInt(provinces[i]).toString()] == undefined) {
                  province_data[parseInt(provinces[i]).toString()] = [parseInt(provinces[i]), state_id];
                  if (parseInt(provinces[i]).toString() == "6421") {
                    console.log("Mark 6421");
                  }
                  //console.log("Set province data for Province #" + provinces[i] + " as " + province_data[provinces[i]]);
                }
              }
            }

            for (var i = 0; i < colors.length; i++) {
              if (owner_id == colors[i][0]) {
                state_colour = [colors[i+1][2], colors[i+1][3], colors[i+1][4]];
              }
            }

            state_colors[state_id] = state_colour;

            console.log(state_colour);
          }
        } else {
          console.error("Error encountered when parsing file: " + file);
        }
      });
    });
  } //State JS
}
function reload () {
  ctx.drawImage(d, 0, 0, d.width*zoomLevel, d.height*zoomLevel);
}
function zoom (level) {
  if (level >= 1 && level <= 2.5) {
    c.setAttribute("width", img.width*level);
    c.setAttribute("height", img.height*level);
    ctx.drawImage(d, 0, 0, img.width*level, img.height*level);
    zoomLevel = level;
  }
}
function saveImage (element_id, output_file) {
  c = document.getElementById(element_id);

  // Get the DataUrl from the Canvas
  const url = c.toDataURL('image/jpg', 0.8);

  // remove Base64 stuff from the Image
  const base64Data = url.replace(/^data:image\/png;base64,/, "");
  fs.writeFile("./" + output_file, base64Data, 'base64', function (err) {
    console.log(err);
  });
}
window.onload = function () {
  redraw();
}
