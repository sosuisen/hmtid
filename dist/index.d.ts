export interface PRNG {
    (): number;
}
export interface HMTID {
    (seedTime?: number): string;
}
export interface LibError extends Error {
    source: string;
}
export declare let maxRandomCharacter: string;
export declare function replaceCharAt(str: string, index: number, char: string): string;
export declare function incrementBase32(str: string): string;
export declare function randomChar(prng: PRNG): string;
export declare function encodeTime(now: number): string;
export declare function encodeRandom(len: number, prng: PRNG): string;
export declare function detectPrng(allowInsecure?: boolean, root?: any): PRNG;
export declare function monotonicFactory(currPrng?: PRNG): HMTID;
export declare const hmtid: HMTID;
