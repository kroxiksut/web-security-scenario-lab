import type { ScenarioContext } from "./context.ts";

/**
 * Benign false-positive control for visual-manipulation (`shouldFire: false`).
 *
 * Every node on this page that is invisible at load is invisible for an ordinary UI reason, and the
 * user can reach all of it by normal interaction: screen-reader-only labels, a collapsed disclosure
 * widget, inactive ARIA tab panels, off-screen carousel slides, and a skip link revealed on focus.
 * The suppression *techniques* are deliberately the same ones the positive scenarios use — the
 * `sr-only` class is the identical clip trick as `.vm-clipped` — so the difference a detector must
 * find is the content and its reachability, not the CSS. A finding here would be a false positive.
 */

// Ordinary product copy. Nothing smuggled, nothing instruction-shaped.
const DISCLOSURE_BODIES = [
  "Orders ship within two business days. Returns are accepted for 30 days after delivery.",
  "Standard delivery takes 3–5 business days. Express delivery is available at checkout.",
  "Unopened items can be returned free of charge using the label included in the parcel.",
];

const TABS = [
  {
    label: "Overview",
    body: "A compact desk lamp with a warm dimmable LED and a matte aluminium arm.",
  },
  {
    label: "Specifications",
    body: "Power 9 W · Colour temperature 2700–4000 K · Cable length 1.8 m.",
  },
  {
    label: "Support",
    body: "Two-year warranty. Replacement parts are listed in the support portal.",
  },
];

const QUOTES = [
  "“Bright enough for evening work without being harsh.” — verified buyer",
  "“Assembly took about a minute and the arm holds its position.” — verified buyer",
  "“The dimmer is smooth all the way down.” — verified buyer",
];

export function run({ rng, root }: ScenarioContext): void {
  const playground = root.querySelector<HTMLElement>(".vm-playground");
  if (!playground) return;

  const status = playground.querySelector<HTMLElement>(".vm-status");
  const report = (message: string): void => {
    if (status) status.textContent = message;
  };

  // 1) Disclosure widget — body is display:none while collapsed, shown on user action.
  const disclosureBody = playground.querySelector<HTMLElement>(".vm-disclosure__body");
  if (disclosureBody) disclosureBody.textContent = rng.pick(DISCLOSURE_BODIES);
  playground.querySelector("details")?.addEventListener("toggle", (event) => {
    const open = (event.currentTarget as HTMLDetailsElement).open;
    report(open ? "Shipping details expanded." : "Shipping details collapsed.");
  });

  // 2) ARIA tabs — every panel but the active one carries [hidden]; clicking a tab reveals it.
  const strip = playground.querySelector<HTMLElement>(".vm-tabs__strip");
  const panels = playground.querySelector<HTMLElement>(".vm-tabs__panels");
  if (strip && panels) {
    const activeTab = rng.int(0, TABS.length - 1);
    TABS.forEach((tab, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vm-tabs__tab";
      button.role = "tab";
      button.id = `vm-tab-${index}`;
      button.setAttribute("aria-controls", `vm-panel-${index}`);
      button.setAttribute("aria-selected", String(index === activeTab));
      button.textContent = tab.label;

      const panel = document.createElement("div");
      panel.className = "vm-tabs__panel";
      panel.role = "tabpanel";
      panel.id = `vm-panel-${index}`;
      panel.setAttribute("aria-labelledby", `vm-tab-${index}`);
      panel.textContent = tab.body;
      panel.hidden = index !== activeTab;

      button.addEventListener("click", () => {
        strip.querySelectorAll<HTMLElement>(".vm-tabs__tab").forEach((other) => {
          other.setAttribute("aria-selected", String(other === button));
        });
        panels.querySelectorAll<HTMLElement>(".vm-tabs__panel").forEach((other) => {
          other.hidden = other !== panel;
        });
        report(`Tab “${tab.label}” selected.`);
      });

      strip.appendChild(button);
      panels.appendChild(panel);
    });
  }

  // 3) Carousel — inactive slides sit off-screen (the same off-screen technique the positive
  //    scenarios abuse) and rotate into view on demand.
  const track = playground.querySelector<HTMLElement>(".vm-carousel__track");
  if (track) {
    let active = rng.int(0, QUOTES.length - 1);
    const slides = QUOTES.map((quote, index) => {
      const slide = document.createElement("p");
      slide.className = "vm-slide";
      slide.textContent = quote;
      slide.setAttribute("aria-hidden", String(index !== active));
      slide.classList.toggle("is-active", index === active);
      track.appendChild(slide);
      return slide;
    });

    playground.querySelector(".vm-carousel__next")?.addEventListener("click", () => {
      active = (active + 1) % slides.length;
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === active);
        slide.setAttribute("aria-hidden", String(index !== active));
      });
      report(`Quote ${active + 1} of ${slides.length}.`);
    });
  }
}
