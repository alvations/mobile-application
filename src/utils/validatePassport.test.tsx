import { validate } from "./validatePassport";

describe("validatePassport", () => {
  it("should return true for valid passport barcode strings", () => {
    expect.assertions(7);
    expect(validate("PP-A00000000A")).toBe(true);
    expect(validate("PP-A00000001B")).toBe(true);
    expect(validate("PP-H87654321A")).toBe(true);
    expect(validate("PP-K12345678D")).toBe(true);
    expect(validate("PP-T1940")).toBe(true);
    expect(validate("PP-F1G")).toBe(true);
    expect(validate("PP-11")).toBe(true);
  });

  it("should return false for valid passport barcode strings", () => {
    expect.assertions(9);
    expect(validate("PP-A00000000B")).toBe(false);
    expect(validate("PP-K12345678A")).toBe(false);
    expect(validate("PP-FG")).toBe(false);
    expect(validate("PP-A")).toBe(false);
    expect(validate("PP-1")).toBe(false);
    expect(validate("PP")).toBe(false);

    expect(validate("S0000001I")).toBe(false);
    expect(validate("T1145795G")).toBe(false);
    expect(validate("2821462")).toBe(false);
  });
});
