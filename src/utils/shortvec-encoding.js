function decodeLength(bytes) {
  let len = 0;
  let size = 0;
  for (;;) {
    let elem = bytes.shift();
    len |= (elem & 0x7f) << (size * 7);
    size += 1;
    if ((elem & 0x80) === 0) {
      break;
    }
  }
  return len;
}

function encodeLength(bytes, len) {
  let rem_len = len;
  for (;;) {
    let elem = rem_len & 0x7f;
    rem_len >>= 7;
    if (rem_len == 0) {
      bytes.push(elem);
      break;
    } else {
      elem |= 0x80;
      bytes.push(elem);
    }
  }
}

module.exports = { decodeLength, encodeLength };
