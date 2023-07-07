import { pipe } from "@effect/data/Function";
import * as Duration from "@effect/data/Duration";
import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import * as LoggerLevel from "@effect/io/Logger/Level";
import * as Option from "@effect/data/Option";

import { input } from "./lib/stdin/read.ts";
import { sigint } from "./lib/sigint.ts";

const program = Effect.raceAll([
  input("What is your name?"),

  // 5 second timeout
  pipe(
    Effect.sleep(Duration.seconds(5)),
    Effect.map(() => Option.some("Timeout")),
  ),

  // Cancel on `Ctrl-C`
  pipe(
    sigint(),
    Effect.map(() => Option.some("Cancelled!")),
  ),
]);

const answer = await Effect.runPromise(
  Logger.withMinimumLogLevel(program, LoggerLevel.Debug),
);

console.log(`Done! ${answer}`);
