import { DEMO_FIXTURES } from "./demo-fixtures.mjs";

export function createDemoState() {
  return structuredClone({
    stores: DEMO_FIXTURES.stores,
    tasks: DEMO_FIXTURES.tasks,
    taskSequence: 1,
  });
}
