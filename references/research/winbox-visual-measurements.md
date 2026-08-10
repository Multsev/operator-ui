# WinBox visual measurements

Measured from original official PNG files in `references/research/references`; DPI/zoom is unknown, so values are evidence ranges rather than native target sizes.

| Reference | Measured role | Approximate value |
|---|---|---:|
| WinBox 3 table screenshot 592×360 | row / header / tabs / child toolbar | 15–16 / 18 / 22 / 27 px |
| WinBox 3 main 829×601 | main toolbar / launcher row / launcher width | 28 / 22 / 112 px |
| WinBox 3 work area | canvas / chrome / table / header / selection | #A0A0A0 / #F0F0F0 / #FFFFFF / #D8D8D8 / #9DC0EA |
| older host-themed screenshot | title / chrome | #0A246A / #D4D0C8 |

The difference between historical title/chrome colors proves that semantic host roles are stable while exact hex values are not. Operator UI therefore uses an independent active-title blue and modern accessible focus, while retaining the measured density, 1 px separators and spatial MDI composition.
