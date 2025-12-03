
import { repairSvg } from "../lib/svg";

const testCases = [
  '<svg width="100" height="100"><rect x="10" y="10" width="30" height="30" fill="red">',
  '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /',
  '<svg><text x="10" y="20">Hello Wor',
  '<svg><path d="M 10 10 L 90 90 V 10 Z" fil',
  '<svg>',
];

testCases.forEach((svg, index) => {
  console.log(`\n--- Case ${index + 1} ---`);
  console.log("Input:", svg);
  const repaired = repairSvg(svg);
  console.log("Repaired:", repaired);
});

