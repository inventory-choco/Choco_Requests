(function(root){
 'use strict';
 let fontPromise;
 async function createTransferPDF(data,lib,assets){
  const {PDFDocument,StandardFonts,rgb}=lib||root.PDFLib,doc=await PDFDocument.create();
  const normal=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const lang=data.language==='ar'?'ar':'en',i18n=typeof module!=='undefined'&&module.exports?require('./language.js'):root.InventoryI18n,h=text=>i18n.header(text,lang);
  let arabicFont;
  if(lang==='ar'||/[\u0600-\u06ff]/.test(JSON.stringify(data))){
   let bytes=assets?.fontBytes,kit=assets?.fontkit||root.fontkit;
   if(!bytes){fontPromise||=(async()=>{const response=await fetch('vendor/fonts/Arabic-Regular.ttf');if(!response.ok)throw new Error('Arabic PDF font could not be loaded.');return new Uint8Array(await response.arrayBuffer());})();bytes=await fontPromise;}
   if(!kit)throw new Error('Arabic PDF font library could not be loaded.');doc.registerFontkit(kit);arabicFont=await doc.embedFont(bytes,{subset:true});
  }
  const teal=rgb(.035,.36,.47),black=rgb(0,0,0),gray=rgb(.9,.94,.96),white=rgb(1,1,1),details=data.details;
  const itemsAll=data.items.filter(item=>Object.values(item).some(Boolean));const chunks=[];for(let i=0;i<itemsAll.length;i+=22)chunks.push(itemsAll.slice(i,i+22));if(!chunks.length)chunks.push([]);
  function fontFor(text,heavy){return /[\u0600-\u06ff]/.test(text)?arabicFont:heavy?bold:normal;}
  chunks.forEach((items,pageIndex)=>{
   const page=doc.addPage([595.28,841.89]);let y=813;
   function text(value,x,baseline,size=8,heavy=false,color=black){const content=String(value||'');page.drawText(content,{x,y:baseline,size,font:fontFor(content,heavy),color});}
   function cell(value,x,top,width,height,heavy=false,fill=null,size=8){
    if(fill)page.drawRectangle({x,y:top-height,width,height,color:fill});page.drawRectangle({x,y:top-height,width,height,borderColor:black,borderWidth:.45});
    const content=String(value||''),font=fontFor(content,heavy),available=width-6;let fitted=size;
    while(font.widthOfTextAtSize(content,fitted)>available&&fitted>5)fitted-=.2;
    const lines=[];let line='';for(const character of content){if(font.widthOfTextAtSize(line+character,fitted)>available&&line){lines.push(line);line='';}line+=character;}if(line)lines.push(line);
    if(lines.length>Math.max(1,Math.floor((height-4)/(fitted+1))))throw new Error('Text is too long for the PDF cell: '+content+'. Please shorten this field.');
    lines.forEach((value,index)=>text(value,/[\u0600-\u06ff]/.test(value)?x+width-3-font.widthOfTextAtSize(value,fitted):x+3,top-4-fitted-index*(fitted+1),fitted,heavy,fill===teal?white:black));
   }
   cell(h('TRANSFER REQUEST FORM'),28,y,235,27,true,teal,12);cell(data.reference+(data.version?' / v'+data.version:''),263,y,192,27,true,gray,11);cell(data.date,455,y,112,27,true,teal,10);y-=27;
   const missing=!!data.route.detailsMissing,widths=missing?[95,444]:[95,180,194,70],xs=missing?[28,123]:[28,123,303,497];
   const headings=missing?[data.route.country,h('BRANCH NAME')]:[data.route.country,h('BRANCH NAME'),h('LEGAL ENTITY'),h(details.codeLabel)];headings.forEach((s,i)=>cell(s,xs[i],y,widths[i],21,true,gray));y-=21;
   const from=missing?[h('TRANSFER FROM'),data.route.from]:[h('TRANSFER FROM'),data.route.from,data.route.fromEntity,details.code];from.forEach((s,i)=>cell(s,xs[i],y,widths[i],32,true));y-=32;
   const to=missing?[h('TRANSFER TO'),data.route.to]:[h('TRANSFER TO'),data.route.to,data.route.toEntity,''];to.forEach((s,i)=>cell(s,xs[i],y,widths[i],32,true));y-=32;
   const meta=[];if(!missing){meta.push(['FROM WAREHOUSE',data.route.fromWarehouse],['TO WAREHOUSE',data.route.toWarehouse]);if(!details.internal)meta.push(['SUPPLIER',details.supplier]);}meta.push(['TYPE',details.type],['REASON',data.reason]);
   meta.forEach(([label,value])=>{cell(h(label),28,y,95,18,true,gray);cell(value,123,y,444,18,label==='TYPE');y-=18;});
   if(missing){cell(h('Details not found for this branch combination.'),28,y,539,20,false,gray,8);y-=20;}
   const cols=[18,78,48,76,82,135,56,46],headers=['#','4 BARCODE','ITEM CODE','3 BARCODE','BATCH','ITEM NAME','UOM','QUANTITY'];let x=28;headers.forEach((label,i)=>{cell(h(label),x,y,cols[i],22,true,teal,7);x+=cols[i];});y-=22;
   for(let i=0;i<22;i++){const item=items[i],values=item?[String(pageIndex*22+i+1),item.barcode4,item.code,item.barcode3,item.batch,item.name,item.uom,Number(item.quantity).toFixed(3)]:['','','','','','','',''];x=28;values.forEach((value,j)=>{cell(value,x,y,cols[j],19,false,null,7);x+=cols[j];});y-=19;}
   y-=17;text(h('Prepared and sent by'),28,y,9,true);text(h('Received by'),350,y,9,true);y-=14;text(data.prepared,28,y,9);text(data.received,350,y,9);
   const top=y-5;for(const stroke of data.signature||[])for(let i=1;i<stroke.length;i++)page.drawLine({start:{x:28+stroke[i-1][0]*230,y:top-stroke[i-1][1]*48},end:{x:28+stroke[i][0]*230,y:top-stroke[i][1]*48},thickness:1,color:teal});
   page.drawLine({start:{x:28,y:top-50},end:{x:270,y:top-50},thickness:.5,color:black});page.drawLine({start:{x:350,y:top-50},end:{x:567,y:top-50},thickness:.5,color:black});
   text(`${h('Page')} ${pageIndex+1} ${h('of')} ${chunks.length} | ${h('Items')} ${pageIndex*22+1}-${pageIndex*22+items.length}`,28,24,8);
  });doc.setTitle('Inventory Department Transfer '+data.reference);return doc.save();
 }
 const api={createTransferPDF};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TransferPDF=api;
})(typeof globalThis!=='undefined'?globalThis:this);
