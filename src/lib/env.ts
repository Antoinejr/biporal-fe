type EnvConfig = {
  BASE_URL: string;
};

const rawEnv = import.meta.env;

const env: EnvConfig = {
  BASE_URL: rawEnv.VITE_BASE_URL,
};

if (!env.BASE_URL) {
  throw new Error("Missing critical environment variable: VITE_BASE_URL");
}

export default env;
