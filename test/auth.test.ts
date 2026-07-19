import { describe, expect, it } from "vitest";
import { hashPassword, signJwt, verifyJwt, verifyPassword } from "../src/lib/auth";
import { Env } from "../src/types";

// Minimal env stub with only what the auth primitives touch.
const env = { JWT_SECRET: "test-secret-please-rotate" } as unknown as Env;

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("produces a salted, self-describing hash", async () => {
    const hash = await hashPassword("abc12345");
    expect(hash.startsWith("pbkdf2$")).toBe(true);
    expect(hash.split("$")).toHaveLength(4);
  });
});

describe("JWT sign/verify", () => {
  it("round-trips claims", async () => {
    const token = await signJwt(env, { sub: 42, email: "a@b.com", tier: "free" });
    const claims = await verifyJwt(env, token);
    expect(claims?.sub).toBe(42);
    expect(claims?.email).toBe("a@b.com");
    expect(claims?.tier).toBe("free");
  });

  it("rejects a tampered token", async () => {
    const token = await signJwt(env, { sub: 1, email: "x@y.com", tier: "premium" });
    const tampered = token.slice(0, -3) + "aaa";
    expect(await verifyJwt(env, tampered)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signJwt(env, { sub: 1, email: "x@y.com", tier: "free" }, -10);
    expect(await verifyJwt(env, token)).toBeNull();
  });
});
