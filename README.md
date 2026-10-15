# Inventory Department branch requests

## Private Google login and minimal Supabase backend

The application requires an approved Google account. Supabase holds only the approved-user assignments, branch directory and two private master catalogs. PDF/Excel files, signatures, photos and draft forms remain on the user's device. There is no central document archive.

Administrators open **Admin** in the top menu to add, edit, disable or remove accounts. Assignments are stored in the private database, not the website source. The current administrator cannot disable, demote or remove their own account.

Each branch account is assigned its own country and source branch. Transfer destinations include all branches in that country. Administrators can choose any branch. These source restrictions guide locally generated forms; generated PDFs are not server-certified submissions.

Account access is checked on login, before downloads, every minute while visible and on window focus. A failed or denied check locks the interface. Removing access cannot recall already downloaded data or files.

Saved forms and photos are isolated by authenticated user ID in local browser storage. Prior unscoped browser history is not automatically imported into a signed-in account. There is no shared-device confidentiality guarantee against someone with access to the browser profile or developer tools.

**Deployment:** commit and push the complete change, including deletion of both public CSV files. Verify Google sign-in on the GitHub Pages URL and verify that the former CSV URLs return 404. Files in earlier public Git commits or earlier downloads remain exposed; deleting the current files does not erase those copies.

**Private master data:** local originals are now outside this repository in `../TRANSFER/private-access/catalogs`. Use Admin → Products or Transfer Configurations to export the current usable CSV list, edit it, upload the full list, review the first five rows, and choose Replace current list. The private SQL import tools remain available as a recovery path. Do not add catalogs, private user seed SQL, database secrets or generated documents to GitHub. The browser publishable key is intentionally public; database permissions enforce access.

**Local checks:** set `INVENTORY_CATALOG_DIR` to the private catalog directory if using another computer, then run the Node tests. UI tests use offline mock accounts; they do not replace a real Google branch-account login test.

---

# Inventory Department branch forms

Static website for GitHub Pages. Transfer is available. Sample / Consumption and Damages / Expiry are reserved for a later phase.

## Local preview

Run `python -m http.server 8080 --bind 127.0.0.1` in this folder and open http://127.0.0.1:8080. Do not open index.html directly. Local Google login requires the exact local root URL in the Supabase redirect allowlist; use the published site for the production login check.

## Publish and update

Commit and push all application files, vendored dependencies and the deletion of both public CSV files. In GitHub Settings → Pages choose Deploy from a branch and the repository root. The checkout is D:\github\CHOCOLALA\Choco_Requests. Supabase Auth Site URL and its redirect allowlist must include https://inventory-choco.github.io/Choco_Requests/ .

Edit the private CSV originals outside this checkout and import revised catalogs into Supabase using the private import tools. Do not upload the originals to GitHub. Retain headings, quoting and UTF-8 encoding.

## Transfer rules

Administrators can select all branches in the country in both lists. Branch accounts use their assigned source branch; the destination list includes all branches in their country. Search matches case-insensitive partial words in any order. Country and branch options are remembered in this browser. Configured pairs use their exact CSV route. Any two different branches in a country can be selected. Missing pairs are normal: no entry warning is shown, pair details and codes are hidden, branch names remain visible, and the PDF includes a Details not found note. Legal entities from unambiguous branch records determine the automatic type where available. Route matching uses country and the explicit source/destination business units; warehouse choices resolve duplicate routes. It does not depend on the exported CRITERIA string.

Legal entity comparison ignores case, repeated whitespace and a hyphen before the final entity number. Equal entities show Internal Transfer, hide supplier, and use CSV CODE as TR code. Different entities show Intercompany Sales/Purchase. SUPPLIER is derived from FROM LEGAL ENTITY; matching legal entities produce an empty SUPPLIER. Supplier codes use the final digits of the derived source entity, preserving leading zeros; no final digits means an empty supplier code. Forms and CSV import/export correct inconsistent legacy SUPPLIER values instead of trusting them. Both legal entity fields are required for new catalog uploads. Transfer type, date, reference and codes are read-only. Date/reference are created in Dubai time for each new form; saved forms retain their original date/reference. References use a local timestamp and are not centrally guaranteed unique.

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

For a pair without a route record, each branch's legal entity and warehouse are resolved independently from both FROM and TO business unit records for the selected country. Consistent records supply the sidebar and PDF; conflicting values remain blank. Internal transfer still requires matching legal entities, and a missing route code remains blank. Supplier details are derived from the resolved source legal entity when the destination legal entity differs.

Approved sessions load private CSV bodies once from the authenticated inventory_catalog RPC, with no public-file fallback. Product and UPC lookups use in-memory maps. Translation updates are scoped to the affected row or sidebar. Arabic PDF support loads on its first use, saving approximately 758 KB from initial page loading. Filling forms, signatures, version history and PDF generation run in each browser; users do not share a processing queue. History remains local to each browser, not shared across branches.

