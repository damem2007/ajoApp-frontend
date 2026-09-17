# Fixed contribution schedule — bug reproduction and policy decision

Status: defect reproduced; rounding decision pending. No financial records or signed agreements changed.

## Confirmed defect

`Shared milestones - demo` is a completed NGN circle with three members, weekly contributions, monthly payouts and a target of 100001 minor units (₦1,000.01). Its immutable contract contains 13 weekly debit dates split across monthly windows as 5 / 4 / 4. The current `calendar.schedule()` divides each monthly pot independently by the member count and that window's debit count. This produces ₦66.66/₦66.67 in the first window and ₦83.33/₦83.34 in subsequent windows. The existing tests checked pot conservation and equal lifetime totals, but did not check a fixed recurring debit amount.

Calendar months are not equal to four weeks. Keeping true weekly debit dates and true monthly payout dates naturally produces different counts per window. The error is changing the regular contribution amount to fill each window separately. Do not relabel four-week payouts as monthly or silently skip the fifth weekly contribution.

## Proposed fixed-debit rule

Let K be the total number of contribution dates in the locked cycle, N the enrolled member count and T the payout amount in integer minor units. Every member's lifetime contribution is T. If exact equal debits are required, the contribution amount must be T / K and T must be divisible by K. Assign that one amount to every debit date across the whole cycle. Carry settled surplus forward in the circle's ledger.

Before contract generation, check cumulative scheduled funding against cumulative payouts at every payout date. Reject unfunded schedules rather than generating a promise that the payment worker cannot honor. For example, some weekly/monthly anchors start with four debits instead of five, and can require explicit initial funding or a different agreed start/frequency. Initial funding is not assumed or silently introduced.

Retain per-contribution fee calculation using the fixed regular amount. Provider retry/date adjustments do not change a member's locked obligation. The existing runtime payout solvency check remains in place.

## Rounding choices requiring the user's decision

For this cycle K = 13 and T = 100001; exact equal debits cannot preserve that payout amount.

| Choice | Recurring contribution | Settlement / payout | Consequence |
| --- | --- | --- | --- |
| Recommended: exact equal debits | 13 × ₦76.92, or 13 × ₦76.93 | Target chosen before signing: ₦999.96 or ₦1,000.09 | No uneven debits; incompatible amounts are rejected with alternatives. Target is never changed automatically. |
| Preserve the target with a separate rounding settlement | 13 × ₦76.92 | One disclosed ₦0.05 contribution adjustment per member | Ordinary mandate remains fixed, but the extra settlement requires a separately represented and agreed payment rule. |

Implement only the selected policy. Neither policy permits overwriting the completed demo's agreement or dues. Preserve its historical display and identify the old schedule as a legacy example; a new corrected example requires a new circle/agreement. Changing historical totals would invalidate contract hashes, signatures and accounting evidence.

## Verification for the correction

- Reproduce the legacy 5 / 4 / 4 count with the actual start date, 2026-09-16.
- Assert equal regular debit amounts across the entire cycle, not just equal lifetime totals.
- Preserve all eight contribution/collection frequency labels and true calendar date semantics.
- Assert exact lifetime obligations, exact payouts, conservation and cumulative funding sufficiency.
- Exercise same-frequency schedules, month-end/leap-year anchors and insufficient initial funding.
- Check rounding incompatibility/alternatives, or the separately agreed rounding adjustment, according to the selected rule.
- Preserve completed and signed contract versions, existing ledger evidence, and current sandbox workflows.
