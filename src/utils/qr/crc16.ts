/**
 * CRC-16 CCITT (0xFFFF, Poly 0x1021) for EMVCo / VietQR validation
 */

/**
 * Encodes a string into UTF-8 byte array without depending on browser DOM TextEncoder.
 */
export function stringToUtf8ByteArray(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      bytes.push(charCode);
    } else if (charCode < 0x800) {
      bytes.push(0xc0 | (charCode >> 6));
      bytes.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      bytes.push(0xe0 | (charCode >> 12));
      bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      bytes.push(0x80 | (charCode & 0x3f));
    } else {
      // UTF-16 surrogate pairs
      i++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(0xf0 | (charCode >> 18));
      bytes.push(0x80 | ((charCode >> 12) & 0x3f));
      bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      bytes.push(0x80 | (charCode & 0x3f));
    }
  }
  return bytes;
}

/**
 * Converts a UTF-8 byte array slice back to string.
 */
export function utf8ByteArrayToString(bytes: number[]): string {
  let result = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    if (b1 < 0x80) {
      result += String.fromCharCode(b1);
    } else if (b1 > 0xbf && b1 < 0xe0) {
      const b2 = bytes[i++];
      result += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
    } else if (b1 > 0xdf && b1 < 0xf0) {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      result += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
    } else {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      const b4 = bytes[i++];
      let cp = (((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f)) - 0x10000;
      result += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return result;
}

/**
 * Computes CRC-16 CCITT (False) checksum over an input string.
 * Initial: 0xFFFF, Poly: 0x1021, XorOut: 0x0000
 */
export function computeCrc16(input: string): string {
  let crc = 0xffff;
  const bytes = stringToUtf8ByteArray(input);

  for (let i = 0; i < bytes.length; i++) {
    crc ^= (bytes[i] << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Validates whether the given EMVCo string has a valid CRC-16 at Tag 63.
 * Expected pattern: ...6304[4 HEX CHARS]
 */
export function validateEMVCrc(qrString: string): boolean {
  const crcTagIndex = qrString.lastIndexOf('6304');
  if (crcTagIndex === -1 || crcTagIndex !== qrString.length - 8) {
    return false;
  }

  const dataToCalculate = qrString.substring(0, crcTagIndex + 4);
  const expectedCrc = qrString.substring(crcTagIndex + 4, crcTagIndex + 8).toUpperCase();
  const calculatedCrc = computeCrc16(dataToCalculate);

  return expectedCrc === calculatedCrc;
}
