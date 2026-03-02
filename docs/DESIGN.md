# GasTown — Game Design Document

## Design Intent

GasTown is a moral witness game, not a game about winning. Players survive through complicity and measure the cost of that survival through a hidden stat (Dissociation) revealed only in the ending.

The game's central design challenge: making the player feel the psychological weight of survival in an impossible system without reducing the Holocaust to a puzzle to be optimized.

## The Dissociation Mechanic (Key Design Decision)

The original README described a "Humanity" stat. GasTown uses **Dissociation** instead, for these reasons:

1. **Historical accuracy**: Psychological dissociation was a documented coping mechanism among Sonderkommando and other forced laborers. It was not a moral failure — it was a survival mechanism.

2. **Hidden from the player**: Dissociation is not displayed during gameplay. This mirrors the historical reality: the psychological distancing that made survival possible was itself invisible to those experiencing it.

3. **Revealed in the ending**: When the player reaches liberation (or death), Dissociation is revealed with its value and a narrative interpretation. This is the game's emotional climax — the moment of reckoning the player has been building toward without knowing it.

4. **Not a judgment**: High Dissociation does not mean the player "played wrong." The ending acknowledges that some people survived by becoming functionally numb, and that this was not a character failure but a cost imposed by the system.

## Three Endings

**The Witness** (low Dissociation): Survived with psychological presence intact. Can testify clearly. Corresponds to Nyiszli's actual post-war trajectory.

**The Empty** (high Dissociation): Survived but the self that arrived is not the self that left. Struggles to testify. The game does not judge this — it acknowledges it.

**The Fighter** (revolted on October 7 + low Dissociation): Fought during the Sonderkommando revolt. Barely survived. Can testify from a position of having acted, which is its own form of resolution.

## The Upgrade Screen: "Arrangements"

Deliberately titled "Arrangements" rather than "Upgrades." The historical Sonderkommando had to negotiate for small privileges — better quarters, extra rations — in transactions with their captors that were themselves morally compromised.

The screen title is part of the game's language of complicity: even the words you use to navigate the interface implicate you.

## Historical Accuracy

Every event in `events.json` is grounded in Nyiszli's memoir or corroborated historical record:

- The Hungarian transport period (May-July 1944): 437,000 people in 56 days
- Mengele's use of Nyiszli as pathologist
- The twin studies
- The Sonderkommando revolt (October 7, 1944) — Krematorium IV
- Roza Robota's role in smuggling gunpowder from the Pulverraum
- Roza Robota's execution (January 6, 1945)
- The death marches (January 17, 1945)
- Soviet liberation of Auschwitz (January 27, 1945)

## What This Game is Not

- Not an optimization puzzle
- Not an entertainment product
- Not a simulator that reduces atrocity to resource management

The resource management IS the point: it creates complicity, then forces the player to reckon with it.

## Content Guidelines (for contributors)

- All historical content must be sourced
- Text should be understated — the mechanics carry the weight
- Pixel art should suggest rather than depict explicit violence
- Nothing gratuitous; everything in service of witness
