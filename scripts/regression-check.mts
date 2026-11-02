import assert from "node:assert/strict";
import { ieltsResult } from "../src/lib/eligibility.ts";

const monash = { overall: 6.5, band: 6.0 };
const rmit = { overall: 6.5, band: 6.0 };
const deakin = { overall: 6.0, band: 6.0 };

const cases = [
  {
    name: "A: overall passes but Writing 5.5",
    scores: { overall: "6.5", listening: "6.0", reading: "6.0", writing: "5.5", speaking: "6.0" },
    expected: ["not-met", "not-met", "not-met"],
  },
  {
    name: "B: overall 6.5 and all components 6.0",
    scores: { overall: "6.5", listening: "6.0", reading: "6.0", writing: "6.0", speaking: "6.0" },
    expected: ["eligible", "eligible", "eligible"],
  },
  {
    name: "C: overall 6.0 and all components 6.0",
    scores: { overall: "6.0", listening: "6.0", reading: "6.0", writing: "6.0", speaking: "6.0" },
    expected: ["not-met", "not-met", "eligible"],
  },
  {
    name: "D: component scores missing",
    scores: { overall: "6.5", listening: "", reading: "", writing: "", speaking: "" },
    expected: ["verify", "verify", "verify"],
  },
] as const;

for (const test of cases) {
  const actual = [
    ieltsResult(monash, test.scores).status,
    ieltsResult(rmit, test.scores).status,
    ieltsResult(deakin, test.scores).status,
  ];
  assert.deepEqual(actual, [...test.expected], test.name);
  console.log(`PASS ${test.name}: ${actual.join(" / ")}`);
}

console.log("All IELTS regression checks passed.");
