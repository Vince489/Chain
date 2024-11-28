const bs58 = require('bs58');
const { Buffer } = require('buffer');
const { PACKET_DATA_SIZE, SIGNATURE_LENGTH_IN_BYTES } = require('./constants');
const { Message } = require('../message');
const { PublicKey } = require('../publickey');
const shortvec = require('../utils/shortvec-encoding');
const { toBuffer } = require('../utils/to-buffer');
const invariant = require('../utils/assert');
const { sign, verify } = require('../utils/ed25519');
const { guardedSplice } = require('../utils/guarded-array-utils');
class Transaction {
  constructor(opts) {
    this.signatures = [];
    this.instructions = [];

    if (!opts) return;

    // Initialize properties based on provided options
    if (opts.feePayer) this.feePayer = opts.feePayer;
    if (opts.signatures) this.signatures = opts.signatures;

    if (opts.nonceInfo) {
      const { minContextSlot, nonceInfo } = opts;
      this.minNonceContextSlot = minContextSlot;
      this.nonceInfo = nonceInfo;
    } else if (opts.lastValidBlockHeight) {
      const { blockhash, lastValidBlockHeight } = opts;
      this.recentBlockhash = blockhash;
      this.lastValidBlockHeight = lastValidBlockHeight;
    } else {
      const { recentBlockhash, nonceInfo } = opts;
      if (nonceInfo) this.nonceInfo = nonceInfo;
      this.recentBlockhash = recentBlockhash;
    }
  }

  // Getter for signature, retrieves the first signature from the signatures array
  get signature() {
    return this.signatures.length > 0 ? this.signatures[0].signature : null;
  }

  // Converts the Transaction to a JSON object
  toJSON() {
    return {
      recentBlockhash: this.recentBlockhash || null,
      feePayer: this.feePayer ? this.feePayer.toJSON() : null,
      nonceInfo: this.nonceInfo
        ? {
            nonce: this.nonceInfo.nonce,
            nonceInstruction: this.nonceInfo.nonceInstruction.toJSON(),
          }
        : null,
      instructions: this.instructions.map(instruction => instruction.toJSON()),
      signers: this.signatures.map(({ publicKey }) => publicKey.toJSON()),
    };
  }

  // Add one or more instructions to the transaction
  add(...items) {
    if (items.length === 0) {
      throw new Error('No instructions');
    }

    items.forEach(item => {
      if ('instructions' in item) {
        this.instructions = this.instructions.concat(item.instructions);
      } else if ('data' in item && 'programId' in item && 'keys' in item) {
        this.instructions.push(item);
      } else {
        this.instructions.push(new TransactionInstruction(item));
      }
    });

    return this;
  }

