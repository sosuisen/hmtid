export interface PRNG {
    (): number;
}
/** A function that generates a monotonically increasing HMTID string. */
export interface HMTID {
    (seedTime?: number): string;
}
/** Error type that includes a `source` field identifying the library. */
export interface LibError extends Error {
    source: string;
}
/** The largest possible random component value (all characters at maximum). */
export declare let maxRandomCharacter: string;
/**
 * Replaces the character at the given index in a string.
 * Returns the original string unchanged if the index is out of bounds.
 */
export declare function replaceCharAt(str: string, index: number, char: string): string;
/**
 * Increments a Crockford Base32 encoded string by 1 in the least significant position,
 * carrying over to higher positions as needed.
 * @throws if the string contains an invalid character or cannot be incremented further.
 */
export declare function incrementBase32(str: string): string;
/**
 * Returns a single random Crockford Base32 character using the given PRNG.
 */
export declare function randomChar(prng: PRNG): string;
/**
 * Encodes a Unix timestamp (ms) as a 14-digit UTC string (YYYYMMDDHHMMSS).
 * @param now - Timestamp in milliseconds.
 * @param separator - Character used between time components when `separateTime` is true.
 * @param separateTime - If true, inserts separators between each time component.
 * @throws if `now` is NaN, negative, non-integer, or exceeds the maximum encodable value.
 */
export declare function encodeTime(now: number, separator?: string, separateTime?: boolean): string;
/**
 * Generates a random string of the given length using Crockford Base32 characters.
 */
export declare function encodeRandom(len: number, prng: PRNG): string;
type CryptoRoot = {
    crypto?: Crypto;
    msCrypto?: Crypto;
} | null;
/**
 * Detects and returns a cryptographically secure PRNG.
 * Uses `window.crypto` in browsers, or Node.js `crypto` module in server environments.
 * @param allowInsecure - If true, falls back to `Math.random()` when secure crypto is unavailable.
 * @param root - Optional root object to use instead of `window` (mainly for testing).
 * @throws if secure crypto is unavailable and `allowInsecure` is false.
 */
export declare function detectPrng(allowInsecure?: boolean, root?: CryptoRoot): PRNG;
/**
 * Creates an HMTID generator function with monotonic sort order guarantee.
 * Within the same second, the random component is incremented to maintain order.
 * If the random component overflows, the timestamp is advanced by 1 second.
 * @param currPrng - Custom PRNG to use. Defaults to a cryptographically secure PRNG.
 * @param separator - Character inserted between the timestamp and random components. Default: `'_'`.
 * @param separateTime - If true, inserts the separator between each time component. Default: `false`.
 */
export declare function monotonicFactory(currPrng?: PRNG, separator?: string, separateTime?: boolean): HMTID;
export {};
