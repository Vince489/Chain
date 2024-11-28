class SystemProgram {
  constructor() {}

  static programId = new PublicKey('11111111111111111111111111111111');

  static createAccount(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.Create;
    const data = encodeData(type, {
      vinnies: params.vinnies,
      space: params.space,
      programId: toBuffer(params.programId.toBuffer()),
    });

    return new TransactionInstruction({
      keys: [
        { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
        { pubkey: params.newAccountPubkey, isSigner: true, isWritable: true },
      ],
      programId: this.programId,
      data,
    });
  }

  static transfer(params) {
    let data;
    let keys;
    if (params.basePubkey) {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.TransferWithSeed;
      data = encodeData(type, {
        vinnies: BigInt(params.vinnies),
        seed: params.seed,
        programId: toBuffer(params.programId.toBuffer()),
      });
      keys = [
        { pubkey: params.fromPubkey, isSigner: false, isWritable: true },
        { pubkey: params.basePubkey, isSigner: true, isWritable: false },
        { pubkey: params.toPubkey, isSigner: false, isWritable: true },
      ];
    } else {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
      data = encodeData(type, { vinnies: BigInt(params.vinnies) });
      keys = [
        { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
        { pubkey: params.toPubkey, isSigner: false, isWritable: true },
      ];
    }

    return new TransactionInstruction({
      keys,
      programId: this.programId,
      data,
    });
  }

  static assign(params) {
    let data;
    let keys;
    if (params.basePubkey) {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed;
      data = encodeData(type, {
        base: toBuffer(params.basePubkey.toBuffer()),
        seed: params.seed,
        programId: toBuffer(params.programId.toBuffer()),
      });
      keys = [
        { pubkey: params.accountPubkey, isSigner: false, isWritable: true },
        { pubkey: params.basePubkey, isSigner: true, isWritable: false },
      ];
    } else {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.Assign;
      data = encodeData(type, {
        programId: toBuffer(params.programId.toBuffer()),
      });
      keys = [{ pubkey: params.accountPubkey, isSigner: true, isWritable: true }];
    }

    return new TransactionInstruction({
      keys,
      programId: this.programId,
      data,
    });
  }

  static createAccountWithSeed(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed;
    const data = encodeData(type, {
      base: toBuffer(params.basePubkey.toBuffer()),
      seed: params.seed,
      vinnies: params.vinnies,
      space: params.space,
      programId: toBuffer(params.programId.toBuffer()),
    });

    let keys = [
      { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
      { pubkey: params.newAccountPubkey, isSigner: false, isWritable: true },
    ];
    if (!params.basePubkey.equals(params.fromPubkey)) {
      keys.push({
        pubkey: params.basePubkey,
        isSigner: true,
        isWritable: false,
      });
    }

    return new TransactionInstruction({
      keys,
      programId: this.programId,
      data,
    });
  }

  static createNonceAccount(params) {
    const transaction = new Transaction();
    if (params.basePubkey && params.seed) {
      transaction.add(
        SystemProgram.createAccountWithSeed({
          fromPubkey: params.fromPubkey,
          newAccountPubkey: params.noncePubkey,
          basePubkey: params.basePubkey,
          seed: params.seed,
          vinnies: params.vinnies,
          space: NONCE_ACCOUNT_LENGTH,
          programId: this.programId,
        })
      );
    } else {
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: params.fromPubkey,
          newAccountPubkey: params.noncePubkey,
          vinnies: params.vinnies,
          space: NONCE_ACCOUNT_LENGTH,
          programId: this.programId,
        })
      );
    }

    const initParams = {
      noncePubkey: params.noncePubkey,
      authorizedPubkey: params.authorizedPubkey,
    };

    transaction.add(this.nonceInitialize(initParams));
    return transaction;
  }

  static nonceInitialize(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount;
    const data = encodeData(type, {
      authorized: toBuffer(params.authorizedPubkey.toBuffer()),
    });

    const instructionData = {
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    };

    return new TransactionInstruction(instructionData);
  }

  static nonceAdvance(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount;
    const data = encodeData(type);

    const instructionData = {
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: params.authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    };

    return new TransactionInstruction(instructionData);
  }

  static nonceWithdraw(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount;
    const data = encodeData(type, { vinnies: params.vinnies });

    return new TransactionInstruction({
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        { pubkey: params.toPubkey, isSigner: false, isWritable: true },
        {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: params.authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  static nonceAuthorize(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount;
    const data = encodeData(type, {
      authorized: toBuffer(params.newAuthorizedPubkey.toBuffer()),
    });

    return new TransactionInstruction({
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        { pubkey: params.authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  static allocate(params) {
    let data;
    let keys;
    if (params.basePubkey) {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed;
      data = encodeData(type, {
        base: toBuffer(params.basePubkey.toBuffer()),
        seed: params.seed,
        space: params.space,
        programId: toBuffer(params.programId.toBuffer()),
      });
      keys = [
        { pubkey: params.accountPubkey, isSigner: false, isWritable: true },
        { pubkey: params.basePubkey, isSigner: true, isWritable: false },
      ];
    } else {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.Allocate;
      data = encodeData(type, {
        space: params.space,
      });
      keys = [{ pubkey: params.accountPubkey, isSigner: true, isWritable: true }];
    }

    return new TransactionInstruction({
      keys,
      programId: this.programId,
      data,
    });
  }
}

export { SystemProgram };
