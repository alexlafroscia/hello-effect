import { deferred } from "https://deno.land/std@0.192.0/async/deferred.ts";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

export function sigint(): Effect.Effect<never, unknown, "SIGINT"> {
  const d = deferred();

  function handleSignal() {
    d.resolve();
  }

  return Effect.acquireUseRelease({
    acquire: pipe(
      Effect.sync(() => {
        Deno.addSignalListener("SIGINT", handleSignal);
      }),
      Effect.tap(() => Effect.log("listener added", { level: "Debug" })),
    ),
    use: () =>
      pipe(
        Effect.tryPromise(() => d),
        Effect.map(() => "SIGINT" as const),
      ),
    release: () =>
      pipe(
        Effect.sync(() => {
          // Make sure the `Promise` is "closed" in case we didn't use it
          d.resolve();

          Deno.removeSignalListener("SIGINT", handleSignal);
        }),
        Effect.tap(() => Effect.log("listener removed", { level: "Debug" })),
      ),
  });
}
