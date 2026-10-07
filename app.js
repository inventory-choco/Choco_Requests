'use strict';
const $ = id => document.getElementById(id);
let routes = [], selectedRoute = null;
let rowSequence = 0;
function options(select, values, placeholder) {
  select.replaceChildren(new Option(placeholder, ''));
  [...new Set(values)].sort((a, b) => a.localeCompare(b)).forEach(value => select.add(new Option(value, value)));
  select.disabled = !values.length;
}
function showPage() {
  const transfer = location.hash === '#transfer';
  $('home').hidden = transfer; $('transfer').hidden = !transfer;
  document.title = transfer ? 'Transfer request · Chocolala' : 'Chocolala · Branch Operations';
}
function chooseRoute(route) {
  selectedRoute = route; $('route-details').hidden = !route;
  if (route) {
    $('from-entity').textContent = route.fromEntity;
    $('to-entity').textContent = route.toEntity;
    $('from-warehouse').textContent = route.fromWarehouse;
    $('to-warehouse').textContent = route.toWarehouse;
    $('supplier').textContent = route.supplier || 'Not specified in branch data';
    $('route-code').textContent = 'Route code: ' + route.code;
  }
  $('print-button').disabled = $('print-bottom').disabled = !route;
}
$('country').addEventListener('change', () => {
  options($('from'), routes.filter(route => route.country === $('country').value).map(route => route.from), 'Select source branch');
  options($('to'), [], 'Select destination');
  $('route-choice-wrap').hidden = true; chooseRoute(null);
});
$('from').addEventListener('change', () => {
  options($('to'), routes.filter(route => route.country === $('country').value && route.from === $('from').value).map(route => route.to), 'Select destination');
  $('route-choice-wrap').hidden = true; chooseRoute(null);
});
$('to').addEventListener('change', () => {
  const matches = routes.filter(route => route.country === $('country').value && route.from === $('from').value && route.to === $('to').value);
  $('route-choice-wrap').hidden = matches.length <= 1;
  $('route-choice').replaceChildren(new Option('Select warehouse route', ''));
  matches.forEach(route => $('route-choice').add(new Option(route.code + ' · ' + route.fromWarehouse + ' → ' + route.toWarehouse, String(routes.indexOf(route)))));
  chooseRoute(matches.length === 1 ? matches[0] : null);
});
$('route-choice').addEventListener('change', () => chooseRoute($('route-choice').value === '' ? null : routes[Number($('route-choice').value)]));
function updateCount() {
  [...$('item-rows').rows].forEach((row, index) => {
    row.cells[0].textContent = index + 1;
    row.querySelector('.remove-row').setAttribute('aria-label', 'Remove item ' + (index + 1));
  });
  const count = $('item-rows').rows.length;
  $('item-count').textContent = count + (count === 1 ? ' item' : ' items');
}
function addRow() {
  const row = $('item-rows').insertRow(); rowSequence++;
  row.insertCell().textContent = '';
  const fields = [['code', 'Item code'], ['barcode3', '3 barcode'], ['barcode4', '4 barcode'], ['batch', 'Batch'], ['name', 'Item name'], ['uom', 'UOM'], ['quantity', 'Quantity']];
  for (const [key, label] of fields) {
    const input = document.createElement('input');
    input.name = key; input.setAttribute('aria-label', label + ' for item ' + rowSequence);
    input.type = key === 'quantity' ? 'number' : 'text';
    input.maxLength = key === 'name' ? 150 : 80;
    input.required = ['code', 'name', 'uom', 'quantity'].includes(key);
    if (key === 'quantity') { input.min = '0.001'; input.step = '0.001'; input.placeholder = '0.000'; }
    if (key === 'uom') { input.setAttribute('list', 'uom-options'); input.placeholder = 'Pieces'; }
    row.insertCell().append(input);
  }
  const button = document.createElement('button'); button.type = 'button'; button.className = 'remove-row'; button.textContent = '×';
  button.addEventListener('click', () => {
    if ($('item-rows').rows.length === 1) row.querySelectorAll('input').forEach(input => { input.value = ''; input.setCustomValidity(''); });
    else row.remove();
    updateCount();
  });
  row.insertCell().append(button); updateCount(); return row;
}
const uoms = document.createElement('datalist'); uoms.id = 'uom-options';
['Pieces', 'Kilogram', 'Box', 'Tray', 'Litre', 'Pack'].forEach(value => uoms.append(new Option(value, value))); document.body.append(uoms);
$('add-row').addEventListener('click', () => addRow().querySelector('input').focus());
$('transfer-form').addEventListener('submit', event => event.preventDefault());
$('transfer-form').addEventListener('input', event => {
  if (event.target.matches('input')) event.target.setCustomValidity('');
});
const now = new Date();
$('date').value = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now);
const part = type => parts.find(value => value.type === type).value;
$('reference').value = 'TR ' + part('day') + part('month') + part('year') + '-' + part('hour') + part('minute') + part('second');
let automaticReference = $('reference').value;
$('type').addEventListener('change', () => {
  if ($('reference').value === automaticReference) {
    automaticReference = ($('type').value === 'IC Sales/Purchase' ? 'IC' : 'TR') + automaticReference.slice(2);
    $('reference').value = automaticReference;
  }
});
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function buildPrint() {
  if (!selectedRoute) return false;
  for (const input of document.querySelectorAll('#transfer-form input[required]')) {
    input.setCustomValidity(input.type !== 'number' && !input.value.trim() ? 'Please enter ' + (input.getAttribute('aria-label') || 'this field') + '.' : '');
  }
  if (!$('transfer-form').reportValidity()) return false;
  const route = selectedRoute;
  const items = [...$('item-rows').rows].map(row => Object.fromEntries([...row.querySelectorAll('input')].map(input => [input.name, input.value.trim()])));
  const date = new Date($('date').value + 'T12:00:00');
  const displayDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace(/ /g, '-');
  const e = escapeHTML;
  const blankRows = Math.max(0, 22 - items.length);
  $('print-sheet').innerHTML = `
    <table class="print-table print-meta"><colgroup><col style="width:19%"><col style="width:32%"><col style="width:34%"><col style="width:15%"></colgroup><tbody>
      <tr class="print-banner"><td colspan="2">TRANSFER REQUEST FORM</td><td class="print-ref">${e($('reference').value)}</td><td>${e(displayDate)}</td></tr>
      <tr><th>${e(route.country)}</th><th>BRANCH NAME</th><th>LEGAL ENTITY</th><th>Supplier code</th></tr>
      <tr><th>TRANSFER FROM</th><td>${e(route.from)}</td><td>${e(route.fromEntity)}</td><td rowspan="2" style="text-align:center;color:#c00;font-size:16px">${e($('supplier-code').value || '—')}</td></tr>
      <tr><th>TRANSFER TO</th><td>${e(route.to)}</td><td>${e(route.toEntity)}</td></tr>
      <tr><th>FROM WAREHOUSE</th><td colspan="3">${e(route.fromWarehouse)}</td></tr>
      <tr><th>TO WAREHOUSE</th><td colspan="3">${e(route.toWarehouse)}</td></tr>
      <tr><th>SUPPLIER / ROUTE</th><td colspan="3">${e(route.supplier || 'Not specified')} · ${e(route.code)}</td></tr>
      <tr><th>TYPE</th><td colspan="3" style="text-align:center;color:#c00">${e($('type').value)}</td></tr>
      <tr><th>REASON</th><td colspan="3">${e($('reason').value)}</td></tr>
    </tbody></table>
    <table class="print-table print-items"><colgroup><col style="width:4%"><col style="width:10%"><col style="width:15%"><col style="width:15%"><col style="width:15%"><col style="width:24%"><col style="width:8%"><col style="width:9%"></colgroup><thead><tr><th>#</th><th>ITEM CODE</th><th>3 BARCODE</th><th>4 BARCODE</th><th>BATCH</th><th>ITEM NAME</th><th>UOM</th><th>QUANTITY</th></tr></thead><tbody>
    ${items.map((item, index) => `<tr><td class="number">${index + 1}</td><td>${e(item.code)}</td><td>${e(item.barcode3)}</td><td>${e(item.barcode4)}</td><td>${e(item.batch)}</td><td>${e(item.name)}</td><td>${e(item.uom)}</td><td class="quantity">${Number(item.quantity).toFixed(3)}</td></tr>`).join('')}
    ${Array.from({ length: blankRows }, (_, index) => `<tr><td class="number">${items.length + index + 1}</td>${'<td></td>'.repeat(7)}</tr>`).join('')}
    </tbody></table><div class="print-signatures"><div><strong>Prepared and sent by</strong><p>${e($('prepared').value)}</p><div class="signature-line"></div>Name &amp; signature</div><div><strong>Received by</strong><p>${e($('received').value || ' ')}</p><div class="signature-line"></div>Name &amp; signature</div></div><p class="print-note">Chocolala · Transfer request · ${items.length} item(s)</p>`;
  return true;
}
function printForm() { if (buildPrint()) window.print(); }
$('print-button').addEventListener('click', printForm);
$('print-bottom').addEventListener('click', printForm);
window.addEventListener('beforeprint', buildPrint);
window.addEventListener('hashchange', showPage);
addRow(); showPage();
(async () => {
  try {
    const response = await fetch('TRANSFER_CONF.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load branch routes (HTTP ' + response.status + ').');
    routes = TransferCSV.readRoutes(await response.text());
    options($('country'), routes.map(route => route.country), 'Select country');
    $('data-status').textContent = routes.length + ' transfer routes available. Select a country and source branch to see permitted destinations.';
  } catch (error) {
    $('data-status').classList.add('error');
    $('data-status').textContent = 'Branch data could not be loaded. ' + error.message + (location.protocol === 'file:' ? ' Open this site through the local preview server or its hosted link.' : ' Please reload or contact your administrator.');
  }
})();
