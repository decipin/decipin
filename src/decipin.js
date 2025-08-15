/**
 * DeciPin Encoder and Decoder
 * Developed by Anup Som
 * Released under an open source license for public use
 *
 * This contains two main functions:
 *  - getDeciPin(lat, lon): Encodes latitude and longitude into a 12 character alphanumeric DeciPin with optional separators
 *  - getLatLonFromDeciPin(deciPin): Decodes a DeciPin back into the latitude and longitude of the center of the smallest box
 * and a test function to validate encoding and decoding
 *  - testDeciPinEncodeDecode(iterations): Tests the encoding and decoding process for a specified number of iterations
 */


const DECIPIN_START_HI = 'A'; // To encode numeric digits 0-9 to A-J for the first two characters of latitude after the decimal point
const DECIPIN_START_LO = 'Q'; // To encode numeric digits 0-9 to Q-Z for the last two characters of latitude after the decimal point

const DECIPIN_BOUNDS = {
  minLat: 0,
  maxLat: 99.9999,
  minLon: 0,
  maxLon: 99.9999,
};

function getDeciPin(lat, lon, includeSeparators = true) {
  if (lat < DECIPIN_BOUNDS.minLat || lat > DECIPIN_BOUNDS.maxLat) throw new Error('lat out of range');
  if (lon < DECIPIN_BOUNDS.minLon || lon > DECIPIN_BOUNDS.maxLon) throw new Error('lon out of range');

  function format6(num) {
    return (Math.trunc(num*10000)).toString().padStart(6, '0').substring(0, 6);
  }

  const A0offset = DECIPIN_START_HI.charCodeAt(0) - '0'.charCodeAt(0);
  const Q0offset = DECIPIN_START_LO.charCodeAt(0) - '0'.charCodeAt(0);

  const latStr = format6(lat);
  const lonStr = format6(lon);

  let deciPin = latStr.substring(0,2)
              + lonStr.substring(0,2)
              + (includeSeparators?'.': '')
              + String.fromCharCode(latStr.charCodeAt(2) + A0offset) + String.fromCharCode(latStr.charCodeAt(3) + A0offset) 
              + lonStr.substring(2,4)
              + (includeSeparators?'/': '')
              + String.fromCharCode(latStr.charCodeAt(4) + Q0offset) + String.fromCharCode(latStr.charCodeAt(5) + Q0offset) 
              + lonStr.substring(4,6);

  return deciPin;
}

const DECIPIN_REGEX = /^([0-9]{4})\.?([A-J]{2})([0-9]{2})\/?([Q-Z]{2})([0-9]{2})$/;

function getLatLonFromDeciPin(deciPin) {
  deciPin = deciPin.toUpperCase(); // Ensure uppercase for consistency. DeciPin is not case sensitive

  if (!DECIPIN_REGEX.test(deciPin)) throw new Error('Invalid DeciPin');
  
  deciPin = deciPin.replace(/\./, '').replace(/\//, '');

  const A0offset = DECIPIN_START_HI.charCodeAt(0) - '0'.charCodeAt(0);
  const Q0offset = DECIPIN_START_LO.charCodeAt(0) - '0'.charCodeAt(0);

  const latStr = deciPin.substring(0, 2)
      + '.'
      + String.fromCharCode(deciPin.charCodeAt(4) - A0offset) + String.fromCharCode(deciPin.charCodeAt(5) - A0offset) 
      + String.fromCharCode(deciPin.charCodeAt(8) - Q0offset) + String.fromCharCode(deciPin.charCodeAt(9) - Q0offset) 
      + '5'; // Append 5 for center of box

  const lonStr = deciPin.substring(2, 4)
      + '.'
      + deciPin.substring(6, 8)
      + deciPin.substring(10,12)
      + '5'; // Append 5 for center of box

  return {
    lat: parseFloat(latStr),
    lon: parseFloat(lonStr)
  };
}



function testDeciPinEncodeDecode(iterations=1_000_000) {
  const ERROR_TOLERANCE = 0.00005; // Tolerance for lat/lon comparison
  for (let i = 0; i < iterations; i++) {
    let lat = DECIPIN_BOUNDS.minLat + Math.random() * (DECIPIN_BOUNDS.maxLat - DECIPIN_BOUNDS.minLat);
    let lon = DECIPIN_BOUNDS.minLon + Math.random() * (DECIPIN_BOUNDS.maxLon - DECIPIN_BOUNDS.minLon);
    const deciPin = getDeciPin(lat, lon);
    const latlon = getLatLonFromDeciPin(deciPin);
    //console.log(`Testing DeciPin: ${deciPin} for lat: ${lat}, lon: ${lon}, error: ${Math.max(Math.abs(latlon.lat - lat), Math.abs(latlon.lon - lon))}`);
    if (Math.abs(latlon.lat - lat) > ERROR_TOLERANCE || Math.abs(latlon.lon - lon) > ERROR_TOLERANCE) {
      throw new Error(`DeciPin encode/decode mismatch: ${deciPin} for lat: ${lat}, lon: ${lon}, error: ${Math.max(Math.abs(latlon.lat - lat), Math.abs(latlon.lon - lon))}`);
    }
    if (!(deciPin.length == 12 || deciPin.length == 14)) {
      throw new Error(`DeciPin length mismatch: ${deciPin} for lat: ${lat}, lon: ${lon}`);
    }
    if (!DECIPIN_REGEX.test(deciPin)) {
      throw new Error(`DeciPin regex mismatch: ${deciPin} for lat: ${lat}, lon: ${lon}`);
    }
  }
  console.log(`All ${iterations} DeciPin tests passed successfully.`);
  return true;
}
