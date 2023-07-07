import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

export function read<T>(
  readable: ReadableStream<T>,
): Effect.Effect<never, unknown, ReadableStreamDefaultReadResult<T>> {
  return pipe(
    Effect.acquireUseRelease(
      // Acquire the `Reader` that we're going to use
      Effect.sync(() => readable.getReader()),
      // Try to read from the `Reader`
      (reader) =>
        pipe(
          Effect.logDebug("Starting to read"),
          Effect.flatMap(() => Effect.tryPromise(() => reader.read())),
        ),
      (reader) =>
        pipe(
          // Effect.promise(() => reader.cancel()),
          // Effect.tap(() => Effect.logDebug("Cancelled reader")),
          Effect.sync(() => reader.releaseLock()),
          Effect.tap(() => Effect.logDebug("Released lock from reader")),
        ),
    ),
    Effect.logSpan("readable-stream-read"),
  );
}
