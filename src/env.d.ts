// Minimal shim to allow using process.env without installing @types/node
declare const process: {
  env: Record<string, string | undefined>;
};


