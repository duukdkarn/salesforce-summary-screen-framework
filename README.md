# Summary Screen Framework

A configurable, multi-section read-only summary UI framework for Salesforce LWC and OmniScript. Dynamically renders collapsible sections from Apex data — no hard-coded field lists in the component layer.

---

## Overview

The framework separates concerns cleanly across three layers:

```
Apex controller      →  returns structured Map<String,Object>
sectionHandlers.js   →  wires results into @track state
sectionBuilders.js   →  reads state, produces component descriptors
summaryScreenDemo.js →  host component, orchestrates everything
child LWCs           →  render the descriptors
```

Each section on screen is a compositeSection card containing one or more sub-components selected by descriptor type:

| Descriptor type | Child LWC | Use case |
|---|---|---|
| `isDynamic` | `summaryScreenDynamicSection` | Label/value field list |
| `isMulti` | `summaryScreenMultiSection` | Nested collapsible sub-sections |
| `isTable` | `summaryScreenDataTable` | Tabular data with column definitions |
| `isDocuments` | `summaryScreenDocuments` | Downloadable file links |

---

## Quick Start

### Prerequisites
- Salesforce org (Developer Edition, scratch org, or sandbox)
- SFDX CLI or VS Code with Salesforce Extension Pack

### Deploy

```bash
sf project deploy start --source-dir force-app
```

### Use

Drop `c-summary-screen-demo` on any Lightning page, Experience Cloud page, or Flow screen. Set `requestId` to an Account Id and `sourceType` to one of the demo values:

```html
<c-summary-screen-demo
    request-id="001XXXXXXXXXXXXXXX"
    source-type="demo2">
</c-summary-screen-demo>
```

---

## Demo Source Types

### `demo1` — isDynamic (field list)
Renders Account fields as a single collapsible card with label/value pairs.

### `demo2` — Composite (isDynamic + isMulti)
Renders Account summary fields plus related Contacts as nested collapsible sub-sections inside the same card.

### `demo3` — isTable
Renders related Contacts as a data table with Name, Title, Email, and Phone columns.

### `demo4` — isDocuments
Renders files attached to the Account as clickable download links with file type icons.

---

## Theming

All visual styling is driven by CSS custom properties (design tokens) defined in the `summaryScreenTheme` component. This means you can completely restyle the framework without touching any component CSS — just override the variables.

### Default tokens

| Variable | Default | Used for |
|---|---|---|
| `--white` | `#ffffff` | Card and section backgrounds |
| `--base` | `#444444` | Label text |
| `--base-lighter` | `#f3f3f3` | Hover backgrounds, borders |
| `--base-dark` | `#333333` | Value text, table cell text |
| `--base-darkest` | `#111111` | Section heading text |
| `--base-darker` | `#666666` | Table totals row border |
| `--success-lighter` | `#e3fcef` | ENABLED badge background |
| `--success-dark` | `#006644` | ENABLED badge icon and text |
| `--warning-lighter` | `#fffae6` | Info banner background |
| `--warning-dark` | `#ff8b00` | Info banner border and icon |

### How it works

`summaryScreenTheme` is a CSS-only LWC with `display: contents` so it adds zero layout impact. CSS custom properties cascade through the Shadow DOM, so every child component picks up the values automatically.

The host template includes it by default:

```html
<template>
    <c-summary-screen-theme></c-summary-screen-theme>
    <!-- rest of template -->
</template>
```

### Option 1 — Edit the defaults

Open `summaryScreenTheme/summaryScreenTheme.css` and change any value:

```css
:host {
    --base-darkest:    #1b4f72;   /* navy headings to match your brand */
    --success-dark:    #00875a;   /* your org's green                  */
    --warning-dark:    #de350b;   /* your org's alert colour           */
}
```

### Option 2 — Replace with your own theme component

If your org already has a design token component, replace `<c-summary-screen-theme>` in the host template with your own component — as long as it defines the same variable names on `:host`, everything works:

```html
<template>
    <c-my-org-theme></c-my-org-theme>
    <!-- rest of template -->
</template>
```

```css
/* my-org-theme.css */
:host {
    display: contents;
    --white:           #ffffff;
    --base:            #172b4d;   /* Atlassian dark blue  */
    --base-lighter:    #dfe1e6;
    --base-dark:       #253858;
    --base-darkest:    #091e42;
    --base-darker:     #344563;
    --success-lighter: #e3fcef;
    --success-dark:    #006644;
    --warning-lighter: #fffae6;
    --warning-dark:    #ff8b00;
}
```

