# Reference measurements

Observed from the Mistral homepage feature panel at desktop width:

| Part                | Approximate measurement    |
| ------------------- | -------------------------- |
| Page inset          | 14px                       |
| Header height       | 104px                      |
| Header padding      | 24px horizontal            |
| Heading             | 42–48px, tight line-height |
| Description row     | 76px                       |
| Description padding | 24px horizontal            |
| Media inset         | 24px                       |
| Media ratio         | about 1.9:1                |
| Tag gap             | 8px                        |

Responsive adjustments:

- Under 768px, use 16px page/media insets.
- Stack title and action with a 16px gap.
- Keep the media readable before preserving the desktop crop.
- Let the tag rail wrap instead of introducing horizontal scrolling.

Playwright checklist:

1. Open the local route and snapshot it.
2. Capture desktop at approximately 1440×900.
3. Capture mobile around 390×844.
4. Confirm the heading, action, image, and tags remain inside the panel.
5. Check that the section does not introduce horizontal overflow.
