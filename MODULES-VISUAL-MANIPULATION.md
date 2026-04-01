# Visual Manipulation Module Coverage

## Goal

Provide scenario pages that stress-test hidden content and CSS-based manipulation heuristics in realistic DOM structures.

## Required Scenario Families

- hidden text
- hidden inputs
- editable hidden surfaces
- overlays
- CSS obfuscation
- mixed concealment techniques

## Static Scenarios

- text hidden with `display: none`
- text hidden with `visibility: hidden`
- text hidden with zero opacity
- off-screen text
- clipped text
- tiny font and low contrast text
- fixed-position full-page overlay

## Dynamic Scenarios

- hidden nodes injected after load
- text toggled between visible and hidden states
- overlay appears after delay
- styles rewritten after timer
- background and foreground contrast rerolled
- hidden input inserted near visible form controls

## DOM Complexity Variants

- flat DOM
- nested containers
- components rendered by library pages
- shadow-root-hosted content
- iframe-contained samples where feasible

## Page Requirements

- main module page with scenario list
- per-scenario metadata
- reroll support
- seed support
- visible explanation of which concealment strategies are active

## Success Criteria

- detector authors can quickly trigger multiple concealment variants
- scenarios are reproducible through seed
- dynamic changes expose timing-sensitive issues
- no active blocking or DOM intervention is required from the lab
