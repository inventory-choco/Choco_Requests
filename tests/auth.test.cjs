const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('../tmp/test-runtime/node_modules/jsdom');
const {allowedAccess,storageKey,allowedBranch}=require('../auth.js');
const {readCatalog}=require('./private-catalog.cjs');
const branch={role:'branch',branch_number:'216',branch_name:'216 - Chocola Pure Al Hamra',country:'UAE'};
assert.equal(allowedAccess(null),false);assert.equal(allowedAccess({role:'branch'}),false);
assert.equal(allowedBranch(branch,'UAE',branch.branch_name),true);
assert.equal(allowedBranch(branch,'UAE','249 - Chocolala Al Ain- 2'),false);
assert.equal(allowedBranch(branch,'OMAN',branch.branch_name),false);
assert.notEqual(storageKey('one','drafts'),storageKey('two','drafts'));assert.throws(()=>storageKey('','drafts'));
const html=fs.readFileSync('index.html','utf8');
assert.ok(!html.includes('src="app.js'),'forms cannot start before approval');
assert.ok(html.includes('id="workspace" hidden inert'));
assert.equal(fs.existsSync('products.csv'),false);assert.equal(fs.existsSync('TRANSFER_CONF.csv'),false);
assert.equal(/fetch\(['"](?:products|TRANSFER_CONF)\.csv/.test(fs.readFileSync('app.js','utf8')),false);
function setup(initial){
 const dom=new JSDOM(html,{url:'https://inventory.test/#transfer',runScripts:'outside-only'}),w=dom.window,d=w.document;
 const state={access:initial,user:initial===undefined?null:{id:'test-user',email:'approved@example.invalid'},calls:[],scripts:[],authOptions:null};
 w.TextDecoder=TextDecoder;w.TextEncoder=TextEncoder;w.structuredClone=structuredClone;
 w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}});
 w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:300});w.URL.createObjectURL=()=> 'blob:offline-test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 w.fetch=async url=>{assert.ok(!String(url).includes('.csv'),'no public catalog requests');return {ok:true,headers:{get:()=>null},text:async()=>html};};
 const client={auth:{getSession:async()=>({data:{session:state.user?{user:state.user}:null}}),getUser:async()=>({data:{user:state.user},error:null}),onAuthStateChange(){},signInWithOAuth:async()=>({error:null})},rpc:async(name,args)=>{state.calls.push(name);if(name==='inventory_my_access')return{data:state.access||null,error:null};if(name==='inventory_catalog_metadata')return {data:{'products.csv':{revision:1},'TRANSFER_CONF.csv':{revision:1}},error:null};if(name==='inventory_catalog')return{data:readCatalog(args.catalog_name),error:null};if(name==='inventory_admin_users')return{data:[{email:'admin@example.invalid',role:'admin',enabled:true}],error:null};if(name==='inventory_admin_branches')return{data:[],error:null};throw new Error('Unexpected RPC '+name);}};
 w.supabase={createClient:(url,key,options)=>{state.authOptions=options;return client;}};
 const append=d.head.append.bind(d.head);
 d.head.append=node=>{if(node.tagName==='SCRIPT'&&node.src){state.scripts.push(new URL(node.src).pathname);setImmediate(()=>{try{vm.runInContext(fs.readFileSync(new URL(node.src).pathname.slice(1),'utf8'),dom.getInternalVMContext());node.onload();}catch(e){state.failure=e;node.onerror();}});return;}append(node);};
 for(const file of ['csv.js','rules.js','products.js','language.js','admin-users.js','admin-catalogs.js','activity.js','auth.js'])vm.runInContext(fs.readFileSync(file,'utf8'),dom.getInternalVMContext());
 return {dom,w,d,state};
}
async function settle(test,predicate){for(let n=0;n<200;n++){if(test.state.failure)throw test.state.failure;if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw new Error('Timed out: '+test.d.getElementById('auth-status').textContent);}
(async()=>{
 for(const initial of [undefined,null]){const t=setup(initial);try{await settle(t,()=>!t.d.getElementById('auth-google').disabled);assert.equal(t.d.getElementById('workspace').hidden,true);assert.deepEqual(t.state.scripts,[]);assert.equal(t.state.calls.includes('inventory_catalog'),false);}finally{t.w.close();}}
 const t=setup(branch);try{
  await settle(t,()=>!t.d.getElementById('workspace').hidden);await new Promise(setImmediate);
  assert.equal(t.state.authOptions.auth.flowType,'pkce');assert.equal(t.state.authOptions.auth.detectSessionInUrl,false);
  assert.equal(t.d.getElementById('country').disabled,true);assert.equal(t.d.getElementById('from').readOnly,true);
  assert.equal(t.d.getElementById('from').value,branch.branch_name);t.d.getElementById('from').dispatchEvent(new t.w.Event('focus'));assert.equal(t.d.querySelectorAll('#from-results button').length,1,'source choices restricted to assigned branch');
  for(const prefix of ['sc','sa','of']){assert.equal(t.d.getElementById(prefix+'-country').disabled,true);assert.equal(t.d.getElementById(prefix+'-branch').value,branch.branch_name);assert.equal(t.d.getElementById(prefix+'-branch').readOnly,true);}
  const target=t.d.getElementById('to');target.value='249 - Chocolala Al Ain- 2';target.dispatchEvent(new t.w.Event('input'));assert.match(t.d.getElementById('to-entity').textContent,/643223/);
  assert.equal(t.d.getElementById('admin-link').hidden,true);assert.equal(t.state.calls.includes('inventory_admin_users'),false);
  t.w.InventoryAuth.storage.setItem('draft','branch only');assert.equal(t.w.localStorage.getItem('draft'),null);assert.equal(t.w.localStorage.getItem(storageKey('test-user','draft')),'branch only');
  const recorded=[];t.w.InventoryActivity.download=(page,format)=>recorded.push({page,format});let generated=0;t.w.TransferPDF.createTransferPDF=async()=>{generated++;await new Promise(r=>setTimeout(r,20));return new Uint8Array([1,2,3]);};
  const code=t.d.querySelector('#item-rows [name=code]');code.value='117588';code.dispatchEvent(new t.w.Event('input',{bubbles:true}));t.d.querySelector('#item-rows [name=quantity]').value='1';t.d.getElementById('prepared').value='Offline tester';const canvas=t.d.getElementById('signature');for(const [type,x,y] of [['pointerdown',80,20],['pointermove',200,100],['pointerup',200,100]]){const event=new t.w.MouseEvent(type,{clientX:x,clientY:y});Object.defineProperty(event,'pointerId',{value:1});canvas.dispatchEvent(event);}
  t.d.getElementById('print-button').click();t.d.getElementById('print-button').click();await new Promise(r=>setTimeout(r,60));assert.equal(generated,1,'concurrent clicks generate one PDF');assert.deepEqual(recorded,[{page:'transfer',format:'pdf'}]);t.d.getElementById('excel-download').click();await new Promise(r=>setTimeout(r,30));assert.equal(recorded.length,2);assert.equal(recorded[1].format,'excel');t.w.TransferPDF.createTransferPDF=async()=>{throw new Error('Synthetic PDF failure');};t.d.getElementById('print-button').click();await new Promise(r=>setTimeout(r,30));assert.equal(recorded.length,2,'failed PDF generation is not counted');
  t.state.access=null;t.d.getElementById('print-button').click();await new Promise(r=>setTimeout(r,30));assert.equal(generated,1,'revoked access blocks another PDF');assert.equal(recorded.length,2,'revoked downloads are not counted');assert.equal(await t.w.InventoryAuth.assertActive(),false);assert.equal(t.d.getElementById('workspace').hidden,true);assert.equal(t.w.InventoryAuth.active,false);assert.throws(()=>t.w.InventoryAuth.storage.setItem('draft','new'));await assert.rejects(t.w.InventoryAuth.catalog('products.csv'));
 }finally{t.w.close();}
 const admin=setup({role:'admin',branch_number:null,branch_name:null,country:null});try{await settle(admin,()=>!admin.d.getElementById('workspace').hidden);await new Promise(setImmediate);assert.equal(admin.d.getElementById('country').disabled,false);assert.equal(admin.d.getElementById('from').readOnly,false);assert.equal(admin.d.getElementById('admin-link').hidden,false);assert.ok(admin.state.calls.includes('inventory_admin_users'));admin.w.location.hash='#admin';await new Promise(r=>setTimeout(r,20));assert.equal(admin.d.getElementById('admin-page').hidden,false);assert.equal(admin.d.getElementById('home').hidden,true);}finally{admin.w.close();}
 console.log('Private login tests passed: signed-out/outsider gates, no public CSV requests, branch defaults, country-wide destinations, account storage, revocation and Admin access.');
})().catch(e=>{console.error(e);process.exitCode=1;});
