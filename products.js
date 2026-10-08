(function(root){
 'use strict';
 function readProducts(text,parser){
   const parse=parser||(root.TransferCSV&&root.TransferCSV.parseCSV),table=parse(text),headers=(table.shift()||[]).map(v=>v.trim());
   for(const name of ['Product Code','Product Name','UOM','Batched Product'])if(!headers.includes(name))throw new Error('Missing product column: '+name);
   const products=new Map(),upcs=new Map(),uoms=new Set();let skipped=0;
   table.forEach((row,index)=>{if(row.length!==headers.length)throw new Error('Product CSV row '+(index+2)+' has an unexpected number of columns.');const get=name=>row[headers.indexOf(name)].trim();const code=get('Product Code');if(get('UOM'))uoms.add(get('UOM'));if(!/^\d{6}$/.test(code)){skipped++;return;}const product={code,name:get('Product Name'),uom:get('UOM'),batched:/^(Y|YES|TRUE|1)$/i.test(get('Batched Product'))};if(products.has(code)&&JSON.stringify(products.get(code))!==JSON.stringify(product))throw new Error('Conflicting product code: '+code);products.set(code,product);const upc=headers.includes('UPC')?get('UPC'):'';if(/^\d+$/.test(upc)){if(upcs.has(upc)&&upcs.get(upc)!==code)upcs.set(upc,null);else if(!upcs.has(upc))upcs.set(upc,code);}if(product.uom)uoms.add(product.uom);});
   return {products,upcs,skipped,uoms:[...uoms].sort((a,b)=>a.localeCompare(b))};
 }
 function resolveBarcode(value,upcs=new Map()){if(!/^\d+$/.test(value))return null;const matched=upcs.get(value),four=/^4\d{12}$/.test(value),three=/^3\d{12}$/.test(value);if(upcs.has(value)&&!matched)return null;if(!matched&&!four&&!three)return null;return {code:matched||value.slice(1,7),batch:four?value.slice(-6):'',kind:four?'4':three?'3':'upc'};}
 const api={readProducts,resolveBarcode};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.InventoryProducts=api;
})(typeof globalThis!=='undefined'?globalThis:this);
