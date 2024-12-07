class FeeCalculator {
  constructor(vinniesPerSignature = 0) {
    if (typeof vinniesPerSignature !== 'number' || vinniesPerSignature < 0) {
      throw new TypeError('vinniesPerSignature must be a non-negative number');
    }
    this.vinniesPerSignature = vinniesPerSignature;
  }

  /**
   * Serialize FeeCalculator to a buffer
   * @returns {Buffer} Serialized data
   */
  serialize() {
    const buffer = Buffer.alloc(8); // 8 bytes for a 64-bit number
    buffer.writeBigUInt64LE(BigInt(this.vinniesPerSignature), 0);
    return buffer;
  }

  /**
   * Deserialize FeeCalculator from account data
   * @param {Buffer | Uint8Array | Array<number>} buffer - Serialized data
   * @returns {FeeCalculator} Deserialized FeeCalculator
   */
  static fromAccountData(buffer) {
    if (!buffer || buffer.length < 8) {
      throw new Error('Invalid FeeCalculator data');
    }
    const vinniesPerSignature = Number(buffer.readBigUInt64LE(0));
    return new FeeCalculator(vinniesPerSignature);
  }
}

export { FeeCalculator };