  // Compile the transaction data
  compileMessage() {
    if (
      this._message &&
      JSON.stringify(this.toJSON()) === JSON.stringify(this._json)
    ) {
      return this._message;
    }

    let recentBlockhash;
    let instructions;
    if (this.nonceInfo) {
      recentBlockhash = this.nonceInfo.nonce;
      if (this.instructions[0] !== this.nonceInfo.nonceInstruction) {
        instructions = [this.nonceInfo.nonceInstruction, ...this.instructions];
      } else {
        instructions = this.instructions;
      }
    } else {
      recentBlockhash = this.recentBlockhash;
      instructions = this.instructions;
    }

    if (!recentBlockhash) {
      throw new Error('Transaction recentBlockhash required');
    }

    if (instructions.length < 1) {
      console.warn('No instructions provided');
    }

    let feePayer;
    if (this.feePayer) {
      feePayer = this.feePayer;
    } else if (this.signatures.length > 0 && this.signatures[0].publicKey) {
      feePayer = this.signatures[0].publicKey;
    } else {
      throw new Error('Transaction fee payer required');
    }

    // Validate that all instructions have a programId
    instructions.forEach((instruction, i) => {
      if (instruction.programId === undefined) {
        throw new Error(`Transaction instruction index ${i} has undefined program id`);
      }
    });

    const programIds = [];
    const accountMetas = [];
    instructions.forEach(instruction => {
      instruction.keys.forEach(accountMeta => {
        accountMetas.push({ ...accountMeta });
      });

      const programId = instruction.programId.toString();
      if (!programIds.includes(programId)) {
        programIds.push(programId);
      }
    });

    // Add programIds to account metas
    programIds.forEach(programId => {
      accountMetas.push({
        pubkey: new PublicKey(programId),
        isSigner: false,
        isWritable: false,
      });
    });

    // Remove duplicates and sort account metas
    const uniqueMetas = [];
    accountMetas.forEach(accountMeta => {
      const pubkeyString = accountMeta.pubkey.toString();
      const uniqueIndex = uniqueMetas.findIndex(x => x.pubkey.toString() === pubkeyString);
      if (uniqueIndex > -1) {
        uniqueMetas[uniqueIndex].isWritable =
          uniqueMetas[uniqueIndex].isWritable || accountMeta.isWritable;
        uniqueMetas[uniqueIndex].isSigner =
          uniqueMetas[uniqueIndex].isSigner || accountMeta.isSigner;
      } else {
        uniqueMetas.push(accountMeta);
      }
    });

    uniqueMetas.sort((x, y) => {
      if (x.isSigner !== y.isSigner) {
        return x.isSigner ? -1 : 1;
      }
      if (x.isWritable !== y.isWritable) {
        return x.isWritable ? -1 : 1;
      }
      return x.pubkey
        .toBase58()
        .localeCompare(y.pubkey.toBase58(), 'en', { sensitivity: 'variant' });
    });

    const feePayerIndex = uniqueMetas.findIndex(x => x.pubkey.equals(feePayer));
    if (feePayerIndex > -1) {
      const [payerMeta] = uniqueMetas.splice(feePayerIndex, 1);
      payerMeta.isSigner = true;
      payerMeta.isWritable = true;
      uniqueMetas.unshift(payerMeta);
    } else {
      uniqueMetas.unshift({
        pubkey: feePayer,
        isSigner: true,
        isWritable: true,
      });
    }

    // Validate that all signatures match signers
    for (const signature of this.signatures) {
      const uniqueIndex = uniqueMetas.findIndex(x => x.pubkey.equals(signature.publicKey));
      if (uniqueIndex > -1) {
        if (!uniqueMetas[uniqueIndex].isSigner) {
          uniqueMetas[uniqueIndex].isSigner = true;
          console.warn(
            'Transaction references a signature that is unnecessary, ' +
              'only the fee payer and instruction signer accounts should sign a transaction.'
          );
        }
      } else {
        throw new Error(`unknown signer: ${signature.publicKey.toString()}`);
      }
    }

    let numRequiredSignatures = 0;
    let numReadonlySignedAccounts = 0;
    let numReadonlyUnsignedAccounts = 0;

    // Split out signing from non-signing keys and count header values    
    const signedKeys = [];
    const unsignedKeys = [];
    uniqueMetas.forEach(({ pubkey, isSigner, isWritable }) => {
      if (isSigner) {
        signedKeys.push(pubkey.toString());
        numRequiredSignatures += 1;
        if (!isWritable) {
          numReadonlySignedAccounts += 1;
        }
      } else {
        unsignedKeys.push(pubkey.toString());
        if (!isWritable) {
          numReadonlyUnsignedAccounts += 1;
        }
      }
    });

    const accountKeys = signedKeys.concat(unsignedKeys);
    const compiledInstructions = instructions.map(instruction => {
      const { data, programId } = instruction;
      return {
        programIdIndex: accountKeys.indexOf(programId.toString()),
        accounts: instruction.keys.map(meta => accountKeys.indexOf(meta.pubkey.toString())),
        data: bs58.encode(data),
      };
    });

    compiledInstructions.forEach(instruction => {
      invariant(instruction.programIdIndex >= 0);
      instruction.accounts.forEach(keyIndex => invariant(keyIndex >= 0));
    });

    return new Message({
      header: {
        numRequiredSignatures,
        numReadonlySignedAccounts,
        numReadonlyUnsignedAccounts,
      },
      accountKeys,
      recentBlockhash,
      instructions: compiledInstructions,
    });
  }
  
