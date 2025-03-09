import { add } from "../src/utils";

jest.mock("../src/config", () => ({
  debug: true,
}));
it("add 1 + 2 to equal to 3", () => {
  expect(add(1, 2)).toBe(3);
});
