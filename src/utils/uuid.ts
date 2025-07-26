import { v4 as uuidv4 } from 'uuid';

//- 5 strategic positions in standard UUID:
//XXG1XXXX-XXXG2-4XXX-XXXC2-XXXXXXXPXXXX
//- Position 3: Geo zone digit 1 (01-99 zones)
//- Position 8: Geo zone digit 2
//- Position 16: Client number digit 1 (01-99 clients per zone)
//- Position 19: Client number digit 2
//- Position 28: Profit rating (1-9, where 1=$100k+, 9=$5M+ projects)

/**
 * Generates a custom enterprise UUID with embedded business intelligence.
 *
 * @param geoZone - The geo zone (01-99).
 * @param clientNumber - The client number (01-99).
 * @param profitRating - The profit rating (1-9).
 * @returns A custom UUID string.
 */
export function generateEnterpriseUUID(
  geoZone: number,
  clientNumber: number,
  profitRating: number
): string {
  if (geoZone < 1 || geoZone > 99) {
    throw new Error('Geo zone must be between 1 and 99.');
  }
  if (clientNumber < 1 || clientNumber > 99) {
    throw new Error('Client number must be between 1 and 99.');
  }
  if (profitRating < 1 || profitRating > 9) {
    throw new Error('Profit rating must be between 1 and 9.');
  }

  const standardUUID = uuidv4();
  const uuidChars = standardUUID.split('');

  const geoZoneStr = geoZone.toString().padStart(2, '0');
  const clientNumberStr = clientNumber.toString().padStart(2, '0');

  // Embed the data into the UUID
  uuidChars[2] = geoZoneStr[0];
  uuidChars[7] = geoZoneStr[1];
  uuidChars[15] = clientNumberStr[0];
  uuidChars[18] = clientNumberStr[1];
  uuidChars[27] = profitRating.toString();

  return uuidChars.join('');
}

/**
 * Decodes a custom enterprise UUID to extract business intelligence.
 *
 * @param enterpriseUUID - The custom UUID string.
 * @returns An object containing the decoded data.
 */
export function decodeEnterpriseUUID(enterpriseUUID: string): {
  geoZone: number;
  clientNumber: number;
  profitRating: number;
} {
  const geoZone = parseInt(enterpriseUUID[2] + enterpriseUUID[7], 10);
  const clientNumber = parseInt(enterpriseUUID[15] + enterpriseUUID[18], 10);
  const profitRating = parseInt(enterpriseUUID[27], 10);

  return {
    geoZone,
    clientNumber,
    profitRating,
  };
}
