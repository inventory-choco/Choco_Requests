const assert=require('node:assert/strict'),fs=require('node:fs');
const lib=require('../vendor/pdf-lib.min.js'),fontkit=require('../vendor/fontkit.umd.min.js');
const {createTransferPDF}=require('../pdf.js'),{readRoutes}=require('../csv.js'),{transferDetails,unconfiguredRoute}=require('../rules.js');
(async()=>{
 const routes=readRoutes(fs.readFileSync('TRANSFER_CONF.csv','utf8')),route=routes.find(r=>r.code==='1125');
 const data={language:'ar',route,details:transferDetails(route),reference:'TR 081026-120000',version:1,date:'2026-10-08',reason:'Shop Request',prepared:'TEST PREPARER',received:'',signature:[[[.1,.2],[.3,.8],[.6,.3]]],items:Array.from({length:23},()=>({barcode4:'4117474148970',code:'117474',barcode3:'',batch:'148970',name:'PREMIUM MILO WAFER JAR 300G',uom:'Pieces',quantity:'1'}))};
 const assets={fontkit,fontBytes:fs.readFileSync('vendor/fonts/Arabic-Regular.ttf')};
 fs.mkdirSync('tmp/pdfs',{recursive:true});
 const bytes=await createTransferPDF(data,lib,assets);assert.equal((await lib.PDFDocument.load(bytes)).getPageCount(),2);fs.writeFileSync('tmp/pdfs/arabic-test.pdf',bytes);
 const from=routes.find(r=>r.code==='1718').from,to=route.from,missing=unconfiguredRoute(routes,'UAE',from,to);
 const missingBytes=await createTransferPDF({...data,language:'en',route:missing,details:transferDetails(missing),items:data.items.slice(0,1)},lib);fs.writeFileSync('tmp/pdfs/missing-details-test.pdf',missingBytes);
 console.log('Arabic PDF and missing-details PDF tests passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
