type EnvConfig = {
  BASE_URL: string;
  FUNCTIONALITY_LEVEL: string;
};

const rawEnv = import.meta.env;

const env: EnvConfig = {
  BASE_URL: rawEnv.VITE_BASE_URL,
  FUNCTIONALITY_LEVEL: rawEnv.VITE_FUNCTIONALITY_LEVEL
};

if (!env.BASE_URL) {
  throw new Error("Missing critical environment variable: VITE_BASE_URL");
}

if (!env.FUNCTIONALITY_LEVEL) {
  throw new Error("Missing critical environment: VITE_FUNCTIONALITY_LEVEL")
}

export default env;
