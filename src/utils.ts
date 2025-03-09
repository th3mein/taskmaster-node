import config from "./config";

export function add(a: number, b: number): number {
  if (config.debug) {
    console.debug(`calling add function with arguments ${a} and ${b}`);
  }
  const obj = {
    hello: "world",
  };
  const c = 7;
  return a + b;
}