  // Compile the transaction and sign it with the specified keypair
  _compile() {
    const message = this.compileMessage();
    const signedKeys = message.accountKeys.slice(
      0,
      message.header.numRequiredSignatures,
    );

    if (this.signatures.length === signedKeys.length) {
      const valid = this.signatures.every((pair, index) => {
        return signedKeys[index].equals(pair.publicKey);
      });

      if (valid) return message;
    }

    this.signatures = signedKeys.map(publicKey => ({
      signature: null,
      publicKey,
    }));

    return message;
  } 
  
  // Get a buffer of the Transaction data that need to be covered by signatures
  serializeMessage() {
    return this._compile().serialize();
  }

  // Get the estimated fee associated with a transaction
  async getEstimatedFee(connection) {
    return (await connection.getFeeForMessage(this.compileMessage())).value;
  }
  
  sign() {
    if (arguments.length === 0) {
      throw new Error('No signers');
    }
  
    // Dedupe signers
    const seen = new Set();
    const uniqueSigners = [];
    for (let i = 0; i < arguments.length; i++) {
      const signer = arguments[i];
      const key = signer.publicKey.toString();
      if (seen.has(key)) {
        continue;
      } else {
        seen.add(key);
        uniqueSigners.push(signer);
      }
    }
  
    this.signatures = uniqueSigners.map(signer => ({
      signature: null,
      publicKey: signer.publicKey,
    }));
  
    const message = this._compile();
    this._partialSign(message, ...uniqueSigners);
  }
  

  partialSign() {
    if (arguments.length === 0) {
      throw new Error('No signers');
    }
  
    // Dedupe signers
    const seen = new Set();
    const uniqueSigners = [];
    for (let i = 0; i < arguments.length; i++) {
      const signer = arguments[i];
      const key = signer.publicKey.toString();
      if (seen.has(key)) {
        continue;
      } else {
        seen.add(key);
        uniqueSigners.push(signer);
      }
    }
  
    const message = this._compile();
    this._partialSign(message, ...uniqueSigners);
  }
  

  _partialSign(message) {
    const signData = message.serialize();
    const signers = Array.prototype.slice.call(arguments, 1); // Get all arguments except the first
  
    signers.forEach(function(signer) {
      const signature = sign(signData, signer.secretKey);
      this._addSignature(signer.publicKey, toBuffer(signature));
    }, this); // Pass the correct context (this) for _addSignature
  }
  

  addSignature(pubkey, signature) {
    this._compile(); // Ensure signatures array is populated
    this._addSignature(pubkey, signature);
  }
  
  _addSignature(pubkey, signature) {
    invariant(signature.length === 64);

    const index = this.signatures.findIndex(sigpair =>
      pubkey.equals(sigpair.publicKey),
    );
    if (index < 0) {
      throw new Error(`unknown signer: ${pubkey.toString()}`);
    }

    this.signatures[index].signature = Buffer.from(signature);
  }  

  verifySignatures(requireAllSignatures) {
    const signatureErrors = this._getMessageSignednessErrors(
      this.serializeMessage(),
      requireAllSignatures,
    );
    return !signatureErrors;
  }
  
  _getMessageSignednessErrors(
    message,
    requireAllSignatures,
  ) {
    const errors = {};
    for (const {signature, publicKey} of this.signatures) {
      if (signature === null) {
        if (requireAllSignatures) {
          (errors.missing ||= []).push(publicKey);
        }
      } else {
        if (!verify(signature, message, publicKey.toBytes())) {
          (errors.invalid ||= []).push(publicKey);
        }
      }
    }
    return errors.invalid || errors.missing ? errors : undefined;
  }  

