class FeeCalculator {
  constructor(vinniesPerSignature = 0) {
    // Initialize with a default value or a dynamically set value
    this.vinniesPerSignature = vinniesPerSignature;
  }

  /**
   * Set vinniesPerSignature dynamically
   * @param {number} vinniesPerSignature - Fee per signature in vinnies
   */
  setVinniesPerSignature(vinniesPerSignature) {
    if (vinniesPerSignature < 0) {
      throw new Error('vinniesPerSignature must be non-negative');
    }
    this.vinniesPerSignature = vinniesPerSignature;
  }

  /**
   * Get the total fee for a transaction based on the number of required signatures
   * @param {number} signatureCount - Number of signatures required for the transaction
   * @returns {number} Total fee in vinnies
   */
  calculateFee(signatureCount) {
    if (signatureCount < 0) {
      throw new Error('signatureCount must be non-negative');
    }
    return this.vinniesPerSignature * signatureCount;
  }

  /**
   * Deserialize fee configuration from account data
   * @param {Buffer | Uint8Array | Array<number>} buffer - Account data containing fee information
   */
  static fromAccountData(buffer) {
    if (!buffer || buffer.length < 8) {
      throw new Error('Invalid account data');
    }

    // Assume the vinniesPerSignature is stored as a 64-bit integer in little-endian format
    const view = new DataView(new Uint8Array(buffer).buffer);
    const vinniesPerSignature = view.getBigUint64(0, true); // Read as little-endian
    return new FeeCalculator(Number(vinniesPerSignature));
  }
}

export { FeeCalculator };
