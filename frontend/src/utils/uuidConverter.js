// src/utils/uuidConverter.js
export const bufferToUuid = (buffer) => {
    if (!buffer || buffer.length !== 16) {
      throw new Error("Invalid buffer length for UUID conversion.");
    }
  
    const hex = Array.from(buffer)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };
  