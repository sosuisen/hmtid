function createError(message) {
    const err = new Error(message);
    err.source = "hmtid";
    return err;
}
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
const ENCODING_LEN = ENCODING.length;
const TIME_MAX = Math.pow(2, 48) - 1;
const RANDOM_LEN = 7;
export let maxRandomCharacter = "";
for (let i = 0; i < RANDOM_LEN; i++)
    maxRandomCharacter += ENCODING[ENCODING_LEN - 1];
let minRandomCharacter = "";
for (let i = 0; i < RANDOM_LEN; i++)
    minRandomCharacter += ENCODING[0];
export function replaceCharAt(str, index, char) {
    if (index > str.length - 1) {
        return str;
    }
    return str.substr(0, index) + char + str.substr(index + 1);
}
export function incrementBase32(str) {
    let done = undefined;
    let index = str.length;
    let char;
    let charIndex;
    const maxCharIndex = ENCODING_LEN - 1;
    while (!done && index-- >= 0) {
        char = str[index];
        charIndex = ENCODING.indexOf(char);
        if (charIndex === -1) {
            throw createError("incorrectly encoded string");
        }
        if (charIndex === maxCharIndex) {
            str = replaceCharAt(str, index, ENCODING[0]);
            continue;
        }
        done = replaceCharAt(str, index, ENCODING[charIndex + 1]);
    }
    if (typeof done === "string") {
        return done;
    }
    throw createError("cannot increment this string");
}
export function randomChar(prng) {
    let rand = Math.floor(prng() * ENCODING_LEN);
    if (rand === ENCODING_LEN) {
        rand = ENCODING_LEN - 1;
    }
    return ENCODING.charAt(rand);
}
export function encodeTime(now, separator = '_', separateTime = false) {
    if (isNaN(now)) {
        throw new Error(now + " must be a number");
    }
    if (now > TIME_MAX) {
        throw createError("cannot encode time greater than " + TIME_MAX);
    }
    if (now < 0) {
        throw createError("time must be positive");
    }
    if (Number.isInteger(now) === false) {
        throw createError("time must be an integer");
    }
    if (separateTime)
        return new Date(now).toISOString().replace(/^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).+?$/, `$1${separator}$2${separator}$3${separator}$4${separator}$5${separator}$6`);
    else
        return new Date(now).toISOString().replace(/^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).+?$/, '$1$2$3$4$5$6');
}
export function encodeRandom(len, prng) {
    let str = "";
    for (; len > 0; len--) {
        str = randomChar(prng) + str;
    }
    return str;
}
export function detectPrng(allowInsecure = false, root) {
    if (!root) {
        root = typeof window !== "undefined" ? window : null;
    }
    const browserCrypto = root && (root.crypto || root.msCrypto);
    if (browserCrypto) {
        return () => {
            const buffer = new Uint8Array(1);
            browserCrypto.getRandomValues(buffer);
            return buffer[0] / 0xff;
        };
    }
    else {
        try {
            const nodeCrypto = require("crypto");
            return () => nodeCrypto.randomBytes(1).readUInt8() / 0xff;
        }
        catch (e) { }
    }
    if (allowInsecure) {
        try {
            console.error("secure crypto unusable, falling back to insecure Math.random()!");
        }
        catch (e) { }
        return () => Math.random();
    }
    throw createError("secure crypto unusable, insecure Math.random not allowed");
}
export function monotonicFactory(currPrng, separator = '_', separateTime = false) {
    if (!currPrng) {
        currPrng = detectPrng();
    }
    let lastTime = 0;
    let lastRandom;
    let overflowedTime = 0;
    return function (seedTime) {
        if (isNaN(seedTime)) {
            seedTime = Date.now();
        }
        if (seedTime < overflowedTime) {
            seedTime = overflowedTime;
        }
        if (Math.floor(seedTime / 1000) <= Math.floor(lastTime / 1000)) {
            if (lastRandom === maxRandomCharacter) {
                // Force increment seedTime when lastRandom cannot be incremented.
                lastTime = (seedTime / 1000 + 1) * 1000; // 1sec
                overflowedTime = lastTime;
                const incrementedRandom = (lastRandom = minRandomCharacter);
                return encodeTime(lastTime, separator, separateTime) + separator + incrementedRandom;
            }
            const incrementedRandom = (lastRandom = incrementBase32(lastRandom));
            return encodeTime(lastTime, separator, separateTime) + separator + incrementedRandom;
        }
        lastTime = seedTime;
        const newRandom = (lastRandom = encodeRandom(RANDOM_LEN, currPrng));
        return encodeTime(seedTime, separator, separateTime) + separator + newRandom;
    };
}
