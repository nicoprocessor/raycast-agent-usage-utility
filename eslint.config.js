/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = [
  ...require("@raycast/eslint-config").flat(),
  { ignores: ["raycast-env.d.ts", "dist/**", "node_modules/**"] },
];
