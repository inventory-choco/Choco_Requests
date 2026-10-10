(function(root){
 'use strict';
 function clear(scope){scope.querySelectorAll('.validation-error').forEach(n=>n.remove());scope.querySelectorAll('.validation-invalid').forEach(f=>{f.classList.remove('validation-invalid');f.removeAttribute('aria-invalid');});}
 function finish(scope,fields,extras=[]){const invalid=fields.filter(f=>!f.disabled&&!f.checkValidity());for(const f of invalid){f.classList.add('validation-invalid');f.setAttribute('aria-invalid','true');const hint=document.createElement('span');hint.className='field-error validation-error';hint.textContent=f.validationMessage;hint.setAttribute('role','alert');f.insertAdjacentElement('afterend',hint);}return {valid:!invalid.length&&!extras.length,first:invalid[0],message:[invalid.length?'Complete the '+invalid.length+' highlighted field'+(invalid.length===1?'':'s')+'.':'',...extras].filter(Boolean).join(' ')};}
 if(typeof document!=='undefined')for(const event of ['input','change'])document.addEventListener(event,e=>{const f=e.target;if(f.classList?.contains('validation-invalid')&&f.checkValidity()){f.classList.remove('validation-invalid');f.removeAttribute('aria-invalid');if(f.nextElementSibling?.classList.contains('validation-error'))f.nextElementSibling.remove();}});
 root.InventoryValidation={clear,finish};
})(typeof globalThis!=='undefined'?globalThis:this);
