(function(root){
 'use strict';
 const schemas={
  'products.csv':['Product Code','Product Name','UOM','Batched Product','UPC'],
  'TRANSFER_CONF.csv':['COUNTRY','CRITERIA','CODE','Name','From Warehouse','FROM BUSINESS UNIT','FROM LEGAL ENTITY','To Warehouse','To Business Unit','TO LEGAL ENTITY','SUPPLIER']
 };
 function toCSV(headers,rows){return headers.join(',')+'\r\n'+rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';}
 function prepare(name,text,parser,legacy=false){
  const headers=schemas[name];if(!headers)throw new Error('Unknown catalog');
  const table=parser(text),source=(table.shift()||[]).map(v=>v.trim());
  if(new Set(source).size!==source.length)throw new Error('Duplicate CSV column headers.');
  for(const h of headers)if(!source.includes(h))throw new Error('Missing CSV column: '+h);
  const rows=[],profiles=new Map(),upcs=new Map(),branches=new Map();let skipped=0,cleared=0;
  table.forEach((raw,index)=>{
   const line=index+2;if(raw.length!==source.length)throw new Error('Unexpected column count in row '+line);
   const row=headers.map(h=>raw[source.indexOf(h)].trim());
   if(row.some(v=>v.length>1000||/[\r\n]/.test(v)))throw new Error('Multiline or overlong cell in row '+line);
   if(name==='products.csv'){
    if(!/^\d{6}$/.test(row[0])){if(legacy){skipped++;return;}throw new Error('Product code must contain exactly 6 digits in row '+line);}
    if(!row[1]||!row[2])throw new Error('Product name and UOM are required in row '+line);
    if(/^(Y|YES|TRUE|1)$/i.test(row[3]))row[3]='Y';else if(/^(N|NO|FALSE|0)$/i.test(row[3]))row[3]='N';else throw new Error('Batched Product must be Y or N in row '+line);
    if(row[4]&&!/^\d{1,64}$/.test(row[4])){if(legacy){row[4]='';cleared++;}else throw new Error('UPC must contain digits only in row '+line);}
    const profile=JSON.stringify(row.slice(1,4));if(profiles.has(row[0])&&profiles.get(row[0])!==profile)throw new Error('Conflicting product code: '+row[0]);profiles.set(row[0],profile);
    if(row[4]){if(upcs.has(row[4])&&upcs.get(row[4])!==row[0]){if(!legacy)throw new Error('UPC assigned to multiple products: '+row[4]);upcs.set(row[4],null);}else if(!upcs.has(row[4]))upcs.set(row[4],row[0]);}
   }else{
    if(!row[0]||!row[1]||!row[2]||!row[3]||!row[5]||!row[8])throw new Error('Country, criteria, code, name and both business units are required in row '+line);
    if(row[1]!==row[5]+row[8])throw new Error('CRITERIA must equal the two business unit names joined together in row '+line);
    for(const n of [5,8]){const number=row[n].match(/^(\d+)\s*-/)?.[1];if(!number)throw new Error('Business unit must include branch number in row '+line);const profile=JSON.stringify([row[n],row[0]]);if(branches.has(number)&&branches.get(number)!==profile)throw new Error('Conflicting branch number: '+number);branches.set(number,profile);}
   }
   rows.push(row);
  });
  if(!rows.length||rows.length>60000)throw new Error('CSV must contain between 1 and 60000 rows.');
  if(legacy)for(const row of rows)if(row[4]&&name==='products.csv'&&upcs.get(row[4])===null){row[4]='';cleared++;}
  return {headers,rows,skipped,cleared,csv:toCSV(headers,rows)};
 }
 if(typeof module!=='undefined'&&module.exports){module.exports={schemas,toCSV,prepare};return;}
 let client=null,pending=null,busy=false;const el=id=>document.getElementById('catalog-'+id);
 function say(message){root.InventoryI18n.setText(el('status'),message);}
 function hide(){client=null;pending=null;el('panel').hidden=true;el('preview').hidden=true;el('file').value='';el('sample').replaceChildren();}
 function load(connection,access){hide();if(access?.role!=='admin')return;client=connection;el('panel').hidden=false;}
 async function current(name){if(!client)throw new Error('Administrator access required');const {data:meta,error}=await client.rpc('inventory_catalog_metadata');if(error||!meta?.[name])throw new Error('Catalog setup is not ready.');const response=await client.rpc('inventory_catalog',{catalog_name:name});if(response.error||typeof response.data!=='string')throw new Error('Could not read current catalog.');return {text:response.data,revision:meta[name].revision};}
 async function exporting(name){if(busy||!client)return;busy=true;try{say('Preparing current catalog…');const data=await current(name),result=prepare(name,data.text,root.TransferCSV.parseCSV,true),url=URL.createObjectURL(new Blob(['\uFEFF'+result.csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);say(name==='products.csv'?'Products CSV exported. All usable products are included; unsupported legacy item codes and invalid UPC values are excluded.':'Transfer configurations CSV exported with all current routes.');}catch(_){say('Could not export. Check your access and catalog setup.');}finally{busy=false;}}
 for(const button of document.querySelectorAll('[data-catalog-export]'))button.addEventListener('click',()=>exporting(button.dataset.catalogExport));
 for(const button of document.querySelectorAll('[data-catalog-update]'))button.addEventListener('click',()=>{if(busy||!client)return;pending={name:button.dataset.catalogUpdate};el('preview').hidden=true;el('file').value='';el('file').click();});
 el('file').addEventListener('change',async()=>{const file=el('file').files[0];if(!file||!pending||busy)return;busy=true;try{if(file.size>10*1024*1024)throw new Error('Choose a CSV smaller than 10 MB.');const bytes=await file.arrayBuffer();let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch(_){text=new TextDecoder('windows-1252').decode(bytes);}const result=prepare(pending.name,text,root.TransferCSV.parseCSV),data=await current(pending.name);pending={name:pending.name,result,revision:data.revision};el('preview-title').textContent=(pending.name==='products.csv'?'Products':'Transfer Configurations')+' · '+result.rows.length+' rows';el('sample').replaceChildren();const table=document.createElement('table'),thead=document.createElement('thead'),tr=document.createElement('tr');result.headers.forEach(h=>{const th=document.createElement('th');th.textContent=h;tr.append(th);});thead.append(tr);table.append(thead);const body=document.createElement('tbody');result.rows.slice(0,5).forEach(row=>{const r=document.createElement('tr');row.forEach(v=>{const td=document.createElement('td');td.dataset.noTranslate='';td.textContent=v;r.append(td);});body.append(r);});table.append(body);el('sample').append(table);el('preview').hidden=false;say('CSV validated. Review the preview, then replace the complete current list.');}catch(error){pending=null;el('preview').hidden=true;say('CSV was not saved. '+root.InventoryI18n.translate(error.message));}finally{busy=false;}});
 el('cancel').addEventListener('click',()=>{pending=null;el('preview').hidden=true;say('Update cancelled. Current data is unchanged.');});
 el('save').addEventListener('click',async()=>{if(!pending?.result||busy||!client)return;busy=true;el('save').disabled=true;try{const {data,error}=await client.rpc('inventory_admin_update_catalog',{catalog_name:pending.name,catalog_rows:pending.result.rows,expected_revision:pending.revision});if(error)throw error;pending=null;el('preview').hidden=true;await root.InventoryAdmin.refresh();say('Catalog updated. Open forms retain their data; the update applies automatically after returning to All forms.');root.dispatchEvent(new Event('inventory-catalog-updated'));}catch(error){say(error?.message?.includes('CATALOG_CHANGED')?'The catalog changed since your preview. Export the latest list and try again.':error?.message?.includes('active account branch')?'An active branch is missing. Upload the complete transfer configuration list.':'Update failed. Current data is unchanged. Check the CSV and database setup.');}finally{busy=false;el('save').disabled=false;}});
 root.InventoryCatalogs={load,hide,get busy(){return busy;}};
})(typeof globalThis!=='undefined'?globalThis:this);
