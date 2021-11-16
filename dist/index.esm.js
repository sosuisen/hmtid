function createError(message) {
    var err = new Error(message);
    err.source = "hmtid";
    return err;
}
var ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
var ENCODING_LEN = ENCODING.length;
var TIME_MAX = Math.pow(2, 48) - 1;
var RANDOM_LEN = 7;
var maxRandomCharacter = "";
for (var i = 0; i < RANDOM_LEN; i++) {
    maxRandomCharacter += ENCODING[ENCODING_LEN - 1];
}var minRandomCharacter = "";
for (var _i = 0; _i < RANDOM_LEN; _i++) {
    minRandomCharacter += ENCODING[0];
}function replaceCharAt(str, index, char) {
    if (index > str.length - 1) {
        return str;
    }
    return str.substr(0, index) + char + str.substr(index + 1);
}
function incrementBase32(str) {
    var done = undefined;
    var index = str.length;
    var char = void 0;
    var charIndex = void 0;
    var maxCharIndex = ENCODING_LEN - 1;
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
function randomChar(prng) {
    var rand = Math.floor(prng() * ENCODING_LEN);
    if (rand === ENCODING_LEN) {
        rand = ENCODING_LEN - 1;
    }
    return ENCODING.charAt(rand);
}
function encodeTime(now) {
    var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '_';
    var separateTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

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
    if (separateTime) return new Date(now).toISOString().replace(/^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).+?$/, "$1" + separator + "$2" + separator + "$3" + separator + "$4" + separator + "$5" + separator + "$6");else return new Date(now).toISOString().replace(/^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).+?$/, '$1$2$3$4$5$6');
}
function encodeRandom(len, prng) {
    var str = "";
    for (; len > 0; len--) {
        str = randomChar(prng) + str;
    }
    return str;
}
function detectPrng() {
    var allowInsecure = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var root = arguments[1];

    if (!root) {
        root = typeof window !== "undefined" ? window : null;
    }
    var browserCrypto = root && (root.crypto || root.msCrypto);
    if (browserCrypto) {
        return function () {
            var buffer = new Uint8Array(1);
            browserCrypto.getRandomValues(buffer);
            return buffer[0] / 0xff;
        };
    } else {
        try {
            var nodeCrypto = require("crypto");
            return function () {
                return nodeCrypto.randomBytes(1).readUInt8() / 0xff;
            };
        } catch (e) {}
    }
    if (allowInsecure) {
        try {
            console.error("secure crypto unusable, falling back to insecure Math.random()!");
        } catch (e) {}
        return function () {
            return Math.random();
        };
    }
    throw createError("secure crypto unusable, insecure Math.random not allowed");
}
function monotonicFactory(currPrng) {
    var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '_';
    var separateTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (!currPrng) {
        currPrng = detectPrng();
    }
    var lastTime = 0;
    var lastRandom = void 0;
    var overflowedTime = 0;
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
                var _incrementedRandom = lastRandom = minRandomCharacter;
                return encodeTime(lastTime, separator, separateTime) + separator + _incrementedRandom;
            }
            var incrementedRandom = lastRandom = incrementBase32(lastRandom);
            return encodeTime(lastTime, separator, separateTime) + separator + incrementedRandom;
        }
        lastTime = seedTime;
        var newRandom = lastRandom = encodeRandom(RANDOM_LEN, currPrng);
        return encodeTime(seedTime, separator, separateTime) + separator + newRandom;
    };
}

export { maxRandomCharacter, replaceCharAt, incrementBase32, randomChar, encodeTime, encodeRandom, detectPrng, monotonicFactory };
