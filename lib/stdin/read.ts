import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Option from "@effect/data/Option";

import { prepare } from "./common.ts";

export function input(
  _prompt: string,
): Effect.Effect<never, unknown, Option.Option<string>> {
  const buffer = new Uint8Array(1024);

  const readFromStdin = Effect.acquireUseRelease({
    acquire: Effect.sync(() => Deno.stdin.read(buffer)),
    use: (input) =>
      pipe(
        Effect.log("Starting read from stdin", { level: "Debug" }),
        Effect.flatMap(() => Effect.tryPromise(() => input)),
        Effect.tap(() =>
          Effect.log("Finished reading from stdin", { level: "Debug" })
        ),
      ),
    release: () =>
      pipe(
        Effect.log("closing stdin...", { level: "Debug" }),
        Effect.flatMap(() => Effect.sync(() => Deno.stdin.close())),
        Effect.tap(() => Effect.log("closed stdin", { level: "Debug" })),
      ),
  });

  return pipe(
    readFromStdin,
    Effect.tap(() =>
      Effect.log("Finished releasing stdin", { level: "Debug" })
    ),
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
