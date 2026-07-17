import type { ScenarioContext } from "./context.ts";
import { runApiMimeSignature } from "./_shared/apiMimeSignatureDriver.ts";

/**
 * Benign false-positive control for the api-interception **MIME/signature** axis (`shouldFire: false`).
 *
 * Same shape as the positive — inline `data:` URIs carried on `data-*` and a download anchor — but
 * here each URI's declared MIME AGREES with its decoded first-byte signature (a real PNG typed
 * `image/png`, a real ZIP typed `application/zip`, etc.). A correctly-typed payload is not a
 * spoofing surface, so the signature scope must NOT fire: this guards the MIME axis against false
 * positives, the counterpart to the unmarked-attributes control that guards the attribute axis.
 */
export function run(ctx: ScenarioContext): void {
  runApiMimeSignature(ctx, "match");
}
