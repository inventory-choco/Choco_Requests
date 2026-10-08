# Inventory Department branch forms

Static website for GitHub Pages. Transfer is available. Sample / Consumption and Damages / Expiry are reserved for a later phase.

## Local preview

Run `python -m http.server 8080 --bind 127.0.0.1` in this folder and open http://127.0.0.1:8080. Do not open index.html directly because browsers restrict loading its CSV.

## Publish and update

Upload index.html, styles.css, app.js, csv.js, rules.js, pdf.js, products.js, language.js, favicon.svg, .nojekyll, TRANSFER_CONF.csv, products.csv, and the entire vendor folder to the repository root. In GitHub Settings → Pages choose Deploy from a branch and the repository root. Share the Pages URL after deployment. The GitHub Desktop checkout is D:\github\CHOCOLALA\Choco_Requests; ensure updated website files and CSV are copied there before committing and pushing.

Edit TRANSFER_CONF.csv centrally and push the revision. Branches reload the same link to get current routes. The unnamed final column is read as SUPPLIER; it can also be renamed SUPPLIER. UTF-8 and Windows-1252 CSV files are supported. Retain the headings and quoting.

## Transfer rules

Both branch lists include all branches in the selected country. Search matches case-insensitive partial words in any order. Country and branch options are remembered in this browser. Configured pairs use their exact CSV route. Any two different branches in a country can be selected. Missing pairs are normal: no entry warning is shown, pair details and codes are hidden, branch names remain visible, and the PDF includes a Details not found note. Legal entities from unambiguous branch records determine the automatic type where available. Route matching uses country and CRITERIA = source name + destination name; warehouse choices resolve duplicate routes.

Legal entity comparison ignores case, repeated whitespace and a hyphen before the final entity number. Equal entities show Internal Transfer, hide supplier, and use CSV CODE as TR code. Different entities show Intercompany Sales/Purchase and a supplier code extracted from the final digits of SUPPLIER, preserving leading zeros; no final digits means an empty supplier code. Transfer type, date, reference and codes are read-only. Date/reference are created in Dubai time for each new form; saved forms retain their original date/reference. References use a local timestamp and are not centrally guaranteed unique.

Reason choices are Shop Request (default) and Customer Order. UOM is searchable and comes from products.csv.

Item code: exactly 6 digits. One optional Barcode entry accepts exactly 13 digits starting with 3 or 4, or an exact numeric UPC match from products.csv. UPC strings retain leading zeros. The PDF keeps its existing separate 3/4-barcode columns; other UPC values occupy the existing 3-barcode column. Optional batch: 6–17 characters. Wrong prefixes, non-digits and overlength values show inline errors while typing. An incomplete nonempty barcode shows an inline error on blur, Enter or Tab; Enter/Tab keep focus there until corrected. Empty 4 barcodes are allowed for manual entry. A valid barcode followed by Enter or Tab moves directly to item name, skipping locked fields. A complete valid 4 barcode sets and locks item code (characters 2–7) and batch (last six characters), and defaults UOM to Pieces and quantity to 1. UOM and quantity remain editable. Removing or making the barcode incomplete unlocks code/batch, while invalid nonempty barcodes still block PDF download. A scanner's Enter key moves to Item name. Enter on a completed valid quantity adds the next item and focuses its barcode. Item fields wrap into labelled cards, with growing item-name/batch fields and no horizontal scrolling. Automatic legal entities, warehouses, type, date, reference and codes appear in the sidebar.

## Signatures, downloads and copying

Sign the prepared-by pad with mouse, pen or touch. Clear signature resets it. The downloadable PDF uses real text and vector signature strokes, with no page screenshots. Up to 22 items appear on each complete A4 transfer page; 23–44 items create two pages, and larger forms continue in blocks of 22. Transfer details and the signature repeat on each page. The entry page has no copy-rows button. Recipients copy selectable text from the signed PDF.

Download PDF creates a file directly without printing. Attach it to email manually. The site does not send emails or attach files to mail clients automatically. Names supported by the standard PDF font are Western Latin; unsupported characters or excessively long cell text show a download error instead of silently corrupting the output.

## Last ten versions

Forms autosave as you work (after a short pause) in localStorage on this browser/device. The sidebar retains up to ten saved records, including item details and drawn signatures. Each successful Download PDF creates an immutable numbered copy (v1, v2, and so on), adds the version to the PDF header and filename, and preserves prior downloaded copies. Selecting a downloaded version opens an editable draft; changes do not overwrite that downloaded version. New form starts a fresh form with remembered branch options. Version counters persist even if old copies age out of the ten-record history. Storage-disabled/full browsers show an error. Clearing browser storage removes the history. This is not a central database, shared history, or guaranteed backup.

## Verification

Run `node --check app.js`, `node tests/csv.test.cjs`, `node tests/rules.test.cjs`, and `node tests/pdf.test.cjs`. PDF QA artifacts are written under tmp/pdfs and are not production assets. The PDF generator uses a vendored MIT-licensed pdf-lib build; retain vendor/pdf-lib-LICENSE.md.



## Field colors

Blue fields accept entry. Grey fields are automatic/read-only. Barcode autofill switches locked fields to grey; clearing the barcode restores blue editable fields.

## Product lookup and entry

products.csv uses Product Code, Product Name, UOM, Batched Product (Y/N), UPC. UPC is optional for older files; duplicate UPC values pointing to different products are rejected rather than guessed. Six-digit codes populate names and UOM. Batched products require 6-17 batch characters; a valid 4 barcode supplies the batch. For a known non-batched product, batch is cleared and locked. For a known batched product entered through a 3 barcode, batch becomes editable and required. Unknown codes retain manual entry. Non-six-digit product codes (including scientific notation) are excluded from lookup without changing the CSV. Starting an item automatically adds an empty spare row. Empty rows are excluded from validation, saved forms and PDF pagination.

A drawn signature is mandatory; a blank pad or a single click blocks download.

English is the default language. Arabic translates headings and labels on the page and PDF; entered names, reason, type, codes and UOM values are unchanged. Language preference is saved locally. Arabic PDFs embed the vendored Noto Sans Arabic font and use text, not page images. Retain font and library licenses in vendor.

For isolated DOM checks: npm install --prefix tmp/test-runtime jsdom@26 --no-audit --no-fund, then node tests/inventory-dom.test.cjs. Also run node tests/pdf-arabic.test.cjs. Tests generate sample PDFs under tmp/pdfs.


### Branch lookup and performance

For a pair without a route record, each branch's legal entity and warehouse are resolved independently from both FROM and TO business unit records for the selected country. Consistent records supply the sidebar and PDF; conflicting values remain blank. Internal transfer still requires matching legal entities, and a missing route code remains blank. Supplier details come from consistent source-branch records.

CSV requests use cache revalidation so unchanged files can be reused while checking for updates. Product and UPC lookups use in-memory maps. Translation updates are scoped to the affected row or sidebar. Arabic PDF support loads on its first use, saving approximately 758 KB from initial page loading. Filling forms, signatures, version history and PDF generation run in each browser; users do not share a processing queue. History remains local to each browser, not shared across branches.

PDFs include an Items.xlsx attachment containing item rows and transfer metadata. Extract it using a PDF reader that supports attachments, or use Download Excel and send the spreadsheet alongside the signed PDF. Barcodes, item codes and batches are stored as text to preserve leading zeros and prevent Excel date conversions; quantities are numeric. PDF clipboard column boundaries depend on the PDF viewer and cannot be guaranteed.
