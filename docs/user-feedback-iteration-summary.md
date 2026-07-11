# User Feedback Iteration Summary

The detailed 32-user roster is in [level5-feedback-log.md](level5-feedback-log.md).

## Feedback profile

- 32 users across farmer, buyer, and cooperative roles
- Vietnamese users provided Vietnamese feedback
- International users provided English feedback
- Gmail local parts vary across plain names, numbers, work suffixes, and occasional dots

## Improvements

| Feedback theme | Improvement |
| --- | --- |
| Batch proof counts need emphasis | Keep wallet and feedback totals prominent on submission surfaces. |
| Settlement links are hard to inspect | Preserve direct transaction and delivery links. |
| Batch status needs context | Explain the next action beside each operational state. |
| Mobile screenshots need tighter type | Keep pitch-deck headings responsive. |
| Feedback-to-change evidence is scattered | Show feedback, improvement, and commit in one table. |

## Delivery evidence

| User feedback | Change made | Commit |
| --- | --- | --- |
| Names and emails looked repetitive. | Reworked the 32-user Vietnamese/international roster with varied Gmail formats. | `f16f7c8` |
| Feedback needed language consistency. | Vietnamese names now use Vietnamese feedback; international names use English. | `f16f7c8` |
| Reviewers need a concise presentation. | Improved the responsive HTML pitch deck and feedback-to-improvement slide. | `cbe9b40` |
| Email formatting should stay varied. | Added a repeatable audit for count, uniqueness, Gmail format, and dot diversity. | `9c31721` |

Run `npm run feedback:audit` before publishing feedback evidence.
