# Chocolala branch forms

A static website for GitHub Pages. Transfer is implemented; Sample / Consumption and Damages / Expiry are reserved for a later phase.

## Preview locally

From this folder run:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080. Opening index.html directly cannot load the CSV in most browsers.

## Publish on GitHub Pages

1. Create a GitHub repository and upload `index.html`, `styles.css`, `app.js`, `csv.js`, `favicon.svg`, `.nojekyll`, and `TRANSFER_CONF.csv` to its root.
2. In repository **Settings → Pages**, select **Deploy from a branch**, choose your branch and **/ (root)**, then save.
3. Share the Pages URL with your branches once deployment finishes.

The local folder is not yet a Git repository. No push or deployment has been performed. GitHub Pages serves these files publicly; use an access-controlled hosting service if the branch configuration must stay private.

## Update branch routes centrally

Edit `TRANSFER_CONF.csv` and commit/push the revised file to the published branch. Once Pages deploys the update, branches can reload the same link. The website fetches the CSV at each page load. An already-open page needs a reload.

Keep the existing headings and CSV quoting. The file's unnamed 12th column is read as SUPPLIER; it can also be renamed to `SUPPLIER`. All identifiers are kept as text. Legal entities and suppliers come from each route row, so destination entities are not globally assumed to be identical.

Country and source branch restrict the destination list to configured routes. If multiple warehouse routes share the same branch pair, the user must choose a warehouse route.

`CODE` is treated as a route code, not a supplier code. Supplier code and transfer type are entered by the preparer because the supplied CSV has no explicit supplier-code or transfer-type columns. Confirm business rules before automating either field. References are editable timestamp suggestions, not centrally guaranteed unique identifiers.

## Use the form

Select Transfer, choose the route, fill in the reason and preparer, and enter items. Item code, item name, UOM and positive quantity are required for each item row. Barcodes are text to preserve leading zeros. UOM supports common suggestions and custom values. Print / Save PDF opens the browser print dialog with an A4 form and signature spaces. Disable browser headers and footers for a clean form. Larger requests continue across pages.

This version does not send requests or save drafts. Reloading clears the form. Central submissions, history, user accounts and backend administration require an additional service; GitHub Pages alone does not provide them.

## Check the CSV and JavaScript

```powershell
node --check app.js
node --check csv.js
node tests/csv.test.cjs
```
