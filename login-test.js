(function(root){'use strict';
 function allowedAccess(value){return !!(value&&typeof value==='object'&&['admin','branch'].includes(value.role)&&(value.role==='admin'||typeof value.branch_number==='string'&&typeof value.branch_name==='string'&&!!value.branch_name&&typeof value.country==='string'&&!!value.country));}
 const api={allowedAccess};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
 location.replace(new URL('./',location.href).href);
})(typeof globalThis!=='undefined'?globalThis:this);
