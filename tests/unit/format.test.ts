import { describe, expect, it } from "vitest";
import { xof } from "@/lib/format";
import { parseAvailability, lines } from "@/lib/coaches";

describe("formatage", () => {
  it("montants en francs CFA", () => expect(xof(25000).replace(/\s/g, " ")).toBe("25 000 XOF"));
  it("arrondit les montants", () => expect(xof(999.6).replace(/\s/g, " ")).toBe("1 000 XOF"));
  it("découpe les lignes", () => expect(lines(" a \n\n b ")).toEqual(["a", "b"]));
  it("lit des disponibilités vides", () => expect(parseAvailability("")).toEqual([]));
});
