# Human-readable Monotonic Timestamp Identifier (HMTID)

> This is reduced and modified fork of [ulid](https://github.com/ulid/javascript)

- HMTID begins with a 12-digits human-readable timestamp (YYYYMMDDHHMMSS). 
  - The timestamps in most IDs, including ulid, are encoded in a shorter form. HTMID does not encode timestamp digits.
- HMTID ends with 7 random characters (Crockford's Base32) which have monotonic sort order. It correctly detects and handles the same second.
- HMTID is not suitable for universal use. It is suitable for naming local objects with human-readable, monotonic IDs.

## Spec
- 12-digits current UTC timestamp (YYYYMMDDHHMMSS).
  - e.g.) 20211015134707 (when the current UTC time is 2021-10-15 13:47:07)
- 7 random characters. Crockford's Base32 is used as shown. This alphabet excludes the letters I, L, O, and U to avoid confusion and abuse.

```
0123456789ABCDEFGHJKMNPQRSTVWXYZ
```

- An underbar (_) that separates a timestamp and a random characters.
- 20 characters in total.

## Examples
```
hmtid(); // 202110130900_GEMMVRX
hmtid(); // 202110130900_GEMMVRY (Monotonic increment in the same second)
hmtid(); // 202110130901_0GXTSR7
```

## Install with NPM

```
npm i hmtid
```

### Import

```javascript
import { hmtid } from 'hmtid'
```

## Usage

```javascript
import { ulid } from 'ulid'

ulid() // 202110130900_GEMMVRX
```
## Test Suite

```
npm test
```
