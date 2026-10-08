# Chocolala branch forms

Static website for GitHub Pages. Transfer is available. Sample / Consumption and Damages / Expiry are reserved for a later phase.

## Local preview

Run `python -m http.server 8080 --bind 127.0.0.1` in this folder and open http://127.0.0.1:8080. Do not open index.html directly because browsers restrict loading its CSV.

## Publish and update

Upload index.html, styles.css, app.js, csv.js, rules.js, pdf.js, favicon.svg, .nojekyll, TRANSFER_CONF.csv, and the entire vendor folder to the repository root. In GitHub Settings → Pages choose Deploy from a branch and the repository root. Share the Pages URL after deployment. The GitHub Desktop checkout is D:\github\CHOCOLALA\Choco_Requests; ensure updated website files and CSV are copied there before committing and pushing.

Edit TRANSFER_CONF.csv centrally and push the revision. Branches reload the same link to get current routes. The unnamed final column is read as SUPPLIER; it can also be renamed SUPPLIER. UTF-8 and Windows-1252 CSV files are supported. Retain the headings and quoting.

## Transfer rules

Both branch lists include all branches in the selected country. Search matches case-insensitive partial words in any order. Country and branch options are remembered in this browser. Configured pairs use their exact CSV route. Missing pairs use unambiguous branch legal entity and warehouse records, preferring source records, with a blank route code and a visible notice. Missing or conflicting branch records require an explicit CSV route. Route matching uses country and CRITERIA = source name + destination name; warehouse choices resolve duplicate routes.

Legal entity comparison ignores case, repeated whitespace and a hyphen before the final entity number. Equal entities show Internal Transfer, hide supplier, and use CSV CODE as TR code. Different entities show Intercompany Sales/Purchase and a supplier code extracted from the final digits of SUPPLIER, preserving leading zeros; no final digits means an empty supplier code. Transfer type, date, reference and codes are read-only. Date/reference are created in Dubai time for each new form; saved forms retain their original date/reference. References use a local timestamp and are not centrally guaranteed unique.

Reason choices are Shop Request (default) and Customer Order. UOM is searchable with a native datalist and restricted to the supplied 22 choices.

Item code: exactly 6 digits. Optional 3 barcode: exactly 13 digits starting with 3. Optional 4 barcode: exactly 13 digits starting with 4. Optional batch: 6–17 characters. Wrong prefixes, non-digits and overlength values show inline errors while typing. An incomplete nonempty barcode shows an inline error on blur, Enter or Tab; Enter/Tab keep focus there until corrected. Empty 4 barcodes are allowed for manual entry. A valid barcode followed by Enter or Tab moves directly to item name, skipping locked fields. A complete valid 4 barcode sets and locks item code (characters 2–7) and batch (last six characters), and defaults UOM to Pieces and quantity to 1. UOM and quantity remain editable. Removing or making the barcode incomplete unlocks code/batch, while invalid nonempty barcodes still block PDF download. A scanner's Enter key moves to Item name. Enter on a completed valid quantity adds the next item and focuses its barcode. Item fields wrap into labelled cards, with growing item-name/batch fields and no horizontal scrolling. Automatic legal entities, warehouses, type, date, reference and codes appear in the sidebar.

## Signatures, downloads and copying

Sign the prepared-by pad with mouse, pen or touch. Clear signature resets it. The downloadable PDF uses real text and vector signature strokes, with no page screenshots. Up to 22 items appear on each complete A4 transfer page; 23–44 items create two pages, and larger forms continue in blocks of 22. Transfer details and the signature repeat on each page. The entry page has no copy-rows button. Recipients copy selectable text from the signed PDF.

Download PDF creates a file directly without printing. Attach it to email manually. The site does not send emails or attach files to mail clients automatically. Names supported by the standard PDF font are Western Latin; unsupported characters or excessively long cell text show a download error instead of silently corrupting the output.

## Last ten versions

Forms autosave as you work (after a short pause) in localStorage on this browser/device. The sidebar retains up to ten saved records, including item details and drawn signatures. Each successful Download PDF creates an immutable numbered copy (v1, v2, and so on), adds the version to the PDF header and filename, and preserves prior downloaded copies. Selecting a downloaded version opens an editable draft; changes do not overwrite that downloaded version. New form starts a fresh form with remembered branch options. Version counters persist even if old copies age out of the ten-record history. Storage-disabled/full browsers show an error. Clearing browser storage removes the history. This is not a central database, shared history, or guaranteed backup.

## Verification

Run `node --check app.js`, `node tests/csv.test.cjs`, `node tests/rules.test.cjs`, and `node tests/pdf.test.cjs`. PDF QA artifacts are written under tmp/pdfs and are not production assets. The PDF generator uses a vendored MIT-licensed pdf-lib build; retain vendor/pdf-lib-LICENSE.md.



## Field colors

Blue fields accept entry. Grey fields are automatic/read-only. Barcode autofill switches locked fields to grey; clearing the barcode restores blue editable fields.