PDFs include an Items.xlsx attachment containing item rows and transfer metadata. Extract it using a PDF reader that supports attachments, or use Download Excel and send the spreadsheet alongside the signed PDF. Barcodes, item codes and batches are stored as text to preserve leading zeros and prevent Excel date conversions; quantities are numeric. PDF clipboard column boundaries depend on the PDF viewer and cannot be guaranteed.

## Sample / Consumption
Open #consumption to record internal branch use. Select one branch from the same country-wide CSV, choose a date range, and record Sample or Consumption per item. Shared products, UPCs and batch rules apply. A 3-barcode or UPC for a batched product requires a batch value; the report uses the scanned barcode when supplied, otherwise the manually entered batch. PDFs use six columns: ITEM CODE, BATCH BARCODE, ITEM NAME, QTY USED, UNIT, Reason, 22 items per page, signed and with embedded Items.xlsx. Excel export uses the same six columns. The module remembers its own branch and last 10 drafts/downloads locally, separately from Transfer.

Consumption PDF and Excel include SR Num as the first column, continuing over all pages. Both modules validate all required fields and every populated item row on each PDF/Excel download attempt. Invalid controls are highlighted with inline messages and a summary; a missing signature is shown alongside field errors. Blank spare rows are excluded, while a completely empty report highlights the first item row.

## Stock Add/Remove
The third form opens at #stock. Choose country/branch and date, scan a barcode or enter a six-digit item code and batch, and enter nonnegative branch/system quantities (up to three decimal places). Adjustment = Branch Qty - System Qty, rounded to three decimals. Negative adjustments show REMOVE; positive or zero show ADD. Zero counts are allowed. Barcode/UPC and product batch rules match the other forms. Outputs use SR NUMBER, ITEM CODE, BATCH, QTY IN BRANCH, QTY IN SYSTEM, ADD/REMOVE, ADD/REMOVE QTY. PDF pages hold eight items and a 320-point variance reason area; enter an optional explanation (max 2000 characters) before downloading or leave the area blank. Signed PDFs embed an Excel workbook, and there is a separate Excel download. Branch memory and the last ten draft/download versions are separate from the other forms.

Top navigation links provide Transfer, Consumption/Damage and Stock Adjustment. Each form has Prepared By (required), Checked By and Confirmed By (Area Manager) name fields, with only a Prepared By drawing pad. Every PDF reserves three signature spaces; only the prepared signature is prefilled. Checker and manager names remain optional and are included in saved forms and Excel metadata. Existing received fields are retained internally for compatibility and are displayed as Checked By.

Signature scope correction: only Stock Add/Remove uses Prepared By, Checked By and Confirmed By (Area Manager). Transfer and the second form retain Prepared and sent by / Received by and their two print signature spaces. The second form is Sample / Consumption / Damage / Expiry. Item reasons are SAMPLE, CONSUMPTION, DAMAGE and EXPIRY. EXPIRY requires an Exp. Date; other reasons hide and clear that field. Reports containing any expiry row show Exp. Date on every PDF page and in Excel; other reports retain their original column layout.

## Automatic updates
Visible pages check index.html and local scripts/styles every 60 seconds using lightweight HEAD requests and ETag/Last-Modified validators. A changed application file schedules a refresh. Private catalog revisions are checked through a small authenticated metadata request. Updated catalogs schedule the same safe refresh; active forms and unfinished Admin edits/CSV previews defer it. Checks also run when the tab regains focus. A form containing item rows, names, a variance reason or a signature blocks automatic refresh and displays an update notice. Returning to home applies the update after preserving drafts in each module’s existing local history; full/disabled storage prevents refresh. Blank forms update automatically. update-worker.js revalidates app files on subsequent loads, so unchanged script URLs do not keep old code. The check needs network access and server validators (provided by GitHub Pages); server/CDN deployment delays still apply. An already-open page from before this updater was installed must be reopened once to receive it. New updates work after committing/pushing changed files; no update manifest or branch instructions are needed.

Arabic localization covers headings, instructions, placeholders, accessibility labels, inline validation, statuses and dynamic notices, including nodes created after loading. Changing language restores original English interface text. Selectable values and CSV branch/product/legal entity/warehouse/unit data stay unchanged. Automatically derived transfer types and ADD/REMOVE labels are localized for display; calculation and saved data remain compatible.

