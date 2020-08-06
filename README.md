## How to Use

Link `script.js` to your HTML file.
Then later:

```html
<div
  class="minesweeper"
  data-width="10"
  data-height="10"
  data-difficulty="normal"
  data-debug="false"
></div>
```

**Attributes:**

- `class`: must include **minesweeper**

- `data-width`: _int_ - Number of rows

- `data-height`: _int_ - Number of columns

- `data-difficulty`: _String_ - Affects the number of mines distributed on the map

      	-  `easy` about 10% of squares will be mines

      	-  `normal` about 15% of squares will be mines

      	-  `hard` about 20% of squares will be mines

- `data-debug`: _Boolean_ - Mines will be shown
