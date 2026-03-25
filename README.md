# PDF Viewer

Simple browser-based PDF viewer with multiple rendering modes selected through query params.


## Demo URL

```text
https://addevin.github.io/pdf-viewer?file=https://pdfobject.com/pdf/sample.pdf&open-in=pdf-js&hide-tabs=false&hide-header=false&remove-timestamp=false&hide-git-url=false
```

<a href="https://addevin.github.io/pdf-viewer?file=https%3A%2F%2Fpdfobject.com%2Fpdf%2Fsample.pdf&open-in=pdf-js&hide-tabs=false&hide-header=false&remove-timestamp=false&hide-git-url=false" target="_blank" rel="noopener noreferrer">Open Demo URL &#8599;</a>

## Query Params

Short aliases are supported for every query param. If both the full name and short alias are provided, the full name takes priority.

### `file`

Required. The PDF URL to load.

Short alias: `f`

Use URL encoding when passing a full URL as a query param.

Example:

```text
file=https://pdfobject.com/pdf/sample.pdf
```

### `open-in`

Optional. Selects the active viewer mode.

Short alias: `oi`

Supported values:

- `mozilla-git-pdf-js`
- `pdf-js`
- `google-drive-pdf`
- `browser-pdf`

If omitted, the viewer uses the last selected mode from local storage, or defaults to `mozilla-git-pdf-js`.

### `hide-header`

Optional. If `true` or `1`, hides the entire header, including tabs and reload button.

Short alias: `hh`

Supported truthy values:

- `true`
- `1`

### `hide-tabs`

Optional. If `true` or `1`, hides only the tabs and keeps the reload button visible.

Short alias: `ht`

Supported truthy values:

- `true`
- `1`

### `remove-timestamp`

Optional. If `true` or `1`, the viewer does not append the cache-busting `t` query param to the PDF URL.

Short alias: `rt`

Supported truthy values:

- `true`
- `1`

### `hide-git-url`

Optional. If `true` or `1`, hides the GitHub button in the header.

Short alias: `hgu`

Supported truthy values:

- `true`
- `1`

## Notes

- The viewer appends a `t` query param to the PDF URL for cache-busting unless `remove-timestamp` is truthy.
