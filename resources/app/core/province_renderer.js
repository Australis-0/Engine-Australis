const path = require('path');
const fs = require('fs');

var provinceArray = [];
var stateArray = [];

selectedProvince = 0;
var zoomLevel = 1;
var map_mode = "provinces";

{
  //Provinces
  provinceData = {};

  //States
  state_count = 0;
  state_colours = [];

  colours = [];

  //Defines
  colours_amount = 23000;
  prov_hundred_rounded = 13200;
  map_width = 5616;
  map_height = 2048;

  //Loading
  waterRenderingDone = false;
  stateRenderingDone = false;
} //Variables

for (var i = 0; i < colours_amount; i++) {
  state_colours.push([getRandom(0,255), getRandom(0,255), getRandom(0,255)]);
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

  imageData = ctx.getImageData(0, 0, img.width, img.height);

  function getCursorPosition(c, event) {
    var panY  = window.pageYOffset || document.documentElement.scrollTop,
      panX = window.pageXOffset || document.documentElement.scrollLeft;
    const rect = c.getBoundingClientRect();
    const x = ((event.clientX)*(img.width/c.offsetWidth))+(panX/zoomLevel);
    const y = ((event.clientY)*(img.width/c.offsetWidth))+(panY/zoomLevel);
    return [x,y];
    console.log(y);
  }

  function replaceColour (colour1, colour2) {
    for (var x = 0; x < imageData.data.length; x+=4) {
      if (imageData.data[x] == colour1[0] && imageData.data[x+1] == colour1[1] && imageData.data[x+2] == colour1[2]) {
        imageData.data[x] = colour2[0];
        imageData.data[x+1] = colour2[1];
        imageData.data[x+2] = colour2[2];
      }
    }
  }

  c.addEventListener('click', function(e) {
    //if (stateRenderingDone && waterRenderingDone) {
      mouseCoords = getCursorPosition(c, e);
      var coordData = etx.getImageData(mouseCoords[0], mouseCoords[1], 1, 1);
      console.log(coordData);
      console.log("x: " + mouseCoords[0] + " y: " + mouseCoords[1]);
      for (var i = 0; i < definition.length; i++) {
        if (coordData.data[0] == parseInt(definition[i][1]) && coordData.data[1] == parseInt(definition[i][2]) && coordData.data[2] == parseInt(definition[i][3])) {
          if (provinceData[i] != undefined) {
            selectedProvince = definition[i][0];
            var currentProvince = definition[i][0];
            var provinceColour = [parseInt(definition[i][1]), parseInt(definition[i][2]), parseInt(definition[i][3])];
            var currentState = provinceData[i][1];
            var stateColour = state_colours[currentState];
            console.log("You have clicked on Province " + selectedProvince + "\nState: " + currentState);

            if (map_mode == "provinces") {
              replaceColour(provinceColour, [255, 255, 255]);
              dtx.putImageData(imageData, 0, 0);

              setTimeout(function(){
                replaceColour([255, 255, 255], provinceColour);
                dtx.putImageData(imageData, 0, 0);
              },100);
            } else if (map_mode == "states") {
              replaceColour(stateColour, [255, 255, 255]);
              dtx.putImageData(imageData, 0, 0);

              setTimeout(function(){
                replaceColour([255, 255, 255], stateColour);
                dtx.putImageData(imageData, 0, 0);
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
    definition = (window.csv_to_array(definition.toString(), ";"));
  } catch(e) {
    console.log('Error:', e.stack);
  }

  zoom(1); //Call in case the map is not vanilla.
  
  {
    prov_hundred_rounded = Math.ceil(definition.length/100)*100;
    provStateCount = 0;
    var x = 0;

    setInterval(function(){
      if (definition[provStateCount] != undefined) {
        if (definition[provStateCount][6] != "ocean" && definition[provStateCount][6] != "lakes" && provinceData[provStateCount] != undefined) {
          replaceColour([parseInt(definition[provStateCount][1]), parseInt(definition[provStateCount][2]), parseInt(definition[provStateCount][3])], state_colours[parseInt(provinceData[provStateCount][1])]);
          dtx.putImageData(imageData, 0, 0);
          reload();

          if (stateRenderingDone != true) {
            console.log(Math.round((provStateCount/definition.length)*100) + "% done with rendering land provinces!");
          }
        }
        provStateCount++;
        if (provStateCount >= definition.length-1) {
          stateRenderingDone = true;
        }
      }
    }, 0);
    //Generate random state colours
    provCount = 0;
    setInterval(function(){
      if (stateRenderingDone) {
        if (provCount != prov_hundred_rounded) {
          if (waterRenderingDone == false) {
            for (var i = 0; i < 100; i++) {
              if (definition[provCount+i] != undefined) {
                if (definition[provCount+i][6] == "ocean" || definition[provCount+i][6] == "lakes") {
                  replaceColour([parseInt(definition[provCount+i][1]), parseInt(definition[provCount+i][2]), parseInt(definition[provCount+i][3])], [176, 203, 244]);
                  dtx.putImageData(imageData, 0, 0);
                  reload();
                }
                console.log(Math.round((provCount/definition.length)*100) + "% done with rendering water provinces!");
              }
            }
            if (provCount < definition.length-1) {
              provCount = provCount + 100;
            }
          }
        } else {
          if (waterRenderingDone == false) {
            saveImage("map-canvas", "cache/map_c.png");
            saveImage("map-canvas-2", "cache/map_d.png");
            saveImage("map-canvas-3", "cache/map_e.png");
          }
          waterRenderingDone = true;
        }
      }
    }, 0);
  } //Fill all ocean provinces and states

  //Regex for getting provinces in a state
  //((?<=provinces= {\r|provinces= {\n|provinces= {\r\n)[^\r\n]+)|((?<=provinces = {\r|provinces = {\n|provinces = {\r\n)[^\r\n]+)|((?<=provinces ={\r|provinces ={\n|provinces ={\r\n)[^\r\n]+)|((?<=provinces={\r|provinces={\n|provinces={\r\n)[^\r\n]+)
  {
    {
      var currentFileContent = fs.readFileSync('resources/app/common/countries/colors.txt', 'utf8').toString();
      colours = currentFileContent.match(/([A-Z]\w\w)|((?<=color = ).*)/gm).toString();
      colours = colours.replace(/rgb/gm, "");
      colours = colours.replace(/(#)|[a-z]/gm, "");
      colours = colours.replace(/(  )/gm, " ");
      colours = colours.replace(/{/gm, "");
      colours = colours.replace(/}/gm, "");
      colours = colours.split(",");

      for (var i = 0; i < colours.length; i++) {
        colours[i] = colours[i].split(" ");
      }

      console.log(colours);
    } //Parse colours.txt file
    //joining path of directory
    const directoryPath = path.join(__dirname, '/history/states');

    //Provinces: [id, state, owner, controller]

    //passsing directoryPath and callback function
    var id_aliases = [/(?<=id=).*/gm, /(?<=id = ).*/gm, /(?<=id =).*/gm, /(?<=id= ).*/gm];
    fs.readdir(directoryPath, function (err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //listing all files using forEach
      files.forEach(function (file) {
        // Do whatever you want to do with the file
        var currentFileContent = fs.readFileSync('resources/app/history/states/' + file, 'utf8');
        var provinces = [];
        var state_id = 0;
        var state_colour = [];
        var owner_id = "";
        var controller_id = "";

        state_count++; //Increment provinces

        //Parse provinces
        provinces = currentFileContent.match(/provinces([\S\s]*?)}/gm);

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
            if (currentFileContent.match(id_aliases[i]) != undefined && currentFileContent.match(id_aliases[i]) != null) {
              local_state_id = currentFileContent.match(id_aliases[i]);
            }
          }

          state_id = parseInt(local_state_id).toString();

          //Parse Owner and Controller
          owner_id = currentFileContent.match(/(?<=owner = ).*/gm);

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
                if (provinceData[parseInt(provinces[i]).toString()] == undefined) {
                  provinceData[parseInt(provinces[i]).toString()] = [parseInt(provinces[i]), state_id];
                  if (parseInt(provinces[i]).toString() == "6421") {
                    console.log("Mark 6421");
                  }
                  //console.log("Set province data for Province #" + provinces[i] + " as " + provinceData[provinces[i]]);
                }
              }
            }

            for (var i = 0; i < colours.length; i++) {
              if (owner_id == colours[i][0]) {
                state_colour = [colours[i+1][2], colours[i+1][3], colours[i+1][4]];
              }
            }

            state_colours[state_id] = state_colour;

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
