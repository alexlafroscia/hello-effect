import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

export function read<T>(
  readable: ReadableStream<T>,
): Effect.Effect<never, unknown, ReadableStreamDefaultReadResult<T>> {
  return Effect.acquireUseRelease(
    // Acquire the `Reader` that we're going to use
    Effect.sync(() => readable.getReader()),
    // Try to read from the `Reader`
    (reader) => Effect.tryPromise(() => reader.read()),
    // Cancel on release; this is safe even if the read is completed
    (reader) =>
      pipe(
        Effect.promise(() => reader.cancel()),
        Effect.tap(() => Effect.logDebug("Cancelled reader")),
        Effect.flatMap(() => Effect.sync(() => reader.releaseLock())),
        Effect.tap(() => Effect.logDebug("Released lock from reader")),
        Effect.flatMap(() => Effect.promise(() => readable.cancel())),
        Effect.tap(() => Effect.logDebug("Cancelled readable")),
        Effect.tap(() =>
          Effect.logDebug(`Readable is locked? ${readable.locked}`)
        ),
      ),
  );
}
