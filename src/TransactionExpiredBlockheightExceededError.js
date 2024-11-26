class TransactionExpiredBlockheightExceededError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TransactionExpiredBlockheightExceededError';
  }
}

class TransactionExpiredNonceInvalidError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TransactionExpiredNonceInvalidError';
  }
}

class TransactionExpiredTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TransactionExpiredTimeoutError';
  }
}

export { TransactionExpiredBlockheightExceededError, TransactionExpiredNonceInvalidError, TransactionExpiredTimeoutError };