// Test-only local input. Private master CSVs must never be added to the published repository.
const fs=require('node:fs'),path=require('node:path');
function readCatalog(name){const directory=process.env.INVENTORY_CATALOG_DIR||path.resolve(__dirname,'../../TRANSFER/private-access/catalogs');return fs.readFileSync(path.join(directory,name),'utf8');}
function mockAuth(window){window.InventoryAuth={active:true,accountId:'offline-test-admin',storage:window.localStorage,catalog:async name=>readCatalog(name),allowedBranch:()=>true,assertActive:async()=>true,applyBranch(){}};}
module.exports={readCatalog,mockAuth};
