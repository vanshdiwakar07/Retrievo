const KEY='retrievo_items_v1';
const demo=[
{id:'d1',type:'found',name:'Blue Water Bottle',category:'Other',date:'2026-10-06',location:'Central Library',description:'Blue reusable bottle found near the reading tables.',reporter:'Demo Student',email:'demo@example.com',status:'active'},
{id:'d2',type:'lost',name:'Black Wireless Earbuds',category:'Electronics',date:'2026-10-04',location:'Computer Lab 2',description:'Small black earbuds case. Verify details with the owner.',reporter:'Demo Student',email:'demo@example.com',status:'active'},
{id:'d3',type:'found',name:'Green Notebook',category:'Books & Notes',date:'2026-10-03',location:'Block B, Room 104',description:'Notebook found after a lecture.',reporter:'Demo Student',email:'demo@example.com',status:'active'},
{id:'d4',type:'lost',name:'Card Holder',category:'Wallets & Cards',date:'2026-10-02',location:'Cafeteria',description:'Dark card holder. Do not share card numbers.',reporter:'Demo Student',email:'demo@example.com',status:'active'},
{id:'d5',type:'found',name:'Two Keys on Keychain',category:'Keys',date:'2026-10-01',location:'Sports Ground Entrance',description:'Small keychain found near the entrance.',reporter:'Demo Student',email:'demo@example.com',status:'active'},
{id:'d6',type:'lost',name:'Grey Laptop Sleeve',category:'Bags',date:'2026-09-29',location:'Study Lounge',description:'Grey laptop sleeve possibly left beside a desk.',reporter:'Demo Student',email:'demo@example.com',status:'active'}];
let items;try{items=JSON.parse(localStorage.getItem(KEY))||demo}catch(e){items=demo}
const $=id=>document.getElementById(id), dlg=$('modal');
const icons={'Electronics':'🎧','Books & Notes':'📚','Wallets & Cards':'👛','Keys':'🔑','Bags':'🎒','Clothing':'🧥','Other':'📦'};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function persist(){localStorage.setItem(KEY,JSON.stringify(items))}
function dateText(s){if(!s)return '';return new Date(s+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
function render(){
 const q=$('search').value.toLowerCase().trim(),t=$('type').value,c=$('category').value,s=$('status').value;
 const arr=items.filter(x=>(!q||[x.name,x.location,x.description,x.category].join(' ').toLowerCase().includes(q))&&(t==='all'||x.type===t)&&(c==='all'||x.category===c)&&(s==='all'||x.status===s)).sort((a,b)=>b.date.localeCompare(a.date));
 $('grid').innerHTML=arr.map(x=>`<article class="card"><div class="cardtop"><span class="pill ${x.status==='returned'?'returned':x.type}">${x.status==='returned'?'Returned':x.type==='lost'?'Lost item':'Found item'}</span><span class="cat">${esc(x.category)}</span></div><div class="emoji">${icons[x.category]||'📦'}</div><h3>${esc(x.name)}</h3><p class="desc">${esc(x.description)}</p><div class="meta">⌖ ${esc(x.location)} &nbsp; · &nbsp; ◷ ${dateText(x.date)}</div><div class="actions"><button class="secondary" data-act="view" data-id="${esc(x.id)}">View details</button>${x.status==='active'?`<button data-act="return" data-id="${esc(x.id)}">Mark returned</button>`:''}</div></article>`).join('');
 $('empty').hidden=arr.length>0;$('grid').hidden=arr.length===0;
 $('total').textContent=items.length;$('lost-count').textContent=items.filter(x=>x.type==='lost'&&x.status==='active').length;$('found-count').textContent=items.filter(x=>x.type==='found'&&x.status==='active').length;$('returned-count').textContent=items.filter(x=>x.status==='returned').length;
}
function openForm(type='lost'){
  $('form').reset();
  $('item-type').value=type;
  $('modal-title').textContent=type==='lost'?'Report a lost item':'Report a found item';

  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth()+1).padStart(2,'0'),
    String(today.getDate()).padStart(2,'0')
  ].join('-');

  $('date').min = '2026-01-01';
  $('date').max = localToday;
  $('date').value = localToday;

  dlg.showModal();
}
function toast(s){const el=$('toast');el.textContent=s;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2500)}
['search','type','category','status'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
['open-report','add-report'].forEach(id=>$(id).addEventListener('click',()=>openForm()));
$('lost-btn').addEventListener('click',()=>openForm('lost'));$('found-btn').addEventListener('click',()=>openForm('found'));
$('close').addEventListener('click',()=>dlg.close());$('cancel').addEventListener('click',()=>dlg.close());
$('item-type').addEventListener('change',e=>$('modal-title').textContent=e.target.value==='lost'?'Report a lost item':'Report a found item');
$('form').addEventListener('submit',e=>{
  e.preventDefault();

  const x={
    id:'i'+Date.now(),
    type:$('item-type').value,
    name:$('name').value.trim(),
    category:$('item-category').value,
    date:$('date').value,
    location:$('location').value.trim(),
    reporter:$('reporter').value.trim(),
    email:$('email').value.trim(),
    phone:$('phone').value.trim(),
    description:$('description').value.trim(),
    status:'active'
  };

  const today=new Date();
  const localToday=[
    today.getFullYear(),
    String(today.getMonth()+1).padStart(2,'0'),
    String(today.getDate()).padStart(2,'0')
  ].join('-');

  if(!x.date||x.date<'2026-01-01'||x.date>localToday){
    toast('Please select a valid date.');
    return;
  }

  if(!/^[6-9]\d{9}$/.test(x.phone)){
    toast('Enter a valid 10-digit mobile number.');
    return;
  }

  if(!x.name||!x.location||!x.description){
    toast('Complete all required fields.');
    return;
  }

  items.unshift(x);

  try{
    persist();
  }catch(err){
    items.shift();
    toast('Could not save in this browser.');
    return;
  }

  dlg.close();
  $('search').value='';
  $('type').value='all';
  $('category').value='all';
  $('status').value='active';

  render();
  $('browse').scrollIntoView({behavior:'smooth'});
  toast('Report saved in this browser.');
});e=>{e.preventDefault();const x={id:'i'+Date.now(),type:$('item-type').value,name:$('name').value.trim(),category:$('item-category').value,date:$('date').value,location:$('location').value.trim(),reporter:$('reporter').value.trim(),email:$('email').value.trim(),description:$('description').value.trim(),status:'active'};if(!x.name||!x.location||!x.description){toast('Complete all required fields.');return}items.unshift(x);try{persist()}catch(err){items.shift();toast('Could not save in this browser.');return}dlg.close();$('search').value='';$('type').value='all';$('category').value='all';$('status').value='active';render();$('browse').scrollIntoView({behavior:'smooth'});toast('Report saved in this browser.')});
$('grid').addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b)return;const x=items.find(a=>a.id===b.dataset.id);if(!x)return;if(b.dataset.act==='view')alert(`${x.name}\n\nType: ${x.type.toUpperCase()}\nCategory: ${x.category}\nDate: ${dateText(x.date)}\nLocation: ${x.location}\n\nDescription: ${x.description}\n\nReported by: ${x.reporter}\nContact Email: ${x.email} Phone: ${x.phone || 'Not provided'}\n\nVerify ownership before returning an item.`);else if(confirm(`Mark "${x.name}" as returned?`)){x.status='returned';persist();render();toast('Status updated.') }});
render();
