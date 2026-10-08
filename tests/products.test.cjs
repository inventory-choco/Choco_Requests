const assert=require('node:assert/strict'),fs=require('node:fs'),{parseCSV}=require('../csv'),{readProducts,resolveBarcode}=require('../products');
const catalog=readProducts(fs.readFileSync('products.csv','utf8'),parseCSV);
assert.ok(catalog.upcs.size>0);assert.deepEqual(resolveBarcode('4108701148970'),{code:'108701',batch:'148970',kind:'4'});assert.deepEqual(resolveBarcode('3108701427547'),{code:'108701',batch:'',kind:'3'});
for(const v of ['410870114897','41087011489700','310870142754a','9108701427547'])assert.equal(resolveBarcode(v,catalog.upcs),null);
for(const [upc,code]of catalog.upcs)if(code)assert.equal(resolveBarcode(upc,catalog.upcs).code,code);
const synthetic=readProducts('Product Code,Product Name,UOM,Batched Product,UPC\n100001,A,Pieces,N,001234567890\n100002,B,Pieces,Y,777777\n100003,C,Pieces,N,777777',parseCSV);
assert.equal(resolveBarcode('001234567890',synthetic.upcs).code,'100001');assert.equal(resolveBarcode('777777',synthetic.upcs),null,'ambiguous UPC rejected');assert.equal(resolveBarcode('1234567890',synthetic.upcs),null,'leading zero preserved');
console.log('Product barcode tests passed:',catalog.products.size,'products and',catalog.upcs.size,'UPC entries.');
