import { pipe } from "@effect/data/Function";
import * as Option from "@effect/data/Option";

export function prepare(
  input: Option.Option<Uint8Array>,
): Option.Option<string> {
  const decoder = new TextDecoder();

  return pipe(
    input,
    Option.map((value) => decoder.decode(value)),
    Option.map((value) => value.replace("\n", "").replace("\r", "")),
  );
}
