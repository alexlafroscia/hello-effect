import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.192.0/testing/bdd.ts";
import { type Stub, stub } from "https://deno.land/std@0.192.0/testing/mock.ts";
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

import * as Effect from "@effect/io/Effect";

import { sigint } from "./sigint.ts";

describe("listening for `SIGINT`", () => {
  let addSignalListener: Stub<
    typeof Deno,
    Parameters<typeof Deno.addSignalListener>,
    ReturnType<typeof Deno.addSignalListener>
  >;
  let removeSignalListener: Stub<
    typeof Deno,
    Parameters<typeof Deno.removeSignalListener>,
    ReturnType<typeof Deno.removeSignalListener>
  >;

  beforeEach(() => {
    addSignalListener = stub(Deno, "addSignalListener");
    removeSignalListener = stub(Deno, "removeSignalListener");
  });

  afterEach(() => {
    // Restore the signal listeners
    addSignalListener.restore();
    removeSignalListener.restore();
  });

  it("resolves with the signal name when the signal is emitted", async () => {
    const program = sigint();

    const running = Effect.runPromise(program);

    // Check that we're listening for the signal correctly
    assertEquals(addSignalListener.calls.length, 1);
    assertEquals(addSignalListener.calls[0].args[0], "SIGINT");

    const handler = addSignalListener.calls[0].args[1];

    // Fake the signal being triggered
    handler();

    // Ensure the program exits with the expected value
    assertEquals(await running, "SIGINT");

    // Check that we stopped listening for the signal
    assertEquals(removeSignalListener.calls.length, 1);
    assertEquals(removeSignalListener.calls[0].args[0], "SIGINT");
    assertEquals(removeSignalListener.calls[0].args[1], handler);
  });

  it("still cleans up if the value is not used while listening", async () => {
    const program = Effect.raceAll<never, unknown, void>([
      sigint(),
      Effect.promise(() => Promise.resolve()),
    ]);

    // Check signal listener didn't resolve first
    assertEquals(await Effect.runPromise(program), undefined);

    // Signal handler was created
    assertEquals(addSignalListener.calls.length, 1);

    // Signal handler was cleaned up
    assertEquals(removeSignalListener.calls.length, 1);
    assertEquals(removeSignalListener.calls.length, 1);
  });
});
