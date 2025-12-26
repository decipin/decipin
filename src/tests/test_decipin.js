/**
 * Tests for DeciPin Encoder and Decoder
 * Released under an open source license for public use
 *
 * This contains a test function to validate encoding and decoding
 *  - testDeciPinEncodeDecode(iterations): Tests the encoding and decoding process for a specified number of iterations
 */

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
