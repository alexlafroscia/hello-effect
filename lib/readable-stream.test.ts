import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.192.0/testing/mock.ts";

import { StringReader } from "https://deno.land/std@0.192.0/io/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.193.0/streams/readable_stream_from_reader.ts";

import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import * as LoggerLevel from "@effect/io/Logger/Level";

import { read } from "./readable-stream.ts";

Deno.test("reading from a stream", async () => {
  const reader = new StringReader("foobar");
  const readable = readableStreamFromReader(reader);

  const RESOLVED_FIRST = "__first__" as const;

  const result = await Effect.runPromise(
    Effect.raceAll<
      never,
      unknown,
      ReadableStreamDefaultReadResult<Uint8Array> | typeof RESOLVED_FIRST
    >([Effect.promise(() => Promise.resolve(RESOLVED_FIRST)), read(readable)]),
  );

  assertEquals(result, RESOLVED_FIRST);
});

Deno.test("cancels the reader", async () => {
  const reader = new StringReader("foobar");
  const readable = readableStreamFromReader(reader);

  const logger = spy();
  const SpyLogger = Logger.make(({ logLevel, message }) => {
    logger(logLevel, message);
  });
  const layer = Logger.replace(Logger.defaultLogger, SpyLogger);

  const result = await Effect.runPromise(
    Effect.provideLayer(
      Logger.withMinimumLogLevel(read(readable), LoggerLevel.Debug),
      layer,
    ),
  );

  assertEquals(new TextDecoder().decode(result.value), "foobar");
  assertSpyCalls(logger, 2);
});
