import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

export function read<T>(
  readable: ReadableStream<T>,
): Effect.Effect<never, unknown, ReadableStreamDefaultReadResult<T>> {
  return pipe(
    Effect.acquireUseRelease({
      // Acquire the `Reader` that we're going to use
      acquire: Effect.sync(() => readable.getReader()),
      // Try to read from the `Reader`
      use: (reader) =>
        pipe(
          Effect.log("Starting to read", { level: "Debug" }),
          Effect.flatMap(() => Effect.tryPromise(() => reader.read())),
        ),
      release: (reader) =>
        pipe(
          // Effect.promise(() => reader.cancel()),
          // Effect.tap(() => Effect.log("Cancelled reader", { level: "Debug" })),
          Effect.sync(() => reader.releaseLock()),
          Effect.tap(() =>
            Effect.log("Released lock from reader", { level: "Debug" })
          ),
        ),
    }),
    Effect.withSpan("readable-stream-read"),
  );
}
