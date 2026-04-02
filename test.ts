import { processQuery } from './src/agent/hermes';

async function main() {
  try {
    const res = await processQuery("hai", "test-123");
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
