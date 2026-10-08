const assert=require('node:assert/strict');
const fs=require('node:fs');
const lib=require('../vendor/pdf-lib.min.js');
const {createTransferPDF}=require('../pdf.js');
const {readRoutes}=require('../csv.js');
const {transferDetails}=require('../rules.js');
(async()=>{
 const route=readRoutes(fs.readFileSync('TRANSFER_CONF.csv','utf8')).find(r=>r.code==='1125');
 const data={route,details:transferDetails(route),reference:'TR 071026-150000',version:2,date:'2026-10-07',reason:'Shop Request',prepared:'PDF test',received:'',signature:[[[0.1,0.2],[0.3,0.8],[0.6,0.3]]],items:Array.from({length:23},(_,i)=>({barcode4:'4108701148970',code:String(100001+i),barcode3:'3108701427547',batch:'347036-:07102026',name:'PREMIUM TRAY 200-399',uom:'Pieces',quantity:'1'}))};
 const bytes=await createTransferPDF(data,lib);
 assert.equal((await lib.PDFDocument.load(bytes)).getPageCount(),2);
 fs.mkdirSync('tmp/pdfs',{recursive:true});fs.writeFileSync('tmp/pdfs/transfer-test.pdf',bytes);
 const one=await createTransferPDF({...data,items:data.items.slice(0,22)},lib);assert.equal((await lib.PDFDocument.load(one)).getPageCount(),1);
 const three=await createTransferPDF({...data,items:[...data.items,...data.items]},lib);assert.equal((await lib.PDFDocument.load(three)).getPageCount(),3);
 console.log('PDF pagination passed: 22 = 1 page, 23 = 2 pages, 46 = 3 pages.');
})().catch(e=>{console.error(e);process.exitCode=1;});


