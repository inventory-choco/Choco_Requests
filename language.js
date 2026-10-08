(function(root){
 'use strict';
 const arabic={
  'Inventory Department':'قسم المخزون','BRANCH OPERATIONS':'عمليات الفروع','Branch operations':'عمليات الفروع',
  'Language':'اللغة','BRANCH FORMS':'نماذج الفروع','What would you like to prepare?':'ما النموذج الذي ترغب في إعداده؟',
  'Select a request to begin.':'اختر طلباً للبدء.','Transfer':'تحويل','Sample / Consumption':'عينات / استهلاك','Damages / Expiry':'تلف / انتهاء الصلاحية',
  'Create transfer':'إنشاء تحويل','Coming later':'قريباً','All forms':'جميع النماذج','STOCK MOVEMENT':'حركة المخزون','Transfer request':'طلب تحويل',
  'Download PDF':'تنزيل PDF','Choose the branches':'اختر الفروع','Country':'الدولة','Transfer from':'التحويل من','Transfer to':'التحويل إلى','Reason':'السبب',
  'Warehouse route':'مسار المستودع','Enter the items':'أدخل الأصناف','+ Add item':'+ إضافة صنف','4 barcode':'باركود 4','3 barcode':'باركود 3',
  'Item code':'رمز الصنف','Batch':'الدفعة','Item name':'اسم الصنف','UOM':'وحدة القياس','Quantity':'الكمية','Remove':'حذف',
  'Prepared & received':'الإعداد والاستلام','Prepared and sent by':'أعده وأرسله','Received by':'المستلم','Signature':'التوقيع','Required':'مطلوب',
  '(mouse or touch)':'(بالفأرة أو اللمس)','(optional)':'(اختياري)','Clear signature':'مسح التوقيع','Automatic details':'البيانات التلقائية','Read only':'للقراءة فقط',
  'FROM LEGAL ENTITY':'الكيان القانوني المرسل','TO LEGAL ENTITY':'الكيان القانوني المستلم','SUPPLIER':'المورد',
  'Transfer type':'نوع التحويل','Transfer date':'تاريخ التحويل','Reference':'المرجع','Supplier code':'رمز المورد','TR code':'رمز التحويل','Supplier code / TR code':'رمز المورد / التحويل',
  'Saved versions':'النسخ المحفوظة','New form':'نموذج جديد','Blue fields: enter or choose':'الحقول الزرقاء: أدخل أو اختر','Grey fields: filled automatically':'الحقول الرمادية: تعبأ تلقائياً',
  'TRANSFER REQUEST FORM':'نموذج طلب تحويل','BRANCH NAME':'اسم الفرع','LEGAL ENTITY':'الكيان القانوني','TRANSFER FROM':'التحويل من','TRANSFER TO':'التحويل إلى',
  'FROM WAREHOUSE':'مستودع الإرسال','TO WAREHOUSE':'مستودع الاستلام','TYPE':'نوع التحويل','REASON':'السبب',
  '4 BARCODE':'باركود 4','3 BARCODE':'باركود 3','ITEM CODE':'رمز الصنف','BATCH':'الدفعة','ITEM NAME':'اسم الصنف','QUANTITY':'الكمية',
  'Details not found for this branch combination.':'لم يتم العثور على تفاصيل لهذه الفروع.','Page':'صفحة','of':'من','Items':'الأصناف',
  'Signature required before download.':'يجب إضافة التوقيع قبل التنزيل.'
 };
 const original=new WeakMap();
 function language(){return typeof document!=='undefined'&&document.getElementById('language')?.value==='ar'?'ar':'en';}
 function header(text,lang=language()){return lang==='ar'?(arabic[text]||text):text;}
 function apply(scope){
  if(typeof document==='undefined')return;
  const lang=language();document.documentElement.lang=lang;
  const walker=document.createTreeWalker(scope||document.body,NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode())){
   const owner=node.parentElement;if(!owner||owner.closest('script,style,input,textarea,select,.branch-results,#saved-forms,#route-details strong,#route-details small,#action-status,#save-status,#data-status,#product-status,#route-notice,#item-count,#code-label'))continue;
   if(!original.has(node))original.set(node,node.textContent);
   const source=original.get(node),trimmed=source.trim();if(arabic[trimmed])node.textContent=source.replace(trimmed,header(trimmed,lang));
  }
  document.querySelectorAll('#item-rows td[data-label]').forEach(cell=>{const key=cell.querySelector('input,textarea')?.name,labels={barcode4:'4 barcode',barcode3:'3 barcode',code:'Item code',batch:'Batch',name:'Item name',uom:'UOM',quantity:'Quantity'};if(labels[key])cell.dataset.label=header(labels[key],lang);});
  const code=document.getElementById('code-label');if(code){const english=code.dataset.english||'Supplier code / TR code';code.textContent=header(english,lang);}
 }
 const api={header,language,apply};if(typeof module!=='undefined'&&module.exports)module.exports=api;else{
  root.InventoryI18n=api;
  const select=document.getElementById('language');try{select.value=localStorage.getItem('inventory.language')==='ar'?'ar':'en';}catch(_){}
  select.addEventListener('change',()=>{try{localStorage.setItem('inventory.language',select.value);}catch(_){}apply();});apply();
 }
})(typeof globalThis!=='undefined'?globalThis:this);
