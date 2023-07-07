import { deferred } from "https://deno.land/std@0.192.0/async/deferred.ts";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

export function sigint(): Effect.Effect<never, unknown, "SIGINT"> {
  const d = deferred();

  function handleSignal() {
    d.resolve();
  }

  return Effect.acquireUseRelease(
    pipe(
      Effect.sync(() => {
        Deno.addSignalListener("SIGINT", handleSignal);
      }),
      Effect.tap(() => Effect.logDebug("listener added")),
    ),
    () =>
      pipe(
        Effect.tryPromise(() => d),
        Effect.map(() => "SIGINT" as const),
      ),
    () =>
      pipe(
        Effect.sync(() => {
          // Make sure the `Promise` is "closed" in case we didn't use it
          d.resolve();

          Deno.removeSignalListener("SIGINT", handleSignal);
        }),
        Effect.tap(() => Effect.logDebug("listener removed")),
      ),
  );
}
