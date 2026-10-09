// Loads the car knowledge base (data/car_data.json) once at startup
// and makes it available to other modules through getCarData().

const fs = require("fs");
const path = require("path");

let carData = {};

function loadCarData() {
  const filePath = path.join(__dirname, "data", "car_data.json");

  fs.readFile(filePath, "utf8", function (err, data) {
    if (err) {
      console.log("could not read car_data.json: " + err);
      return;
    }
    carData = JSON.parse(data);
    console.log("car data loaded successfully");
  });
}

// returns the loaded car data
function getCarData() {
  return carData;
}

module.exports = { loadCarData, getCarData };
