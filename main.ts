import { pipe } from "@effect/data/Function";
import * as Chunk from "@effect/data/Chunk";
import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import * as LoggerLevel from "@effect/io/Logger/Level";
import * as Option from "@effect/data/Option";

import { input } from "./lib/stdin/readable-stream.ts";
import * as StringUtils from "./lib/string.ts";

function loop(
  state: Chunk.Chunk<string>,
): Effect.Effect<never, unknown, Chunk.Chunk<string>> {
  return pipe(
    Effect.log("Starting loop", { level: "Debug" }),
    Effect.flatMap(() => pipe(input("Enter a name"), StringUtils.nonEmpty)),
    Effect.flatMap((value) =>
      pipe(
        value,
        Option.match({
          onNone: () =>
            pipe(
              Effect.succeed(state),
              Effect.tap(() =>
                Effect.log("Got empty entry", { level: "Debug" })
              ),
            ),
          onSome: (value) =>
            pipe(
              Effect.log(`Adding state ${value}`, { level: "Debug" }),
              Effect.flatMap(() => loop(Chunk.append(state, value))),
            ),
        }),
      )
    ),
  );
}

const program = pipe(
  loop(Chunk.empty()),
  Logger.withMinimumLogLevel(LoggerLevel.Debug),
);

const answer = await Effect.runPromise(program);

console.log(`Done! ${answer}`);
