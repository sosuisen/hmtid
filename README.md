# Human-readable Monotonic Timestamp Identifier (HMTID)

> This is reduced and modified fork of [ulid](https://github.com/ulid/javascript)

- HMTID begins with a 14-digits human-readable timestamp (YYYYMMDDHHMMSS). 
  - The timestamps in most IDs, including ulid, are encoded in a shorter form. HTMID does not encode timestamp digits.
- HMTID ends with 7 random characters (Crockford's Base32) which have monotonic sort order. It correctly detects and handles the same second.
- HMTID is not suitable for universal use. It is suitable for naming local files with human-readable, monotonously and slowly generated IDs, avoiding collisions.

## Spec
- 14-digits current UTC timestamp (YYYYMMDDHHMMSS).
  - e.g.) 20211015134707 (shows 2021-10-15 13:47:07 UTC)
- 7 random characters. Crockford's Base32 is used as shown. This alphabet excludes the letters I, L, O, and U to avoid confusion and abuse.

```
0123456789ABCDEFGHJKMNPQRSTVWXYZ
```

- An separator (underbar '_' or hyphen '-') that separates a timestamp and a random characters. Default is an underbar.
- 22 characters in total.

(optional) 
- 14 digits timestamp can be separated by underbar '_' or hyphen '-'. e.g.) YYYY_MM_DD_HH_MM_SS, YYYY-MM-DD-HH-MM-SS 
- In such case, 27 characters in total.

## Monotonicity

When generating a HMTID within the same second, we can provide some guarantees regarding sort order. Namely, if the same second is detected, the random characters is incremented by 1 bit in the least significant bit position (with carrying). 

The increment algorithm is similar to ulid, but the difference is that it does not throw an Error when the increment fails.

For example:

```
hmtid() // 202110130900_GEMMVRX
hmtid() // 202110130900_GEMMVRY <- Monotonic increment in the same second
...
hmtid() // 202110130900_ZZZZZZZ
hmtid() // 202110130901_0000000  <- It does not throw new Error()!
hmtid() // 202110130901_0000001
hmtid() // 202110130901_0000002
hmtid() // 202110130902_E3ACF82
hmtid() // 202110130903_XER13D3
```

If increment of random characters fails, the timestamp will be forced to be incremented ahead of time. Random characters starts from '0000000'. This reduces the accuracy of the timestamp, but gives priority to monotonicity.


## Install with NPM

```
npm i hmtid
```

### Import

```javascript
import { monotonicFactory } from 'hmtid'
```

## Usage

```javascript
import { monotonicFactory } from 'hmtid'
const hmtid = monotonicFactory();

hmtid() // 20211013090001_GEMMVRX
```

### Seed Time

You can also input a seed time which will consistently give you the same string for the time component. The default seed time is `Date.now()`.

```
hmtid(1469918176385) // 20160730223616_1M0MRXV

```

### Use separators

```
const hmtid = monotonicFactory(undefined, '-');

hmtid() // 20211013090001-A5M3MXZ
```

```
const hmtid = monotonicFactory(undefined, '_', true);

hmtid() // 2021_10_13_09_00_01_GAS28DA
```

```
const hmtid = monotonicFactory(undefined, '-', true);

hmtid() // 2021-10-13-09-00-01-GAS28DA
```

## Test Suite

```
npm test
```
