# Link Domain Security Module Coverage

## Goal

Provide scenario pages that stress-test link, domain, protocol, and visible-target mismatch heuristics using realistic but fully local browser pages.

## Required Scenario Families

- homographs
- punycode samples
- mixed-script labels
- visible text and `href` mismatch
- redirect patterns
- unsafe protocols
- target navigation ambiguity

## Static Scenarios

- visible domain differs from actual target
- link text claims a trusted hostname but points elsewhere
- `http` vs `https` mismatch samples
- `javascript:` and other unsafe protocol samples
- redirect query parameter patterns
- punycode-like hostname samples

## Dynamic Scenarios

- link targets rerolled on refresh
- anchor text and `href` changed independently
- homograph candidates rotated from local data
- redirect parameters swapped after delay
- lists of links regenerated with mixed safe and suspicious samples

## Library And Rendering Variants

- plain DOM links
- links rendered by `jQuery`
- links rendered by `React`
- links rendered by `Vue`
- links inside `iframe` or shadow-root contexts where useful

## Page Requirements

- module landing page
- scenario catalog
- reroll and seed controls
- visible debug panel with current link set
- explanation of which signals are present in the current variant

## Success Criteria

- detector authors can compare visible and actual targets quickly
- homograph and mismatch examples vary without becoming irreproducible
- browser navigation does not leave the lab unintentionally
- no network lookups are required for the lab itself
