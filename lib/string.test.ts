import { describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

import * as Effect from "@effect/io/Effect";
import * as Option from "@effect/data/Option";

import * as StringUtils from "./string.ts";

describe("StringUtils", () => {
  it("converts an empty string to `None`", () => {
    const input = Effect.succeed(Option.some(""));
    const output = StringUtils.nonEmpty(input);

    const unwrapped = Effect.runSync(output);

    assertEquals(unwrapped, Option.none());
  });
});
