# Human-readable Monotonic Timestamp Identifier (HMTID)

> This is a reduced and modified fork of [ulid](https://github.com/ulid/javascript)

- HMTID begins with a 14-digit human-readable timestamp (YYYYMMDDHHMMSS). 
  - The timestamps in most IDs, including ulid, are encoded in a shorter form. HMTID does not encode timestamp digits.
- HMTID ends with 7 random characters (Crockford's Base32) with monotonic sort order. It correctly detects and handles the same second.

- e.g.) `20260426035700_QZ998PX`

- HMTID is not suitable for universal use. It is suitable for naming local files with human-readable, monotonically and infrequently generated IDs, avoiding collisions.

## Spec
- 14-digit current UTC timestamp (YYYYMMDDHHMMSS).
  - e.g.) 20211015134707 (shows 2021-10-15 13:47:07 UTC)
- 7 random characters. Crockford's Base32 is used as shown. This alphabet excludes the letters I, L, O, and U to avoid confusion and abuse.

```
0123456789ABCDEFGHJKMNPQRSTVWXYZ
```

- A separator (underbar '_' or hyphen '-') that separates the timestamp and random characters. Default is an underbar.
- 22 characters in total.

(optional) 
- 14-digit timestamp can be separated by underbar '_' or hyphen '-'. e.g.) YYYY_MM_DD_HH_MM_SS, YYYY-MM-DD-HH-MM-SS 
- In that case, 27 characters in total.

## Monotonicity

When generating an HMTID within the same second, we can provide some guarantees regarding sort order. Namely, if the same second is detected, the random component is incremented by 1 in the least significant position (with carrying).

The increment algorithm is similar to ulid, but the difference is that it does not throw an Error when the increment fails.

For example:

```
hmtid() // 20211013090000_GEMMVRX
hmtid() // 20211013090000_GEMMVRY <- Monotonic increment in the same second
...
hmtid() // 20211013090000_ZZZZZZZ
hmtid() // 20211013090001_0000000  <- It does not throw new Error()!
hmtid() // 20211013090001_0000001
hmtid() // 20211013090001_0000002
hmtid() // 20211013090002_E3ACF82
hmtid() // 20211013090003_XER13D3
```

If the increment of random characters fails, the timestamp will be forced to advance ahead of time. Random characters start from '0000000'. This reduces the accuracy of the timestamp, but gives priority to monotonicity.


## Install with NPM

```
npm i hmtid
```

### Import

```javascript
import { monotonicFactory } from 'hmtid'
```

## Usage on Node.js

```javascript
import { monotonicFactory } from 'hmtid'
const hmtid = monotonicFactory();

hmtid(); // 20211013090001_GEMMVRX
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

## Usage on Web Browser

### UMD via `<script>` tag

Load `index.umd.js` and access the library via the global `HMTID` object.

```html
<script src="https://cdn.jsdelivr.net/npm/hmtid/dist/index.umd.js"></script>
<script>
  const hmtid = HMTID.monotonicFactory();
  console.log(hmtid()); // 20211013090001_GEMMVRX
</script>
```

### ESM via `<script type="module">`

```html
<script type="module">
  import { monotonicFactory } from 'https://cdn.jsdelivr.net/npm/hmtid/dist/index.esm.js';
  const hmtid = monotonicFactory();
  console.log(hmtid()); // 20211013090001_GEMMVRX
</script>
```

### Use separators on Web Browser

```html
<script src="https://cdn.jsdelivr.net/npm/hmtid/dist/index.umd.js"></script>
<script>
  const hmtidHyphen    = HMTID.monotonicFactory(undefined, '-');
  const hmtidUnder     = HMTID.monotonicFactory(undefined, '_', true);
  const hmtidHyphenSep = HMTID.monotonicFactory(undefined, '-', true);

  hmtidHyphen();    // 20211013090001-A5M3MXZ
  hmtidUnder();     // 2021_10_13_09_00_01_GAS28DA
  hmtidHyphenSep(); // 2021-10-13-09-00-01-GAS28DA
</script>
```

## Test Suite

```
npm test
```

## Test on Web Browser

`npx serve .` and open http://localhost:3000/browser-test/