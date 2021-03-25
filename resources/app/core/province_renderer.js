var provinceArray = [];
var stateArray = [];

selectedProvince = 0;
var zoom_level = 1;
var map_mode = "provinces";

{
  //Freezes all processes upon startup if true
  freeze_mode = false;

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
  state_colors.push([randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255)]);
}
function randomNumber (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function redraw () { //initialize Canvas element
  c = document.getElementById("map-canvas"); //main display map
  ctx = c.getContext("2d");
  d = document.getElementById("map-canvas-2"); //cache map
  dtx = d.getContext("2d");
  e = document.getElementById("map-canvas-3"); //original provinces map
  etx = e.getContext("2d");

  img = document.getElementById("provinces-img"); //main provinces img
  provinces = [];
  ctx.drawImage(img, 0, 0, img.width, img.height);
  dtx.drawImage(img, 0, 0, img.width, img.height);
  etx.drawImage(img, 0, 0, img.width, img.height);

  image_data = ctx.getImageData(0, 0, img.width, img.height);

  function getCursorPosition(c, event) {
    var pan_x = window.pageXOffset || document.documentElement.scrollLeft,
        pan_y = window.pageYOffset || document.documentElement.scrollTop;

    const rect = c.getBoundingClientRect();
    const x = ((event.clientX)*(img.width/c.offsetWidth))+(pan_x/zoom_level);
    const y = ((event.clientY)*(img.width/c.offsetWidth))+(pan_y/zoom_level);

    return [x, y];
  }

  function replace_color (color_1, color_2) {
    for (var x = 0; x < image_data.data.length; x+=4) {
      if (image_data.data[x] == color_1[0] && image_data.data[x+1] == color_1[1] && image_data.data[x+2] == color_1[2]) {
        image_data.data[x] = color_2[0];
        image_data.data[x+1] = color_2[1];
        image_data.data[x+2] = color_2[2];
      }
    }
  }

  function select_province (color_1, color_2) {
    var province_id;
    //Fetch province id
    for (var i = 0; i < definition.length; i++) {
      if (color_1[0] == parseInt(definition[i][1]) && color_1[1] == parseInt(definition[i][2]) && color_1[2] == parseInt(definition[i][3])) {
        province_id = i;
      }
    }

    province_map_data = etx.getImageData(0, 0, img.width, img.height);
    //Cache map first
    dtx.putImageData(image_data, 0, 0);

    var province_pixel_cache = [];
    for (var i = 0; i < province_map_data.data.length; i += 4) {
      if (province_map_data.data[i] == color_1[0] && province_map_data.data[i+1] == color_1[1] && province_map_data.data[i+2] == color_1[2]) {
        image_data.data[i] = color_2[0];
        image_data.data[i+1] = color_2[1];
        image_data.data[i+2] = color_2[2];

        province_pixel_cache.push([i, i+1, i+2]);
      }
    }

    setTimeout(function(){ //Reset province color after 100ms
      for (var i = 0; i < province_pixel_cache.length; i++) {
        image_data.data[province_pixel_cache[i][0]] = parseInt(province_data[province_id].display_color[0]);
        image_data.data[province_pixel_cache[i][1]] = parseInt(province_data[province_id].display_color[1]);
        image_data.data[province_pixel_cache[i][2]] = parseInt(province_data[province_id].display_color[2]);
      }
    }, 100);
  }

  c.addEventListener('click', function (e) {
    //if (state_rendering_done && water_rendering_done) {
      mouse_coordinates = getCursorPosition(c, e);
      var coordinate_data = etx.getImageData(mouse_coordinates[0], mouse_coordinates[1], 1, 1);
      console.log(coordinate_data);
      console.log("x: " + mouse_coordinates[0] + " y: " + mouse_coordinates[1]);
      for (var i = 0; i < definition.length; i++) {
        if (coordinate_data.data[0] == parseInt(definition[i][1]) && coordinate_data.data[1] == parseInt(definition[i][2]) && coordinate_data.data[2] == parseInt(definition[i][3])) {
          if (province_data[i] != undefined) {
            selected_province = definition[i][0];
            var current_province = definition[i][0];
            var province_color = [parseInt(definition[i][1]), parseInt(definition[i][2]), parseInt(definition[i][3])];
            var current_state = province_data.state_id;
            var state_color = state_colors[current_state];
            console.log("You have clicked on Province " + selected_province + "\nState: " + current_state);

            if (map_mode == "provinces") {
              select_province(province_color, [255, 255, 255]);
            } else if (map_mode == "states") {
              replace_color(state_color, [255, 255, 255]);
              dtx.putImageData(image_data, 0, 0);

              setTimeout(function() {
                replace_color([255, 255, 255], state_color);
                dtx.putImageData(image_data, 0, 0);
              },100);
            }
          }

          reload();
        }
      }
    //}
  });

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
          replace_color([parseInt(definition[province_state_count][1]), parseInt(definition[province_state_count][2]), parseInt(definition[province_state_count][3])], state_colors[parseInt(province_data[province_state_count].state_id)]);
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
        var state_color = [];
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

            for (var i = 0; i < colors.length; i++) {
              if (owner_id == colors[i][0]) {
                state_color = [colors[i+1][2], colors[i+1][3], colors[i+1][4]];
              }
            }

            //initialize province object
            for (var i = 0; i < provinces.length; i++) {
              if (isNaN(parseInt(provinces[i])) == false) {
                if (province_data[parseInt(provinces[i]).toString()] == undefined) {
                  province_data[parseInt(provinces[i]).toString()] = {
                    display_color: state_color,
                    province_id: parseInt(provinces[i]),
                    state_id: state_id
                  };
                }
              }
            }

            state_colors[state_id] = state_color;
          }
        } else {
          console.error("Error encountered when parsing file: " + file);
        }
      });
    });
  } //State JS
}
function reload () {
  ctx.drawImage(d, 0, 0, d.width*zoom_level, d.height*zoom_level);
}
function zoom (level) {
  if (level >= 1 && level <= 2.5) {
    c.setAttribute("width", img.width*level);
    c.setAttribute("height", img.height*level);
    ctx.drawImage(d, 0, 0, img.width*level, img.height*level);
    zoom_level = level;
  }
}
function saveImage (element_id, output_file) {
  canvas = document.getElementById(element_id);

  // Get the DataUrl from the Canvas
  const url = c.toDataURL('image/jpg', 0.8);

  // remove Base64 stuff from the Image
  const base64Data = url.replace(/^data:image\/png;base64,/, "");
  fs.writeFile("./" + output_file, base64Data, 'base64', function (err) {
    console.log(err);
  });
}
window.onload = function () {
  if (!freeze_mode) {
    redraw();
  }
}
