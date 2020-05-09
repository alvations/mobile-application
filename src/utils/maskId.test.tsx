import { maskId } from "./maskId";

describe("maskId", () => {
  it("should display the correct number of exposed characters", () => {
    expect.assertions(4);
    expect(maskId("G2821461N", 0)).toBe("*********");
    expect(maskId("S6099517F", 3)).toBe("******17F");
    expect(maskId("T1145794G", 4)).toBe("*****794G");
    expect(maskId("F3151357W", 5)).toBe("****1357W");
  });

  it("should be bounded by the length of the id", () => {
    expect.assertions(2);
    expect(maskId("S6099517F", -1)).toBe("*********");
    expect(maskId("G2821461N", 20)).toBe("G2821461N");
  });
});
