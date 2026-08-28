# Demo sandbox

- URL: `https://paid-before-ship-gate.sociobot.in/?demo=1` (the first-screen action); `/demo` is also supported.
- Sample: five orders, three ready outcomes, two unpaid holds, one saved customer rule, and varied partial-payment states.
- Reset: choose **Reset demo** in the persistent yellow demo banner.
- Exit: choose **Start for real**. Demo changes are discarded.
- Storage namespace: in-memory `sampleData()` state. Demo mode never opens, reads, or writes the real `paid-before-ship-gate` IndexedDB database.
- Offline: visit the demo once, wait for the service worker, then reload offline. The sample is bundled with the app.

The claim suite begins from a fresh browser context and uses only this route and its sample data.
