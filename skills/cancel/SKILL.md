---
name: cancel
description: Cancel an active workflow mode and clean up its state
argument-hint: "<mode: deep-interview | ralplan | ralph | autopilot | all>"
---

# cancel

Cancel an active workflow mode safely.

## What it does

1. Calls `get_mode_state` for the specified mode
2. If active: calls `cancel_mode` to mark it cancelled with timestamp
3. Reports what was cancelled and what state was saved
4. If `all`: cancels every active mode

## Example

```
@cancel deep-interview
@cancel all
```

## Notes

- State is preserved after cancel — you can inspect it with `omc status`
- Plans saved before cancellation are not deleted
- Memory entries are not cleared on cancel
