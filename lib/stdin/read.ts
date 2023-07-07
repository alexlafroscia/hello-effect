import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Option from "@effect/data/Option";

import { prepare } from "./common.ts";

export function input(
  _prompt: string,
): Effect.Effect<never, unknown, Option.Option<string>> {
  const buffer = new Uint8Array(1024);

  const readFromStdin = Effect.acquireUseRelease(
    Effect.sync(() => Deno.stdin.read(buffer)),
    (input) =>
      pipe(
        Effect.logDebug("Starting read from stdin"),
        Effect.flatMap(() => Effect.tryPromise(() => input)),
        Effect.tap(() => Effect.logDebug("Finished reading from stdin")),
      ),
    () =>
      pipe(
        Effect.logDebug("closing stdin..."),
        Effect.flatMap(() => Effect.sync(() => Deno.stdin.close())),
        Effect.tap(() => Effect.logDebug("closed stdin")),
      ),
  );

  return pipe(
    readFromStdin,
    Effect.tap(() => Effect.logDebug("Finished releasing stdin")),
    Effect.map((result) => Option.fromNullable(result)),
    Effect.map((result) =>
      pipe(
        result,
        // Retreive the contents of the buffer
        Option.map((result) => buffer.subarray(0, result)),
        // Decode it as a `string`
        prepare,
      )
    ),
  );
}
