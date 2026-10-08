(function(root){
  'use strict';
  async function createTransferPDF(data, lib) {
    const {PDFDocument,StandardFonts,rgb}=lib || root.PDFLib;
    const doc=await PDFDocument.create();
    const normal=await doc.embedFont(StandardFonts.Helvetica), bold=await doc.embedFont(StandardFonts.HelveticaBold);
    const teal=rgb(.063,.282,.357), black=rgb(0,0,0), gray=rgb(.9,.93,.94), white=rgb(1,1,1);
    const chunks=[]; for(let i=0;i<data.items.length;i+=22)chunks.push(data.items.slice(i,i+22));
    if(!chunks.length)chunks.push([]);
    const details=data.details;
    chunks.forEach((items,pageIndex)=>{
      const page=doc.addPage([595.28,841.89]); let y=813;
      function cell(value,x,top,width,height,heading=false,fill=null,size=8){
        if(fill)page.drawRectangle({x,y:top-height,width,height,color:fill});
        page.drawRectangle({x,y:top-height,width,height,borderColor:black,borderWidth:.45});
        const text=String(value || ''), font=heading?bold:normal;
        const available=width-6;
        let fitted=size; while(font.widthOfTextAtSize(text,fitted)>available && fitted>5) fitted-=.2;
        // Wrap long labels without truncating their text.
        const lines=[];let line='';
        for(const character of text){if(font.widthOfTextAtSize(line+character,fitted)>available && line){lines.push(line);line='';}line+=character;} if(line)lines.push(line);
        const maxLines=Math.max(1,Math.floor((height-4)/(fitted+1)));
        if(lines.length>maxLines)throw new Error('Text is too long for the PDF cell: '+text+'. Please shorten this field.');
        lines.forEach((text,index)=>page.drawText(text,{x:x+3,y:top-3-fitted-index*(fitted+1),font,size:fitted,color:fill===teal?white:black}));
      }
      cell('TRANSFER REQUEST FORM',28,y,235,27,true,teal,12);cell(data.reference+(data.version?' / v'+data.version:''),263,y,192,27,true,gray,11);cell(data.date,455,y,112,27,true,teal,10);y-=27;
      const widths=[95,180,194,70], xs=[28,123,303,497];
      [data.route.country,'BRANCH NAME','LEGAL ENTITY',details.codeLabel].forEach((s,i)=>cell(s,xs[i],y,widths[i],21,true,gray)); y-=21;
      ['TRANSFER FROM',data.route.from,data.route.fromEntity,details.code].forEach((s,i)=>cell(s,xs[i],y,widths[i],32,true)); y-=32;
      ['TRANSFER TO',data.route.to,data.route.toEntity,''].forEach((s,i)=>cell(s,xs[i],y,widths[i],32,true));y-=32;
      const meta=[['FROM WAREHOUSE',data.route.fromWarehouse],['TO WAREHOUSE',data.route.toWarehouse]];
      if(!details.internal)meta.push(['SUPPLIER',details.supplier]);meta.push(['TYPE',details.type],['REASON',data.reason]);
      meta.forEach(([label,value])=>{cell(label,28,y,95,18,true,gray);cell(value,123,y,444,18,label==='TYPE');y-=18;});
      const cols=[18,78,48,76,82,135,56,46], headers=['#','4 BARCODE','ITEM CODE','3 BARCODE','BATCH','ITEM NAME','UOM','QUANTITY'];
      let x=28;headers.forEach((label,i)=>{cell(label,x,y,cols[i],22,true,teal,7);x+=cols[i];});y-=22;
      for(let i=0;i<22;i++){
        const item=items[i];const values=item?[String(pageIndex*22+i+1),item.barcode4,item.code,item.barcode3,item.batch,item.name,item.uom,Number(item.quantity).toFixed(3)]:['','','','','','','',''];
        x=28;values.forEach((value,j)=>{cell(value,x,y,cols[j],19,false,null,7);x+=cols[j];});y-=19;
      }
      y-=17;page.drawText('Prepared and sent by',{x:28,y,font:bold,size:9});page.drawText('Received by',{x:350,y,font:bold,size:9});y-=14;
      page.drawText(data.prepared || '',{x:28,y,font:normal,size:9});page.drawText(data.received || '',{x:350,y,font:normal,size:9});
      const signatureTop=y-5;
      for(const stroke of data.signature || [])for(let i=1;i<stroke.length;i++)page.drawLine({start:{x:28+stroke[i-1][0]*230,y:signatureTop-stroke[i-1][1]*48},end:{x:28+stroke[i][0]*230,y:signatureTop-stroke[i][1]*48},thickness:1,color:teal});
      page.drawLine({start:{x:28,y:signatureTop-50},end:{x:270,y:signatureTop-50},thickness:.5,color:black});page.drawLine({start:{x:350,y:signatureTop-50},end:{x:567,y:signatureTop-50},thickness:.5,color:black});
      page.drawText(`Page ${pageIndex+1} of ${chunks.length} | Items ${pageIndex*22+1}-${pageIndex*22+items.length}`,{x:28,y:24,size:8,font:normal});
    });
    doc.setTitle('Chocolala Transfer '+data.reference);return doc.save();
  }
  if(typeof module!=='undefined' && module.exports)module.exports={createTransferPDF};else root.TransferPDF={createTransferPDF};
})(typeof globalThis!=='undefined'?globalThis:this);
