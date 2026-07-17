import type { ScenarioContext } from "./context.ts";
import { runApiMimeSignature } from "./_shared/apiMimeSignatureDriver.ts";

/**
 * api-interception positive on the **declared-MIME vs first-byte-signature** axis: `data:` URIs that
 * declare one content type (`image/png`, `image/jpeg`, `application/json`) while their decoded first
 * bytes are a different format (GIF, PDF, HTML, ZIP, WASM). This is content-type spoofing / payload
 * smuggling — a surface the module's declared payload-signature scope should flag.
 *
 * Ahead of the detector's CURRENT attribute-marker signal (see the manifest `notes`); network-free
 * (data: URIs on non-fetching surfaces only). All planting/injection lives in the shared driver.
 */
export function run(ctx: ScenarioContext): void {
  runApiMimeSignature(ctx, "mismatch");
}
