const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readRoutes } = require('../csv.js');
const { transferDetails, barcodeDetails, barcode3Details, branchMatches, unconfiguredRoute, hasSignature, uoms } = require('../rules.js');
const routes = readRoutes(fs.readFileSync(path.join(__dirname, '..', 'TRANSFER_CONF.csv'), 'utf8'));
const internal = routes.find(route => route.code === '1125');
assert.ok(internal);
assert.equal(transferDetails(internal).type, 'Internal Transfer');
assert.equal(transferDetails(internal).code, '1125');
assert.equal(transferDetails(internal).supplier, '');
assert.equal(transferDetails({fromEntity:'Chocolala LLC 643223',toEntity:'CHOCOLALA LLC 0839',supplier:'Chocolala LLC - 643223'}).type,'Intercompany Sales/Purchase');
assert.equal(transferDetails({fromEntity:'Chocolala LLC 643223',toEntity:'Chocolala LLC - 643223',code:'1125'}).type,'Internal Transfer');
assert.equal(transferDetails({fromEntity:'Chocolala LLC 643223',toEntity:'Chocolala LLC',supplier:'Chocolala LLC - 643223'}).type,'Intercompany Sales/Purchase');
const supplied = ['CHOCOLALA LLC - 0839','Chocolala LLC One Person - 26471','Chocola Pure LLC. One Person - 46697','Chocolala LLC Sole Proprietorship - 601849','Chocolala LLC - 643223','Chocola Pure - Sole Proprietorship LLC - CN-2865838'];
const expected = ['0839','26471','46697','601849','643223','2865838'];
supplied.forEach((supplier,index) => {
  const details = transferDetails({fromEntity:'A',toEntity:'B',supplier});
  assert.equal(details.code, expected[index]); assert.equal(details.type, 'Intercompany Sales/Purchase');
});
['CHOCOLALA - FOREIGN BRANCH COMPANY','ALABSI AND PARTNERS TRADING','Chocolala for Trading','ATAYEB CHOCOLATE SOLE PROPRITORSHIP LLC','CHOCOLALA FACTORY LLC (ONE PERSON)','GARDEN GRACE FLOWERS'].forEach(supplier => assert.equal(transferDetails({fromEntity:'A',toEntity:'B',supplier}).code,''));
assert.deepEqual(barcodeDetails('4108701148970'), {code:'108701',batch:'148970'});
assert.equal(barcodeDetails('41087011148970'), null);
assert.equal(barcodeDetails('410870111489700'), null);
assert.equal(barcodeDetails('410870114897'), null);
assert.equal(barcodeDetails('3108701148970'), null);
assert.equal(barcodeDetails('410870114897a'), null);
assert.equal(uoms.length, 22);
const inconsistent = routes.filter(route => route.criteria !== route.from + route.to);
console.log(`Transfer rule tests passed. ${inconsistent.length} CSV rows have CRITERIA differing from concatenated branch names.`);


assert.deepEqual(barcode3Details('3108701427547'),{code:'108701'});
for(const value of ['310870142754','31087014275477','4108701427547','310870142754a'])assert.equal(barcode3Details(value),null);

assert.deepEqual(barcode3Details('3108701427547'),{code:'108701'});
for(const value of ['310870142754','31087014275477','4108701427547','310870142754a'])assert.equal(barcode3Details(value),null);

assert.equal(branchMatches('Madinati Mall Zayed','madin zay'),true);
assert.equal(branchMatches('Madinati Mall Zayed','zay madin'),true);
assert.equal(branchMatches('Chocolala Al Ain- 1','ain 1'),true);
assert.equal(branchMatches('Chocolala Barsha Mall','barsha zay'),false);

const hamra=unconfiguredRoute(routes,'UAE',routes.find(r=>r.code==='1718').from,internal.from);
assert.ok(hamra);assert.equal(hamra.code,'');assert.equal(transferDetails(hamra).type,'Intercompany Sales/Purchase');
assert.equal(transferDetails(hamra).code,'46697');assert.equal(hamra.detailsMissing,false);
assert.equal(unconfiguredRoute(routes,'UAE','Chocola Pure Al Hamra','Chocola Pure Al Hamra'),null);
const conflict=[{country:'UAE',from:'A',fromEntity:'Company A',fromWarehouse:'A WH',to:'B',toEntity:'Company B',toWarehouse:'B WH'},{country:'UAE',from:'A',fromEntity:'Company C',fromWarehouse:'A WH',to:'C',toEntity:'Company C',toWarehouse:'C WH'}];
assert.ok(unconfiguredRoute(conflict,'UAE','A','B'));assert.equal(unconfiguredRoute(conflict,'UAE','A','B').detailsMissing,true);

assert.equal(hasSignature([]),false);assert.equal(hasSignature([[[.2,.2],[.2,.2]]]),false);assert.equal(hasSignature([[[.2,.2],[.3,.4]]]),true);

const exactExample=unconfiguredRoute(routes,'UAE','216 - Chocola Pure Al Hamra','249 - Chocolala Al Ain- 2');assert.match(exactExample.fromEntity,/46697/);assert.match(exactExample.toEntity,/643223/);assert.equal(transferDetails(exactExample).type,'Intercompany Sales/Purchase');
