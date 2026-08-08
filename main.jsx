import React,{useEffect,useMemo,useState} from "react";
import{createRoot}from"react-dom/client";
import"./styles.css";

const KEY="droplist-listings-v2";
const ADMIN_KEY="droplist-admin-demo";
const seed=[];

function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x:seed}catch{return seed}}
const money=n=>`₹${Number(n).toLocaleString("en-IN")}`;

function App(){
 const[items,setItems]=useState(load);
 const[page,setPage]=useState("home");
 const[selected,setSelected]=useState(null);
 const[q,setQ]=useState("");
 const[notice,setNotice]=useState("");
 const[admin,setAdmin]=useState(localStorage.getItem(ADMIN_KEY)==="1");

 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);

 const approved=items.filter(x=>x.status==="approved");
 const filtered=useMemo(()=>approved.filter(x=>x.name.toLowerCase().includes(q.toLowerCase())),[approved,q]);

 const open=p=>{setSelected(p);setPage("product");scrollTo(0,0)};
 const submit=e=>{
   e.preventDefault(); const d=new FormData(e.currentTarget);
   const file=d.get("imageFile");
   const finish=image=>{
    const item={id:"DL-"+Math.floor(10000+Math.random()*89999),name:d.get("name"),price:Number(d.get("price")),description:d.get("description")||"No description provided.",image:image||"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",discord:d.get("discord"),status:"pending",createdAt:Date.now()};
    setItems(a=>[item,...a]);e.currentTarget.reset();setNotice(`Listing ${item.id} submitted for admin approval.`);setPage("home");scrollTo(0,0);
   };
   if(file&&file.size){const r=new FileReader();r.onload=()=>finish(r.result);r.readAsDataURL(file)}else finish(d.get("imageUrl"));
 };
 const contact=id=>{navigator.clipboard?.writeText(id);setNotice(`Discord ID "${id}" copied. Open Discord to contact the seller.`)};
 const logout=()=>{localStorage.removeItem(ADMIN_KEY);setAdmin(false);setPage("home")};

 return <div>
  <header><button className="logo" onClick={()=>setPage("home")}>Drop<span>List</span></button><nav><button onClick={()=>setPage("home")}>Browse</button><button onClick={()=>setPage("list")}>List Your Item</button>{admin&&<button onClick={()=>setPage("admin")}>Admin</button>}</nav><button className="primary small" onClick={()=>setPage("list")}>+ List Item</button></header>
  {notice&&<div className="notice">{notice}<button onClick={()=>setNotice("")}>×</button></div>}

  {page==="home"&&<><section className="hero"><div><div className="eyebrow">SIMPLE. DIRECT. DISCORD.</div><h1>Find it.<br/><span>Message the seller.</span></h1><p>Browse products and contact sellers directly on Discord. No checkout. No customer accounts.</p><div className="actions"><button className="primary" onClick={()=>document.getElementById("products").scrollIntoView({behavior:"smooth"})}>Browse Items</button><button className="secondary" onClick={()=>setPage("list")}>List Your Item</button></div></div><div className="hero-card"><small>LIVE LISTINGS</small><b>{approved.length}</b><span>approved items</span><i>● Contact sellers on Discord</i></div></section><main id="products" className="container"><div className="head"><div><div className="eyebrow">MARKETPLACE</div><h2>Latest items</h2></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..."/></div><div className="grid">{filtered.map(p=><article className="card" key={p.id} onClick={()=>open(p)}><img src={p.image} alt=""/><div><h3>{p.name}</h3><strong>{money(p.price)}</strong><span>View →</span></div></article>)}</div></main></>}

  {page==="product"&&selected&&<main className="container detail"><button className="back" onClick={()=>setPage("home")}>← Back</button><div className="detail-grid"><img src={selected.image} alt=""/><section><div className="eyebrow">{selected.id}</div><h1>{selected.name}</h1><div className="price">{money(selected.price)}</div><p>{selected.description}</p><button className="primary wide" onClick={()=>contact(selected.discord)}>💬 Contact Seller on Discord</button><small>Discord: {selected.discord}</small></section></div></main>}

  {page==="list"&&<main className="container form"><div className="eyebrow">SELL SOMETHING</div><h1>List your item.</h1><p>Listings are reviewed by the admin before appearing publicly.</p><form onSubmit={submit}><label>Product name *<input name="name" required/></label><label>Amount *<input name="price" type="number" min="0" required/></label><label>Description<textarea name="description" rows="5"/></label><label>Product image<input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp"/></label><label>Or image URL<input name="imageUrl" type="url" placeholder="https://..."/></label><label>Your Discord ID *<input name="discord" required placeholder="username123"/></label><label className="check"><input type="checkbox" required/> I agree to the marketplace rules.</label><button className="primary">Submit Listing</button></form></main>}

  {page==="admin"&&admin&&<main className="container admin"><div className="admin-head"><div><div className="eyebrow">PRIVATE AREA</div><h1>Admin Dashboard</h1></div><button className="secondary" onClick={logout}>Log out</button></div><div className="stats"><div>Pending <b>{items.filter(x=>x.status==="pending").length}</b></div><div>Approved <b>{approved.length}</b></div><div>Rejected <b>{items.filter(x=>x.status==="rejected").length}</b></div></div><div className="admin-list">{items.map(p=><div className="row" key={p.id}><img src={p.image} alt=""/><section><b>{p.name}</b><span>{money(p.price)} · Discord: {p.discord}</span><small>{p.id} · {p.status}</small></section><div>{p.status==="pending"&&<><button className="approve" onClick={()=>setItems(a=>a.map(x=>x.id===p.id?{...x,status:"approved"}:x))}>Approve</button><button className="reject" onClick={()=>setItems(a=>a.map(x=>x.id===p.id?{...x,status:"rejected"}:x))}>Reject</button></>}<button className="delete" onClick={()=>setItems(a=>a.filter(x=>x.id!==p.id))}>Delete</button></div></div>)}</div></main>}

  {page==="admin-login"&&<AdminLogin onSuccess={()=>{setAdmin(true);setPage("admin")}}/>}
  <footer><b>DropList</b><span>Buy and sell. Connect on Discord.</span>{!admin&&<button onClick={()=>setPage("admin-login")}>Admin</button>}</footer>
 </div>
}

function AdminLogin({onSuccess}) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  return (
    <main className="container login">
      <div className="eyebrow">PRIVATE ADMIN</div>
      <h1>Admin login</h1>
      <p>Sign in to manage marketplace listings.</p>

      <form
        onSubmit={e => {
          e.preventDefault();

          if (pass === "admin123") {
            localStorage.setItem(ADMIN_KEY, "1");
            onSuccess();
          } else {
            setErr("Incorrect password.");
          }
        }}
      >
        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          placeholder="Admin password"
        />

        {err && <small className="err">{err}</small>}

        <button className="primary">Enter Dashboard</button>
      </form>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App/>);
