// Reads the API key from .env if the file exists. Imported first by index.js.
// (Done here instead of with Node's --env-file flag, because on Node 22
// "--watch" crashes when .env is missing, and the helper should still start
// so it can print its clear "key is missing" message.)
try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
  console.log(".env not found. Continuing without it.");
}
