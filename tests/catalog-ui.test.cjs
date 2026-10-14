const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('../tmp/test-runtime/node_modules/jsdom');
const {toCSV,schemas}=require('../admin-catalogs.js');
const {parseCSV}=require('../csv.js');
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://inventory.test/#admin',runScripts:'outside-only'}),w=dom.window,d=w.document;
const tick=()=>new Promise(setImmediate),data=toCSV(schemas['products.csv'],[['100001','Current product','Pieces','N','001234567890']]);
let writes=0,exportCount=0,refreshed=0,updateEvents=0,lastArgs=null;
w.TextDecoder=TextDecoder;w.Blob=class{constructor(parts){this.parts=parts;}};w.URL.createObjectURL=blob=>{assert.equal(blob.parts[0],'\uFEFF'+data);exportCount++;return 'blob:test';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
w.InventoryI18n={setText:(node,text)=>node.textContent=text,translate:s=>s};w.TransferCSV={parseCSV};w.InventoryAdmin={refresh:async()=>refreshed++};w.addEventListener('inventory-catalog-updated',()=>updateEvents++);
const client={rpc:async(name,args)=>{if(name==='inventory_catalog_metadata')return{data:{'products.csv':{revision:7}},error:null};if(name==='inventory_catalog')return{data,error:null};if(name==='inventory_admin_update_catalog'){writes++;lastArgs=args;return{data:{revision:8},error:null};}throw new Error(name);}};
w.eval(fs.readFileSync('admin-catalogs.js','utf8'));
function file(text){const b=Buffer.from(text);Object.defineProperty(d.getElementById('catalog-file'),'files',{value:[{size:b.length,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}],configurable:true});d.getElementById('catalog-file').dispatchEvent(new w.Event('change'));}
(async()=>{try{
 w.InventoryCatalogs.load(client,{role:'branch'});assert.equal(d.getElementById('catalog-panel').hidden,true);
 w.InventoryCatalogs.load(client,{role:'admin'});assert.equal(d.getElementById('catalog-panel').hidden,false);
 d.querySelector('[data-catalog-export="products.csv"]').click();await tick();assert.equal(exportCount,1);
 d.querySelector('[data-catalog-update="products.csv"]').click();file(toCSV(schemas['products.csv'],[['100002','<img onerror="bad()">','Pieces','Y','001234567891']]));await tick();
 assert.equal(writes,0,'choosing an upload never saves before review');assert.equal(d.getElementById('catalog-preview').hidden,false);assert.equal(d.querySelector('#catalog-sample img'),null,'preview safely renders CSV as text');assert.ok(d.querySelector('#catalog-sample td[data-no-translate]'));
 d.getElementById('catalog-save').click();await tick();assert.equal(writes,0,'replacement requires explicit confirmation');d.getElementById('catalog-confirm').checked=true;d.getElementById('catalog-save').click();await tick();assert.equal(writes,1);assert.equal(lastArgs.expected_revision,7);assert.equal(lastArgs.catalog_rows[0][4],'001234567891');assert.equal(refreshed,1);assert.equal(updateEvents,1);assert.equal(d.getElementById('catalog-preview').hidden,true);
 d.querySelector('[data-catalog-update="products.csv"]').click();file(toCSV(schemas['products.csv'],[['123','Invalid','Pieces','N','']]));await tick();assert.equal(writes,1,'invalid upload never reaches database');assert.equal(d.getElementById('catalog-preview').hidden,true);assert.match(d.getElementById('catalog-status').textContent,/6 digits/);
 w.InventoryCatalogs.hide();assert.equal(d.getElementById('catalog-panel').hidden,true);assert.equal(d.querySelector('#catalog-sample table'),null,'logout clears preview data');
 console.log('Catalog UI tests passed: Admin gate, fresh export, explicit upload preview, text safety, revision check, invalid-file rejection and logout cleanup.');
}finally{w.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
