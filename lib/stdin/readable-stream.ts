import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Option from "@effect/data/Option";

import { read } from "../readable-stream.ts";
import { prepare } from "./common.ts";

export function input(
  _prompt: string,
): Effect.Effect<never, unknown, Option.Option<string>> {
  return pipe(
    read(Deno.stdin.readable),
    Effect.map(({ value }) => Option.fromNullable(value)),
    Effect.map((value) => prepare(value)),
  );
}
