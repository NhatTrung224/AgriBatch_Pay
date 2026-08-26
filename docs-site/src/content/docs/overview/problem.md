---
title: The settlement problem
description: Why one payment for one harvest becomes forty disputes, and what a record would actually have to prove.
---

## One container, forty growers

A buyer purchases a container of coffee. The container is not one farm's output — it is the season's crop from a cooperative, assembled from forty smallholdings.

Each grower brought a different quantity. Each sack was graded separately, and grade changes the price. The buyer pays once, into the cooperative. The cooperative then owes forty different people forty different amounts.

Everything that goes wrong in agricultural settlement happens in that last sentence.

## What goes wrong

**The weighing is not shared.** A farmer's sack is weighed at the collection point, in a ledger the farmer does not hold a copy of. When the payout arrives and it is lower than expected, there is nothing to check it against.

**The grading is a judgement.** Grade multiplies the price. It is assigned by an inspector, recorded in the same book, and by payout time nobody remembers who assigned what.

**The arithmetic happens once, privately.** Someone at the cooperative sums the lots and works out the shares. That sum is the single most consequential calculation in the chain, and it is done in a spreadsheet no farmer sees.

**The buyer cannot verify what they funded.** They wire against an invoice total. Whether that total was assembled honestly is not something they can check without auditing the cooperative's books.

**The delay hides all of it.** Weeks pass between delivery and payout. By then the collection-point notebook is gone.

None of this requires anyone to be dishonest. A calculation done once, privately, from records only one party holds, produces disputes even when everybody is acting in good faith — because nobody can *demonstrate* good faith.

## What a fix would have to prove

Not "the cooperative is trustworthy". Something narrower and checkable:

1. **This lot was registered** — this farmer, this weight, this price, this grade — and registered before the total was computed.
2. **The total is the sum of the lots**, computed by something with no stake in the answer.
3. **Quality was confirmed** at a specific moment, by a specific party, and not backdated.
4. **The buyer funded and approved** against that total, not a different one.
5. **Every step is timestamped and readable by everyone**, including the farmer who brought two sacks.

Notice what is absent: none of it requires holding anyone's money. The disputes are about the *record*, not about custody. The money already moves fine — it is the arithmetic behind it that nobody can see.

## What AgriBatch Pay does about it

It puts the record where no single party can edit it.

A batch is registered on a Soroban contract. Each farmer lot is added under the farmer's own signature, with weight, price and grade. **The contract computes the running total** — the application does not hand it a figure to store. Quality confirmation is a separate signed call. The buyer's funding and approval are two more.

Every one of those is a Stellar testnet transaction with a hash anyone can open.

So when a farmer asks why their share is what it is, the answer is a lot record on a public ledger carrying their own signature, and a total computed from every lot including theirs.

## Next

- [How AgriBatch Pay works](/AgriBatch_Pay/overview/how-it-works/) — the whole path in one page
- [What it does and does not do](/AgriBatch_Pay/overview/scope/) — the honest boundary, worth reading before you build on this