  serialize(config) {
    const {requireAllSignatures, verifySignatures} = Object.assign(
      {requireAllSignatures: true, verifySignatures: true},
      config,
    );

    const signData = this.serializeMessage();
    if (verifySignatures) {
      const sigErrors = this._getMessageSignednessErrors(
        signData,
        requireAllSignatures,
      );
      if (sigErrors) {
        let errorMessage = 'Signature verification failed.';
        if (sigErrors.invalid) {
          errorMessage += `\nInvalid signature for public key${
            sigErrors.invalid.length === 1 ? '' : '(s)'
          } [\`${sigErrors.invalid.map(p => p.toBase58()).join('`, `')}\`].`;
        }
        if (sigErrors.missing) {
          errorMessage += `\nMissing signature for public key${
            sigErrors.missing.length === 1 ? '' : '(s)'
          } [\`${sigErrors.missing.map(p => p.toBase58()).join('`, `')}\`].`;
        }
        throw new Error(errorMessage);
      }
    }

    return this._serialize(signData);
  }  

  _serialize(signData) {
    const { signatures } = this;
    const signatureCount = [];
    shortvec.encodeLength(signatureCount, signatures.length);
    const transactionLength = signatureCount.length + signatures.length * 64 + signData.length;
    const wireTransaction = Buffer.alloc(transactionLength);
    invariant(signatures.length < 256);
    Buffer.from(signatureCount).copy(wireTransaction, 0);
    signatures.forEach(({ signature }, index) => {
      if (signature !== null) {
        invariant(signature.length === 64, `signature has invalid length`);
        Buffer.from(signature).copy(
          wireTransaction,
          signatureCount.length + index * 64,
        );
      }
    });
    signData.copy(
      wireTransaction,
      signatureCount.length + signatures.length * 64,
    );
    invariant(
      wireTransaction.length <= PACKET_DATA_SIZE,
      `Transaction too large: ${wireTransaction.length} > ${PACKET_DATA_SIZE}`
    );
    return wireTransaction;
  }

  static from(buffer) {
    // Slice up wire data
    let byteArray = [...buffer];

    const signatureCount = shortvec.decodeLength(byteArray);
    let signatures = [];
    for (let i = 0; i < signatureCount; i++) {
      const signature = guardedSplice(byteArray, 0, SIGNATURE_LENGTH_IN_BYTES);
      signatures.push(bs58.encode(Buffer.from(signature)));
    }

    return Transaction.populate(Message.from(byteArray), signatures);
  }

  static populate(message, signatures = []) {
    const transaction = new Transaction();
    transaction.recentBlockhash = message.recentBlockhash;
    if (message.header.numRequiredSignatures > 0) {
      transaction.feePayer = message.accountKeys[0];
    }
    signatures.forEach((signature, index) => {
      const sigPubkeyPair = {
        signature:
          signature == bs58.encode(DEFAULT_SIGNATURE)
            ? null
            : bs58.decode(signature),
        publicKey: message.accountKeys[index],
      };
      transaction.signatures.push(sigPubkeyPair);
    });

    message.instructions.forEach(instruction => {
      const keys = instruction.accounts.map(account => {
        const pubkey = message.accountKeys[account];
        return {
          pubkey,
          isSigner:
            transaction.signatures.some(
              keyObj => keyObj.publicKey.toString() === pubkey.toString()
            ) || message.isAccountSigner(account),
          isWritable: message.isAccountWritable(account),
        };
      });

      transaction.instructions.push(
        new TransactionInstruction({
          keys,
          programId: message.accountKeys[instruction.programIdIndex],
          data: bs58.decode(instruction.data),
        })
      );
    });

    transaction._message = message;
    transaction._json = transaction.toJSON();

    return transaction;
  }

}

module.exports = {
  TransactionInstruction,
  Transaction,
  TransactionStatus,
  DEFAULT_SIGNATURE,
  SignaturePubkeyPair,
  TransactionCtorFields,
  TransactionBlockhashCtor,
  TransactionNonceCtor,
  NonceInformation,
};
