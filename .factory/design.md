# Visual thesis: the dispatch desk, printed twice

## Direction

Paid Before Ship Gate uses a tactile risograph collage. The interface looks like a working dispatch desk: paper orders, a coral HOLD stamp, green clearance marks, torn tape, and registration offsets. This fits a product whose job is a physical checkpoint. The texture makes status feel handled and deliberate without making payment evidence look like financial scoring.

The visual hierarchy stays operational. Ink texture appears in the hero, section edges, stamps, and empty states. Forms and tables remain clean enough for daily work. The product is intentionally light-mode only because cream paper and overprinted ink are the core metaphor; every surface paints its background explicitly.

## Tokens

- `--paper: #f4eedf` — warm stock, main background.
- `--paper-light: #fffaf0` — raised sheets and form fields.
- `--ink: #172a2d` — near-black teal, primary text.
- `--ink-muted: #526364` — secondary text; 5.4:1 on paper.
- `--coral: #cf3f35` — hold stamp and danger emphasis.
- `--coral-dark: #892b28` — coral text on pale surfaces.
- `--blue: #126a78` — links, focus, active controls.
- `--blue-dark: #084a56` — filled action contrast.
- `--mustard: #e7ae2e` — warnings and tape details.
- `--green: #28734f` — paid and cleared states.
- `--line: #172a2d` — structural rules.

All normal text meets 4.5:1 contrast. Status always includes a word and shape, never color alone.

## Type and spacing

Display type uses self-hosted Atkinson Hyperlegible Bold. Its blunt, open forms read like screen-printed warehouse labels while remaining highly legible. Body and numeric data use self-hosted Atkinson Hyperlegible Regular with tabular figures. No remote font requests are made.

The scale is 16, 18, 22, 30, and clamp(40–72) px. Body line-height is 1.55. Spacing uses an 8 px base with 4 px optical adjustments. Content measures 68 characters; the order table may expand to 1180 px.

## Shape and layout

Paper sheets use square corners with one clipped corner, 2 px ink rules, and small offset shadows. Primary actions look like blue ink blocks. Status marks are rotated stamps. The landing hero is asymmetric: copy occupies the left work area while an illustrated packing checkpoint overlaps ledger strips on the right. Mobile drops the overlap and turns the board into stacked order tickets.

## Interaction and motion

The signature motion is a single 180 ms stamp-down when an order changes from held to cleared. Sheets settle 4 px on entry. Controls use direct pressed states and visible teal focus rings. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed; status changes use an instant ink-color swap.

## Original asset plan and provenance

Hero art: a generated wide risograph collage of a tiny seller's packing table, with an open parcel, payment receipt shapes, a gate bar, and large blank paper areas. It contains no readable text, logos, people, or provider marks. The asset supports the story but carries no required information. Hand-authored SVG marks cover the favicon, install icons, and UI symbols.

Prompt sheet: `Use case: stylized-concept. Asset type: landing-page hero illustration. A tactile two-colour risograph editorial collage of a tiny mail-order seller's packing checkpoint, viewed slightly overhead. An open cardboard parcel waits behind a simple gate bar; receipt slips and order sheets sit nearby; one green clearance token passes the gate while one coral hold token waits. Cream recycled paper, dark teal ink, coral red overprint, small mustard tape accents, coarse halftone dots, torn-paper edges, imperfect ink registration, bold negative space. No people, no hands, no readable text, no numbers, no logos, no watermark, no gradients, no glossy 3D, no photorealism.`

- Generator: factory image deployment through `/opt/fleet/lib/gen-image.sh`.
- Date: 2026-08-28.
- License/provenance: original generated asset commissioned for this product; no reference images or third-party artwork.

