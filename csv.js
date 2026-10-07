/* Handles quoted fields, embedded newlines, BOMs and the source's unnamed supplier column. */
(function (root) {
  'use strict';
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    const rows = []; let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') { field += '"'; i++; }
        else if (!quoted && field !== '') throw new Error('Unexpected quote in CSV.');
        else quoted = !quoted;
      } else if (char === ',' && !quoted) { row.push(field); field = ''; }
      else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[i + 1] === '\n') i++;
        row.push(field); if (row.some(value => value.trim())) rows.push(row);
        row = []; field = '';
      } else field += char;
    }
    if (quoted) throw new Error('Unclosed quoted field in CSV.');
    row.push(field); if (row.some(value => value.trim())) rows.push(row);
    return rows;
  }
  function readRoutes(text) {
    const table = parseCSV(text);
    if (!table.length) throw new Error('The branch CSV is empty.');
    const headers = table.shift().map(value => value.trim());
    const required = ['COUNTRY', 'CODE', 'Name', 'From Warehouse', 'FROM BUSINESS UNIT', 'FROM LEGAL ENTITY', 'To Warehouse', 'To Business Unit', 'TO LEGAL ENTITY'];
    for (const name of required) if (!headers.includes(name)) throw new Error('Missing CSV column: ' + name);
    const supplierIndex = headers.includes('SUPPLIER') ? headers.indexOf('SUPPLIER') : headers.findIndex((header, index) => !header && index === 11);
    const routes = table.map((cells, index) => {
      if (cells.length !== headers.length) throw new Error('CSV row ' + (index + 2) + ' has an unexpected number of columns.');
      const get = name => cells[headers.indexOf(name)].trim();
      const route = { country: get('COUNTRY'), code: get('CODE'), name: get('Name'), from: get('FROM BUSINESS UNIT'), fromWarehouse: get('From Warehouse'), fromEntity: get('FROM LEGAL ENTITY'), to: get('To Business Unit'), toWarehouse: get('To Warehouse'), toEntity: get('TO LEGAL ENTITY'), supplier: supplierIndex >= 0 ? cells[supplierIndex].trim() : '' };
      if (!route.country || !route.from || !route.to || !route.code) throw new Error('CSV row ' + (index + 2) + ' is missing route details.');
      return route;
    });
    if (!routes.length) throw new Error('The branch CSV contains no routes.');
    return routes;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { parseCSV, readRoutes };
  else root.TransferCSV = { parseCSV, readRoutes };
})(typeof globalThis !== 'undefined' ? globalThis : this);
