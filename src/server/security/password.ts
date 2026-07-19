import { Algorithm, hash, verify } from "@node-rs/argon2";

const passwordHashOptions = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19_456,
  outputLen: 32,
  parallelism: 1,
  timeCost: 2,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, passwordHashOptions);
}

export async function verifyPassword(
  encodedHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(encodedHash, password);
  } catch {
    return false;
  }
}
