import test from "node:test";
import assert from "node:assert/strict";
import { checkEmail, checkName, checkPassword, passwordStrength, suggestEmail } from "../src/lib/auth-validate.ts";
import { inboxLink } from "../src/components/auth/VerifyScreen.tsx";

test("email: empty, malformed and fine", () => {
  assert.match(checkEmail("  "), /Enter your email/);
  for (const bad of ["a", "a@", "a@b", "a b@c.com", "@c.com", "a@@c.com", "a@c..com"]) assert.notEqual(checkEmail(bad), "", bad);
  for (const ok of ["a@b.co", " name.surname+tag@mail.example.com ", "x@y.in"]) assert.equal(checkEmail(ok), "", ok);
});

test("name: required, trimmed, 80 at most", () => {
  assert.notEqual(checkName("   "), "");
  assert.equal(checkName(" Yaseen "), "");
  assert.notEqual(checkName("x".repeat(81)), "");
});

test("password: length, common choices and the email name are refused", () => {
  assert.match(checkPassword(""), /Create a password/);
  assert.match(checkPassword("short"), /at least 8/);
  assert.match(checkPassword("password"), /easy to guess/);
  assert.match(checkPassword("Password123"), /easy to guess/); // case does not hide a common password
  assert.notEqual(checkPassword("aaaaaaaaaa"), "");
  assert.match(checkPassword("yaseenkhatib1", "yaseenkhatib@gmail.com"), /email name/);
  assert.equal(checkPassword("correct horse battery", "a@b.co"), "");
  assert.notEqual(checkPassword("x".repeat(201)), "");
});

test("password strength rises with length and variety, and refused passwords are weak", () => {
  assert.equal(passwordStrength("password"), "weak");
  assert.equal(passwordStrength("abcdefgh"), "okay");
  assert.ok(["good", "strong"].includes(passwordStrength("Tr0ub4dor&3x")));
  assert.equal(passwordStrength("correct-Horse-battery-9!"), "strong");
});

test("typo suggestions fix the domain only and leave good addresses alone", () => {
  assert.equal(suggestEmail("sam@gmial.com"), "sam@gmail.com");
  assert.equal(suggestEmail("sam@gmail.con"), "sam@gmail.com");
  assert.equal(suggestEmail("sam@GMAIL.CON"), "sam@gmail.com");
  assert.equal(suggestEmail("sam@gmail.com"), null);
  assert.equal(suggestEmail("sam@company.in"), null);
  assert.equal(suggestEmail("nope"), null);
});

test("the inbox shortcut exists only for services we know", () => {
  assert.equal(inboxLink("a@gmail.com")?.name, "Gmail");
  assert.equal(inboxLink("a@hotmail.com")?.name, "Outlook");
  assert.equal(inboxLink("a@mycompany.in"), null);
});