## Store/Factory Request
The fourth form (#order) unifies store and factory requests with country/branch, order/delivery dates, destination (Store/Factory), request type, priority, delivery run/time/location, branch/area manager names and requested item specifications. Item code is optional for new items; a supplied code must have six digits. Existing product/UPC lookup fills known names and units; custom units such as Bag may also be typed. Orders do not require existing product batches. Each item has optional colour/flavour/shape, notes and one photo (JPG/PNG/WebP, up to 15 MB, resized to a 640px JPEG). Photo data stays on the device, separately in IndexedDB; the last 10 drafts/versions contain image references. Text-based landscape PDFs use four items per page with embedded photos and blank Picked/Not Picked checkboxes for store use only. The page has no picked input; Excel contains text details and an image-present indicator, while the photos themselves remain in the PDF. A prepared signature is required. Automatic update protection includes this form.

Store/Factory revisions: Request to lists business units appearing as FROM or TO records for CHOCOLALA FACTORY LLC (ONE PERSON), instead of generic Store/Factory values. Older saved orders must choose a valid destination before download. First-page metadata highlights Customer Order in red, Shop Request in green, Sample in yellow, and the destination in blue. Later pages repeat only title, branch/reference and item headers. Photos remain 70-point rows; pagination allows five rows on a non-final first page, six on non-final continuation pages and five on a final continuation page, with signatures on the last page only. Date outputs in every PDF/Excel report (including expiry dates) are DD-MMM-YYYY with English month abbreviations; ISO values remain unchanged in saved forms and browser date controls.

## Login test page
login-test.html remains a separate Google-login diagnostic using its own browser session. It checks the same private assignments and offers the same server-authorized Admin operations. The production forms now require sign-in through the root page and load private catalogs through Supabase. The approved account seed and SQL files stay outside the public repository. Official Supabase JS 2.117.3 is vendored with its MIT license; no service-role key or Google client secret is included.

## Admin master-data updates

Run the private `04_admin_catalog_updates.sql` migration once before using these controls. It installs Admin-only validated/atomic replacement and approved-session revision metadata, without adding document tables. Its rollback checks do not retain test data.

Products update/export uses Product Code, Product Name, UOM, Batched Product, UPC. Product codes must have six digits, product name/UOM are required, Y/N indicates a batched product, and an optional UPC contains digits. Repeated product codes must have consistent details; UPCs cannot identify different products. Additional columns are ignored. Legacy rows with unsupported item codes do not appear in exports because the page cannot use them; legacy invalid/ambiguous UPCs are exported as blank. All current usable products remain included. Preserve product codes and UPCs as Text when editing in Excel to retain leading zeros.

Transfer update/export uses COUNTRY, CRITERIA, CODE, Name, From Warehouse, FROM BUSINESS UNIT, FROM LEGAL ENTITY, To Warehouse, To Business Unit, TO LEGAL ENTITY, SUPPLIER. The unused Business Unit column is excluded. Exported CRITERIA is From Warehouse + To Warehouse, concatenated directly without a separator. Both warehouses are required. Older CSVs containing the business-unit concatenation are accepted and converted to warehouse criteria in the preview/export. Each business unit still includes its branch number. The database retains the legacy branch-based key internally for compatibility with existing browser tabs; this does not alter the warehouse-based CSV export. An update refreshes the private branch directory and account branch names/countries without changing assigned branch numbers or enabled/role settings. It rejects configurations missing a currently enabled assigned branch.

Uploads are full replacements, not incremental rows. Empty or invalid files are rejected before submission; the backend validates independently and applies the change atomically. A revision check rejects saving over another administrator's newer upload. Uploads are limited to 10 MB and 60,000 rows; there is no stored catalog version archive. Export a copy before replacing a list. Export fetches the current private database contents instead of the page's cached list. SQL migrations remain outside the published checkout.

The Google account chooser belongs to Google. Set the app name/logo in Google Auth Platform Branding and complete brand verification to display approved branding; changing the website cannot directly change Google's screen. Keep the existing Google OAuth callback URL.


### Approved-user activity (Admin only)

The Admin page shows approximate active users/tabs, unique approved users, page visits and separate PDF/Excel download counts for today, 7 days or 30 days. The database activity migration must be installed before enabling this release; its private installation file is `06_admin_activity.sql`. Keep private migration/seed files outside the published repository.

Activity starts after approval and records only approved-account IDs, tab identifiers, page names, daily counts and server timestamps. It does not collect document contents, product choices, customer details, photos, signatures, IP addresses or anonymous visits. Reports are protected by server-side administrator checks; branches cannot query reports or supply another user's identity.

Visible tabs with recent interaction send a small heartbeat every two minutes. Navigation and download events are batched, with at least 30 seconds between client attempts, a 20-event memory queue, five-second request timeouts and no blocking of login or downloads. A tab counts as active for five minutes after its last report. Dashboard data loads only while Admin is open and automatically refreshes every two minutes. No tracking library or third-party analytics service is used.

The backend retains up to eight recent tabs per account, a bounded retry-deduplication window and one aggregate row per account/page/day. Old activity is pruned on the first activity update each Dubai calendar day: daily totals older than 30 days, tab records older than one day. Inactive sites perform no background writes and cleanup waits for the next activity update. Counts are best-effort browser telemetry, not authentication audit logs. A download count records the browser download action; it cannot prove that the file was saved. Offline activity or a closed tab can lose queued events.