### Option 3 — Override at the page level

If you want different themes on different pages without a dedicated component, set the variables directly on a parent element via inline styles or a page-level CSS resource:

```css
.my-page-wrapper {
    --base-darkest: #1b4f72;
    --success-dark: #00875a;
}
```

---

## Adding Your Own Source Type

### 1. Add Apex methods to your controller

```apex
@AuraEnabled(cacheable=false)
public static Map<String, Object> getMyBasicDetails(String onboardingId) {
    Map<String, Object> result = new Map<String, Object>();
    // query and build fieldsList ...
    result.put('sectionTitle', 'My section');
    result.put('fieldsList', fieldsList);
    return result;
}
```

### 2. Register the Apex import and sectionMethods entry in `summaryScreenDemo.js`

```javascript
import getMyBasicDetails from '@salesforce/apex/MyController.getMyBasicDetails';

const sectionMethods = {
    myBasicDetails: { fn: getMyBasicDetails }
};
```

### 3. Add a handler in `sectionHandlers.js`

```javascript
myBasicDetails: (cmp, result) => {
    cmp.myBasicDetailsSection = {
        sectionTitle: result?.sectionTitle || '',
        fields: result?.fieldsList?.length ? cmp.processFieldsFromList(result.fieldsList) : []
    };
    cmp.removeSectionIfEmpty('myBasicDetails', result?.fieldsList);
},
```

### 4. Add a builder in `sectionBuilders.js`

```javascript
myBasicDetails: (cmp) =>
    cmp.myBasicDetailsSection
        ? [{ isDynamic: true, key: 'my-basic', title: cmp.myBasicDetailsSection.sectionTitle, fields: cmp.myBasicDetailsSection.fields }]
        : [],
```

### 5. Add a `@track` property to `summaryScreenDemo.js`

```javascript
@track myBasicDetailsSection = null;
```

### 6. Register the sourceType in `sectionConfigs.js`

```javascript
mysourcetype: {
    mySection: ['myBasicDetails']
}
```

---

## Apex Return Formats

### isDynamic
```json
{
  "sectionTitle": "Section title",
  "fieldsList": [
    { "label": "Field label", "value": "Field value", "fieldOrder": 1 }
  ]
}
```

### isMulti
```json
{
  "sectionTitle": "Parent title",
  "records": [
    {
      "sectionTitle": "Sub-section title",
      "fieldsList": [
        { "label": "Field label", "value": "Field value", "fieldOrder": 1 }
      ]
    }
  ]
}
```

### isTable
```json
{
  "sectionTitle": "Table title",
  "columns": [
    { "label": "Column header", "fieldName": "ColumnKey" }
  ],
  "records": [
    { "id": "row-0", "ColumnKey": "Cell value" }
  ]
}
```

### isDocuments
```json
{
  "sectionTitle": "Documents title",
  "fieldsList": [],
  "documents": [
    { "title": "file.pdf", "extension": "pdf", "versionId": "068XXXXXXXXXXXXXXX" }
  ]
}
```

---

## File Structure

```
force-app/main/default/
├── classes/
│   └── SummaryScreenControllerDemo.cls
└── lwc/
    ├── summaryScreenDemo/
    │   ├── summaryScreenDemo.js
    │   ├── summaryScreenDemo.html
    │   ├── summaryScreenDemo.css
    │   ├── summaryScreenDemo.js-meta.xml
    │   └── config/
    │       ├── sectionConfigs.js
    │       ├── sectionHandlers.js
    │       └── sectionBuilders.js
    ├── summaryScreenTheme/          ← edit this to restyle everything
    │   ├── summaryScreenTheme.css
    │   ├── summaryScreenTheme.js
    │   ├── summaryScreenTheme.html
    │   └── summaryScreenTheme.js-meta.xml
    ├── summaryScreenCompositeSection/
    ├── summaryScreenDynamicSection/
    ├── summaryScreenMultiSection/
    ├── summaryScreenDataTable/
    ├── summaryScreenDocuments/
    └── summaryField/
```

---

## License

MIT# salesforce-summary-screen-framework