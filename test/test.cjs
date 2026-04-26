const assert = require("assert")
const FakeTimers = require("@sinonjs/fake-timers")

const HMTID = require("../dist/index.umd.js")

const VALID_BASE32 = /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]+$/

describe("hmtid", function() {
  describe("replaceCharAt", function() {
    it("replaces character at given index", function() {
      assert.strictEqual("ABXDE", HMTID.replaceCharAt("ABCDE", 2, "X"))
    })

    it("replaces first character", function() {
      assert.strictEqual("XBCDE", HMTID.replaceCharAt("ABCDE", 0, "X"))
    })

    it("replaces last character", function() {
      assert.strictEqual("ABCDX", HMTID.replaceCharAt("ABCDE", 4, "X"))
    })

    it("throws when index is out of bounds", function() {
      assert.throws(() => HMTID.replaceCharAt("ABCDE", 10, "X"))
    })
  })

  describe("increment base32", function() {
    it("increments correctly", function() {
      assert.strictEqual("A109D", HMTID.incrementBase32("A109C"))
    })

    it("carries correctly", function() {
      assert.strictEqual("A1Z00", HMTID.incrementBase32("A1YZZ"))
    })

    it("double increments correctly", function() {
      assert.strictEqual("A1Z01", HMTID.incrementBase32(HMTID.incrementBase32("A1YZZ")))
    })

    it("throws when it cannot increment", function() {
      assert.throws(function() {
        HMTID.incrementBase32("ZZZ")
      })
    })

    it("throws on invalid character", function() {
      assert.throws(function() {
        HMTID.incrementBase32("A1_Z")
      })
    })
  })

  describe("prng", function() {
    const prng = HMTID.detectPrng()

    it("should produce a number", function() {
      assert(!isNaN(prng()))
    })

    it("should be between 0 and 1", function() {
      const num = prng()
      assert(num >= 0 && num <= 1)
    })
  })

  describe("randomChar", function() {
    const sample = {}
    const prng = HMTID.detectPrng()

    before(function() {
      for (let x = 0; x < 320000; x++) {
        let char = String(HMTID.randomChar(prng))
        if (sample[char] === undefined) {
          sample[char] = 0
        }
        sample[char] += 1
      }
    })

    it("should never return undefined", function() {
      assert.strictEqual(undefined, sample["undefined"])
    })

    it("should never return an empty string", function() {
      assert.strictEqual(undefined, sample[""])
    })

    it("throws when PRNG returns 1", function() {
      assert.throws(() => HMTID.randomChar(() => 1))
    })
  })

  describe("encodeTime", function() {
    it("should return expected encoded result", function() {
      assert.strictEqual("20211015064449", HMTID.encodeTime(1634280289042))
    })

    it("separates numbers by hyphen", function() {
      assert.strictEqual("2021-10-15-06-44-49", HMTID.encodeTime(1634280289042, '-', true))
    })

    it("separates numbers by underbar", function() {
      assert.strictEqual("2021_10_15_06_44_49", HMTID.encodeTime(1634280289042, '_', true))
    })

    it("throws when time is NaN", function() {
      assert.throws(function() { HMTID.encodeTime(NaN) })
    })

    it("throws when time is negative", function() {
      assert.throws(function() { HMTID.encodeTime(-1) })
    })

    it("throws when time exceeds maximum", function() {
      assert.throws(function() { HMTID.encodeTime(Math.pow(2, 48)) })
    })

    it("throws when time is not an integer", function() {
      assert.throws(function() { HMTID.encodeTime(1634280289042.5) })
    })
  })

  describe("encodeRandom", function() {
    const prng = HMTID.detectPrng()

    it("should return correct length", function() {
      assert.strictEqual(12, HMTID.encodeRandom(12, prng).length)
    })

    it("should only contain valid Base32 characters", function() {
      assert(VALID_BASE32.test(HMTID.encodeRandom(100, prng)))
    })
  })

  describe("hmtid", function() {
    it("should return correct length", function() {
      const hmtid = HMTID.monotonicFactory();
      assert.strictEqual(22, hmtid().length)
    })

    it("should return correct length when separator is hyphen", function() {
      const hmtid = HMTID.monotonicFactory(undefined, '-');
      assert.strictEqual(22, hmtid().length)
    })

    it("should use hyphen as separator between timestamp and random component", function() {
      const hmtid = HMTID.monotonicFactory(undefined, '-');
      assert.strictEqual("20211015070216-", hmtid(1634281336026).slice(0, 15))
    })

    it("should return correct length when separated by hyphen with time separation", function() {
      const hmtid = HMTID.monotonicFactory(undefined, '-', true);
      assert.strictEqual(27, hmtid().length)
    })

    it("should return expected time component result", function() {
      const hmtid = HMTID.monotonicFactory();
      assert.strictEqual("20211015070216_", hmtid(1634281336026).slice(0, 15))
    })

    it("should return expected time component result separated by hyphen", function() {
      const hmtid = HMTID.monotonicFactory(undefined, '-', true);
      assert.strictEqual("2021-10-15-07-02-16-", hmtid(1634281336026).slice(0, 20))
    })

    it("should return expected time component result separated by underbar", function() {
      const hmtid = HMTID.monotonicFactory(undefined, '_', true);
      assert.strictEqual("2021_10_15_07_02_16_", hmtid(1634281336026).slice(0, 20))
    })

    it("should generate IDs in monotonically increasing order", function() {
      const hmtid = HMTID.monotonicFactory()
      const ids = Array.from({ length: 100 }, () => hmtid())
      const sorted = [...ids].sort()
      assert.deepStrictEqual(ids, sorted)
    })
  })

  describe("monotonicity", function() {
    function stubbedPrng() {
      return 0.96
    }

    describe("without seedTime", function() {
      const stubbedHmtid = HMTID.monotonicFactory(stubbedPrng)
      let clock

      before(function() {
        clock = FakeTimers.install({
          now: 1634282804081,
          toFake: ["Date"],
        })
      })

      after(function() {
        clock.uninstall()
      })

      it("first call", function() {
        assert.strictEqual("20211015072644_YYYYYYY", stubbedHmtid())
      })

      it("second call", function() {
        assert.strictEqual("20211015072644_YYYYYYZ", stubbedHmtid())
      })

      it("third call", function() {
        assert.strictEqual("20211015072644_YYYYYZ0", stubbedHmtid())
      })

      it("fourth call", function() {
        assert.strictEqual("20211015072644_YYYYYZ1", stubbedHmtid())
      })
    })

    describe("with seedTime", function() {
      const stubbedHmtid = HMTID.monotonicFactory(stubbedPrng)

      it("first call", function() {
        assert.strictEqual("20160730223616_YYYYYYY", stubbedHmtid(1469918176385))
      })

      it("second call with the same", function() {
        assert.strictEqual("20160730223616_YYYYYYZ", stubbedHmtid(1469918176385))
      })

      it("third call with less than", function() {
        assert.strictEqual("20160730223616_YYYYYZ0", stubbedHmtid(100000000))
      })

      it("fourth call with even more less than", function() {
        assert.strictEqual("20160730223616_YYYYYZ1", stubbedHmtid(10000))
      })

      it("fifth call with 1 greater than", function() {
        assert.strictEqual("20160730223616_YYYYYZ2", stubbedHmtid(1469918176386))
      })

      it("sixth call with 1000 greater than", function() {
        assert.strictEqual("20160730223617_YYYYYYY", stubbedHmtid(1469918177385))
      })
    })
  })

  describe("force increment seedTime", function() {
    function stubbedPrng() {
      return 0.99
    }

    describe("with seedTime", function() {
      const stubbedHmtid = HMTID.monotonicFactory(stubbedPrng)

      it("first call", function() {
        assert.strictEqual("20160730223616_ZZZZZZZ", stubbedHmtid(1469918176385))
      })

      it("second call with the same", function() {
        assert.strictEqual("20160730223617_0000000", stubbedHmtid(1469918176385))
      })

      it("third call with less than", function() {
        assert.strictEqual("20160730223617_0000001", stubbedHmtid(100000000))
      })

      it("fourth call with even more less than", function() {
        assert.strictEqual("20160730223617_0000002", stubbedHmtid(10000))
      })

      it("fifth call with 1 greater than", function() {
        assert.strictEqual("20160730223617_0000003", stubbedHmtid(1469918176386))
      })

      it("sixth call with 1000 greater than", function() {
        assert.strictEqual("20160730223617_0000004", stubbedHmtid(1469918177385))
      })

      it("seventh call with 1001 greater than", function() {
        assert.strictEqual("20160730223617_0000005", stubbedHmtid(1469918177386))
      })

      it("eighth call with 2000 greater than", function() {
        assert.strictEqual("20160730223618_ZZZZZZZ", stubbedHmtid(1469918178385))
      })
    })
  })
})
