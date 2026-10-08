(function(root){
 'use strict';
 function readProducts(text,parser){
   const parse=parser||(root.TransferCSV&&root.TransferCSV.parseCSV),table=parse(text),headers=(table.shift()||[]).map(v=>v.trim());
   for(const name of ['Product Code','Product Name','UOM','Batched Product'])if(!headers.includes(name))throw new Error('Missing product column: '+name);
   const products=new Map(),uoms=new Set();let skipped=0;
   table.forEach((row,index)=>{if(row.length!==headers.length)throw new Error('Product CSV row '+(index+2)+' has an unexpected number of columns.');const get=name=>row[headers.indexOf(name)].trim();const code=get('Product Code');if(get('UOM'))uoms.add(get('UOM'));if(!/^\d{6}$/.test(code)){skipped++;return;}const product={code,name:get('Product Name'),uom:get('UOM'),batched:/^(Y|YES|TRUE|1)$/i.test(get('Batched Product'))};if(products.has(code)&&JSON.stringify(products.get(code))!==JSON.stringify(product))throw new Error('Conflicting product code: '+code);products.set(code,product);if(product.uom)uoms.add(product.uom);});
   return {products,skipped,uoms:[...uoms].sort((a,b)=>a.localeCompare(b))};
 }
 const api={readProducts};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.InventoryProducts=api;
})(typeof globalThis!=='undefined'?globalThis:this);
