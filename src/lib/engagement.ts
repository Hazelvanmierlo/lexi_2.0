export type AgeBand = "klein" | "groot";

export function ageBandFor(groep: number): AgeBand {
  return groep <= 4 ? "klein" : "groot";
}
