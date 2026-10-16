# Sporefall — Idle Mycelium (design doc)

## Research takeaways
- The fun is the *pacing curve*: there should always be a next purchase that's close, and the first 3 buys should come in under a minute (Cookie Clicker, onboarding guides).
- Producers cost ×1.15 per copy (the standard), and milestones (10/25/50/100 owned) give *visible leaps* (×2), not +3% here and there.
- Prestige should feel like a fast-forward button. The first one should come early (~10–15 min) and be obviously worth it (Cookie Clicker heavenly chips, Antimatter Dimensions infinity).
- Skill trees are fun when points are scarce (you can afford ~50% of the tree per run), branches have an identity, capstones are mutually exclusive, and respec is generous (Unnamed Space Idle, Nodebuster, NGU).
- On mobile: the core loop fits on one screen, offline progress is generous but capped, there are big tap targets, and nothing punishes you for being away.

## Theme
You are a spore waking up under a forest floor. You tap the mushroom to absorb **Nutrients**, then grow a fungal network. In the end the network swallows the whole forest.

## Core loop
1. **Tap** the mushroom → Nutrients (with crits and floating number popups).
2. **Buy producers** (8 tiers: Hypha → Spore Pod → Mushroom Cap → Rotting Log → Fairy Ring → Root Web → Forest Floor → Gaia Network). Each tier is about 10× the cost and about 6× the output of the one before. Owning 10/25/50/100/150/200 of a producer doubles its output.
3. **Golden Truffles** pop up at random. Tap one for a burst of Nutrients or a 30s ×7 *Frenzy*.
4. **Sporulate (prestige)**: reset Nutrients and producers to earn **Spores** = floor(√(run Nutrients / 1e6)) × multipliers. Each *unspent* Spore gives +2% production, and Spores are also the skill-tree currency. Spend them or bank them? That's the first real choice.

## Skill tree (37 nodes, pannable/zoomable)
The tree has a root and three branches with 11 nodes each, plus 3 hybrid bridge nodes:
- **Feral (tap build)**: tap multipliers, crit chance/damage, taps that scale with production, auto-tapper. Capstone *Frenzy Bloom*.
- **Network (idle build)**: production multipliers, cost reductions, stronger milestones, a longer and more efficient offline cap. Capstone *Ancient Network* (+1% production per producer owned).
- **Rot (luck/prestige build)**: more frequent and stronger Truffles, more Spores, a stronger bank bonus, a head start after a reset. Capstone *Rotkeeper*.
- **Bridges** (Symbiosis, Compost, Lucky Strike): each one can be reached from either neighboring branch.
- **Capstones are mutually exclusive**: you can only own one.
- **Respec is free at any time** (you get every Spore back), so you can try out builds.

## Pacing targets
First producer at ~15 taps. First prestige available at 1e6 run Nutrients (~10–15 min). Later runs speed up through the tree.
