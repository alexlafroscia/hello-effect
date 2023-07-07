import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Option from "@effect/data/Option";

type OptionalStringEffect = Effect.Effect<
  never,
  unknown,
  Option.Option<string>
>;

export function nonEmpty(input: OptionalStringEffect): OptionalStringEffect {
  return pipe(
    input,
    Effect.map((optional) =>
      pipe(
        optional,
        Option.tap((value) => (value ? Option.some(value) : Option.none())),
      )
    ),
  );
}
