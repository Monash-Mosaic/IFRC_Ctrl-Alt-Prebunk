import { access, copyFile } from 'fs/promises';
import { constants } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
const examplePath = resolve(process.cwd(), '.env.example');

const exists = async (path) => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const ensureEnv = async () => {
  const envExists = await exists(envPath);
  if (envExists) {
    return;
  }

  const exampleExists = await exists(examplePath);
  if (!exampleExists) {
    return;
  }

  await copyFile(examplePath, envPath);
};

await ensureEnv();
