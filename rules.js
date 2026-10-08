(function (root) {
  'use strict';
  const uoms = ['Pieces', 'Head', 'Kilogram', 'Packets', 'Box', 'Rolls', 'Jar', 'Litre', 'Bottle', 'Can', 'TIN', 'SET', 'Carton', 'Tubs', 'Gallon', 'Unit', 'Yards', 'Each', 'Square Metre', 'Millilitre', 'Metre', 'Bunch'];
  // Ignore casing, spacing and a separator before an entity's final numeric identifier.
  // Preserve the identifier: entities 0839 and 643223 must remain different.
  function entityKey(name) {
    return name.trim().replace(/\s*-\s*(?=\d+\s*$)/, ' ').replace(/\s+/g, ' ').toUpperCase();
  }
  function transferDetails(route) {
    const internal = !!route.fromEntity && !!route.toEntity && entityKey(route.fromEntity) === entityKey(route.toEntity);
    if(route.detailsMissing) return {internal,type:internal?'Internal Transfer':'Intercompany Sales/Purchase',prefix:internal?'TR':'IC',codeLabel:'Supplier code',code:'',supplier:''};
    return { internal, type: internal ? 'Internal Transfer' : 'Intercompany Sales/Purchase', prefix: internal ? 'TR' : 'IC', codeLabel: internal ? 'TR code' : 'Supplier code', code: internal ? route.code : ((route.supplier || '').match(/(\d+)\s*$/)?.[1] || ''), supplier: internal ? '' : route.supplier };
  }
  function barcodeDetails(value) {
    return /^4\d{12}$/.test(value) ? { code: value.slice(1, 7), batch: value.slice(-6) } : null;
  }
  function barcode3Details(value) { return /^3\d{12}$/.test(value) ? { code: value.slice(1, 7) } : null; }
  function branchMatches(name, query) {
    const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const text = normalize(name);
    return normalize(query).split(/\s+/).filter(Boolean).every(word => text.includes(word));
  }
  // Missing pairs can use unambiguous branch records, without inventing a route code.
  function branchProfile(routes, country, branch) {
    const outgoing = routes.filter(r => r.country === country && r.from === branch);
    const incoming = routes.filter(r => r.country === country && r.to === branch);
    const records = outgoing.length ? outgoing.map(r => ({entity:r.fromEntity,warehouse:r.fromWarehouse,supplier:r.supplier})) : incoming.map(r => ({entity:r.toEntity,warehouse:r.toWarehouse,supplier:''}));
    if (!records.length || records.some(r => !r.entity || !r.warehouse)) return null;
    if (new Set(records.map(r => entityKey(r.entity))).size !== 1 || new Set(records.map(r => r.warehouse)).size !== 1) return null;
    const suppliers = [...new Set(records.map(r => r.supplier).filter(Boolean))];
    return {...records[0], supplier:suppliers.length === 1 ? suppliers[0] : ''};
  }
  function unconfiguredRoute(routes, country, from, to) {
    if (!from || !to || from === to) return null;
    const source=branchProfile(routes,country,from),destination=branchProfile(routes,country,to);
    return {country,criteria:from+to,from,to,code:'',name:from+' to '+to,
      fromEntity:source?.entity||'',toEntity:destination?.entity||'',
      fromWarehouse:source?.warehouse||'',toWarehouse:destination?.warehouse||'',
      supplier:source?.supplier||'',unconfigured:true,detailsMissing:true};
  }
  function hasSignature(strokes) { return Array.isArray(strokes) && strokes.some(stroke => Array.isArray(stroke) && stroke.some((p,i) => i > 0 && Math.hypot(p[0]-stroke[i-1][0],p[1]-stroke[i-1][1]) > .002)); }
  const api = { hasSignature, branchMatches, branchProfile, unconfiguredRoute, uoms, transferDetails, barcodeDetails, barcode3Details, entityKey };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TransferRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

