import { useState, useEffect, useRef } from "react";


/* ════════════════════════════════════════════════════════════════════
   NAV1 — Invoice Maker
   System-styled tool chrome (matches navaalsaaed.com) wrapping the
   locked NAV1 invoice. Form (left) → true-A4 preview (right) → PDF.
   ════════════════════════════════════════════════════════════════════ */

/* ── CONFIG (edit these) ────────────────────────────────────────────── */
const GST_RATE = 0.10;                 // 10% AU GST

const FROM = {
  name:  "Navaal Saeed",
  email: "hello@navaalsaaed.com",
  phone: "0411 462 166",
  abn:   "ABN: 00-000-0000",
};

const ACCOUNT = {
  bank: "Bank Name",
  bsb:  "XXX-XXX",
  acc:  "XX-XXX-XXX",
};

/* ── A4 PAGE GEOMETRY (px at 96dpi; print forced to exact mm) ───────── */
const PAGE_W   = 794;   // 210mm
const PAGE_H   = 1123;  // 297mm
const PAGE_PAD = 57;    // ≈15mm margin
const PREVIEW_SCALE = 0.66;

/* ── INVOICE TYPE TOKENS (12px = 9pt · 10.5px ≈ 7.9pt · 29px ≈ 22pt) ── */
const SANS  = '"NHU", "Helvetica Medium", Helvetica, "Helvetica Neue", Arial, sans-serif';
const SERIF = '"EB Garamond", Garamond, serif';
const SS = 10.5, RS = 12, LS = 29;

const sn = { fontFamily:SANS,  fontSize:SS, fontWeight:500, lineHeight:1, margin:0, color:"#000" };
const sr = { fontFamily:SERIF, fontSize:RS, lineHeight:1, fontStyle:"normal", margin:0, color:"#000" };
const si = { fontFamily:SERIF, fontSize:RS, lineHeight:1, fontStyle:"italic",  margin:0, color:"#000" };
const lg = { fontFamily:SANS,  fontSize:LS, fontWeight:500, lineHeight:1, margin:0, color:"#000" };

const G3 = "25% 50% 25%";
const GF = "55% 20% 25%";
const Gap = () => <div style={{ height: RS }} />;

/* ── SYSTEM-UI TOKENS (tool chrome, matches the website) ────────────── */
const INK   = "#111";
const MUST  = "#E3A52E";   // mustard accent
const PANEL = "#F3F2EC";   // form bg
const STAGE = "#E9E8E2";   // preview bg
const LINE  = "#D9D7CF";   // hairline
const MUTE  = "#9C988E";   // labels

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
@font-face{
  font-family:"NHU"; font-weight:500;
  src:url("https://db.onlinewebfonts.com/t/7d349f3b93cd47712cf75443b05965bf.woff2") format("woff2"),
      url("https://db.onlinewebfonts.com/t/7d349f3b93cd47712cf75443b05965bf.woff") format("woff");
}`;

/* ── HELPERS ────────────────────────────────────────────────────────── */
function Email({ value }) {
  const norm = (value || "").replace(/\(at\)/gi, "@");
  const at = norm.indexOf("@");
  if (at < 0) return <>{norm}</>;
  return (<>{norm.slice(0, at)}<em style={{ fontStyle:"italic" }}>(at)</em>{norm.slice(at + 1)}</>);
}
const money = (n) => { const v = Number(n) || 0; return "$" + (Number.isInteger(v) ? String(v) : v.toFixed(2)); };
const todayDDMMYYYY = () => { const d=new Date(),p=(x)=>String(x).padStart(2,"0"); return `${p(d.getDate())}-${p(d.getMonth()+1)}-${d.getFullYear()}`; };
const randomInvoiceNo = () => String(Math.floor(10000 + Math.random() * 90000));

/* ════════════════════════════════════════════════════════════════════ */
export default function InvoiceTool() {
  const [invoiceNo, setInvoiceNo] = useState("10001");
  const [recipient, setRecipient] = useState({ name:"", company:"", email:"", phone:"" });
  const [services,  setServices]  = useState([{ desc:"", price:"" }]);
  const [notes,     setNotes]     = useState("");
  const [removeGST, setRemoveGST] = useState(false);
  const [date,      setDate]      = useState(todayDDMMYYYY());
  const previewRef = useRef(null);

  useEffect(() => { setInvoiceNo(randomInvoiceNo()); }, []);

  const subtotal   = services.reduce((s, x) => s + (Number(x.price) || 0), 0);
  const gstPct     = Math.round(GST_RATE * 100);
  const gstAmount  = removeGST ? 0 : subtotal * GST_RATE;
  const finalTotal = subtotal + gstAmount;

  const setService = (i, k, v) => setServices((a) => a.map((s, j) => j === i ? { ...s, [k]: v } : s));
  const addService    = () => setServices((a) => [...a, { desc:"", price:"" }]);
  const removeService = (i) => setServices((a) => a.filter((_, j) => j !== i));

  /* ── EXPORT: clone the page into an A4 print window (one page) ────── */
  const handleExport = () => {
    setDate(todayDDMMYYYY());
    const node = previewRef.current;
    if (!node) return;
    const fname = `NS_Invoice_${invoiceNo}`;

    const printDoc = `<!doctype html><html><head><meta charset="utf-8">
      <title>${fname}</title>
      <style>
        ${FONT_CSS}
        *{box-sizing:border-box;} html,body{margin:0;padding:0;background:#fff;}
        @page{ size:A4; margin:0; }
        .inv{ width:210mm !important; height:297mm !important;
              box-shadow:none !important; overflow:hidden; }
      </style></head><body>${node.outerHTML}</body></html>`;

    let win = null;
    try { win = window.open("", "_blank", "width=900,height=1200"); } catch (e) { win = null; }

    if (!win) {                       // popups blocked → in-page print fallback
      const prev = document.title;
      document.title = fname;
      try { window.print(); } catch (e) {}
      setTimeout(() => { document.title = prev; }, 3000);
      setInvoiceNo(randomInvoiceNo());
      return;
    }

    win.document.open();
    win.document.write(printDoc);
    win.document.close();

    const fire = () => { try { win.focus(); win.print(); } catch (e) {} };
    const ready = win.document.fonts && win.document.fonts.ready;
    if (ready) { ready.then(() => setTimeout(fire, 150)); setTimeout(fire, 1200); }
    else { setTimeout(fire, 800); }

    setInvoiceNo(randomInvoiceNo());
  };

  /* ── system-ui field primitives ─────────────────────────────────── */
  const Field = ({ label, value, onChange, placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:"block", fontFamily:SANS, fontSize:9.5, fontWeight:500,
                      letterSpacing:".09em", textTransform:"uppercase", color:MUTE,
                      marginBottom:5 }}>{label}</label>
      <input className="sys-in" value={value} placeholder={placeholder || ""}
             onChange={(e)=>onChange(e.target.value)}
             style={{ width:"100%", fontFamily:SANS, fontSize:13, fontWeight:500, color:INK,
                      background:"transparent", border:"none", borderBottom:`1px solid ${LINE}`,
                      padding:"5px 0", outline:"none" }} />
    </div>
  );

  return (
    <div style={{ display:"flex", width:"100%", height:"100vh", overflow:"hidden",
                  fontFamily:SANS, background:PANEL }}>
      <style>{`
        ${FONT_CSS}
        *,*::before,*::after{ box-sizing:border-box; }
        .sys-in::placeholder{ color:#c2bfb7; }
        .sys-in:focus{ border-bottom-color:#000 !important; }
        .sys-col::-webkit-scrollbar{ width:0; height:0; }
        .lnk{ cursor:pointer; text-decoration:underline; text-underline-offset:3px;
              text-decoration-thickness:1px; }
        .lnk:hover{ color:${MUST}; }
        .add:hover{ color:${MUST}; }
        .xr:hover{ color:#000 !important; }

        .nav1-form{ flex:0 0 440px; width:440px; height:100vh;
                    display:flex; flex-direction:column; background:${PANEL};
                    border-right:1px solid ${LINE}; }
        .nav1-stage{ flex:1; height:100vh; overflow:auto; display:flex;
                     align-items:flex-start; justify-content:center;
                     background:${STAGE}; padding:46px 24px; position:relative; }
        .nav1-scale{ transform:scale(${PREVIEW_SCALE}); transform-origin:top center; }

        @media print {
          .nav1-form{ display:none !important; }
          .nav1-stage{ height:auto; overflow:visible; padding:0; background:#fff; display:block; }
          .nav1-scale{ transform:none !important; }
          .inv{ width:210mm !important; height:297mm !important;
                box-shadow:none !important; overflow:hidden; }
          .stage-mark{ display:none !important; }
          @page{ size:A4; margin:0; }
        }
      `}</style>

      {/* ── LEFT · SYSTEM FORM ─────────────────────────────────────── */}
      <div className="nav1-form">

        {/* scrolling column */}
        <div className="sys-col" style={{ flex:1, overflowY:"auto", padding:"20px 26px 8px" }}>

          <div style={{ fontFamily:SANS, fontSize:12, fontWeight:500, color:INK, marginBottom:3 }}>
            Invoice Maker
          </div>
          <div style={{ fontFamily:SANS, fontSize:11, color:MUTE, marginBottom:26 }}>
            #{invoiceNo} · {date}
          </div>

          {/* invoice number */}
          <Field label="Invoice number" value={invoiceNo} onChange={setInvoiceNo} />

          <div style={{ height:1, background:LINE, margin:"18px 0 22px" }} />

          {/* recipient */}
          <Field label="Name of recipient" placeholder="John Smith" value={recipient.name}
                 onChange={(v)=>setRecipient({...recipient,name:v})} />
          <Field label="Company" placeholder="Nike" value={recipient.company}
                 onChange={(v)=>setRecipient({...recipient,company:v})} />
          <Field label="Email" placeholder="john@nike.com" value={recipient.email}
                 onChange={(v)=>setRecipient({...recipient,email:v})} />
          <Field label="Phone number" placeholder="0411 462 166" value={recipient.phone}
                 onChange={(v)=>setRecipient({...recipient,phone:v})} />

          <div style={{ height:1, background:LINE, margin:"18px 0 22px" }} />

          {/* services */}
          <label style={{ display:"block", fontFamily:SANS, fontSize:9.5, fontWeight:500,
                          letterSpacing:".09em", textTransform:"uppercase", color:MUTE,
                          marginBottom:12 }}>Services</label>

          {services.map((s, i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
              <span style={{ fontFamily:SANS, fontSize:11, fontWeight:500, color:MUST, width:16 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <input className="sys-in" placeholder="Description" value={s.desc}
                     onChange={(e)=>setService(i,"desc",e.target.value)}
                     style={{ flex:1, fontFamily:SANS, fontSize:13, fontWeight:500, color:INK,
                              background:"transparent", border:"none",
                              borderBottom:`1px solid ${LINE}`, padding:"5px 0", outline:"none" }} />
              <div style={{ position:"relative", width:80 }}>
                <span style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)",
                               fontFamily:SANS, fontSize:13, fontWeight:500, color:MUTE,
                               pointerEvents:"none" }}>$</span>
                <input className="sys-in" type="number" placeholder="0" value={s.price}
                       onChange={(e)=>setService(i,"price",e.target.value)}
                       style={{ width:"100%", fontFamily:SANS, fontSize:13, fontWeight:500, color:INK,
                                background:"transparent", border:"none",
                                borderBottom:`1px solid ${LINE}`, padding:"5px 0 5px 12px",
                                outline:"none", textAlign:"right" }} />
              </div>
              <button className="xr" onClick={()=>removeService(i)}
                disabled={services.length === 1}
                style={{ fontFamily:SANS, fontSize:15, lineHeight:1,
                         color: services.length === 1 ? "#d8d5cd" : "#b4b0a7",
                         background:"transparent", border:"none",
                         cursor: services.length === 1 ? "default" : "pointer", padding:0, width:14 }}>
                ×
              </button>
            </div>
          ))}

          <button className="add" onClick={addService}
            style={{ fontFamily:SANS, fontSize:11, fontWeight:500, color:INK,
                     background:"transparent", border:"none", cursor:"pointer",
                     padding:"4px 0", marginTop:2 }}>
            + Add service
          </button>

          <div style={{ height:1, background:LINE, margin:"22px 0" }} />

          {/* notes */}
          <label style={{ display:"block", fontFamily:SANS, fontSize:9.5, fontWeight:500,
                          letterSpacing:".09em", textTransform:"uppercase", color:MUTE,
                          marginBottom:8 }}>Notes</label>
          <textarea className="sys-in" placeholder="Add a note…" value={notes}
                    onChange={(e)=>setNotes(e.target.value)}
                    style={{ width:"100%", minHeight:84, resize:"vertical", fontFamily:SANS,
                             fontSize:13, fontWeight:500, color:INK, lineHeight:1.45,
                             background:"transparent", border:`1px solid ${LINE}`,
                             padding:"10px 11px", outline:"none" }} />

          {/* totals */}
          <div style={{ marginTop:22, fontFamily:SANS, fontSize:11.5, fontWeight:500, color:INK }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:9 }}>
              <span style={{ color:MUTE }}>Subtotal</span><span>{money(subtotal)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                          marginBottom:9 }}>
              <label style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer",
                              color:MUTE }}>
                <input type="checkbox" checked={removeGST}
                       onChange={(e)=>setRemoveGST(e.target.checked)}
                       style={{ width:13, height:13, accentColor:INK, cursor:"pointer" }} />
                GST ({gstPct}%)
              </label>
              <span style={{ textDecoration: removeGST ? "line-through" : "none",
                             color: removeGST ? MUTE : INK }}>
                {money(removeGST ? 0 : subtotal * GST_RATE)}
              </span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:9,
                          borderTop:`1px solid ${LINE}`, fontWeight:600 }}>
              <span>Final Total</span><span>{money(finalTotal)}</span>
            </div>
            <div style={{ fontSize:9.5, color:MUTE, marginTop:7 }}>
              Tick to remove GST from this invoice.
            </div>
          </div>
        </div>

        {/* footer bar: S + export + filename */}
        <div style={{ borderTop:`1px solid ${LINE}`, padding:"16px 26px 22px" }}>
          <button className="lnk" onClick={handleExport}
            style={{ width:"100%", fontFamily:SANS, fontSize:12, fontWeight:500, color:INK,
                     background:"transparent", border:"none", textAlign:"left", padding:0,
                     marginBottom:16 }}>
            Export Invoice PDF →
          </button>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <span style={{ fontFamily:SANS, fontSize:15, fontWeight:500, color:MUST }}>S</span>
            <span style={{ fontFamily:SANS, fontSize:10, color:MUTE }}>
              NS_Invoice_{invoiceNo}
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT · LIVE A4 PREVIEW ────────────────────────────────── */}
      <div className="nav1-stage">
        <span className="stage-mark" style={{ position:"absolute", right:26, bottom:22,
              fontFamily:SANS, fontSize:11, fontWeight:500, color:MUST }}>Preview</span>
        <div className="nav1-scale">
          <div ref={previewRef} className="inv" style={{
            background:"#fff", color:"#000", width:PAGE_W, height:PAGE_H, padding:PAGE_PAD,
            display:"flex", flexDirection:"column", justifyContent:"space-between",
            fontFamily:SANS, fontWeight:500, fontSize:SS, lineHeight:1,
            boxShadow:"0 2px 24px rgba(0,0,0,.10)",
          }}>

            {/* 1 · HEADER */}
            <div style={{ display:"grid", gridTemplateColumns:G3, alignItems:"start" }}>
              <div><p style={sn}>Invoice no.</p><p style={sn}>#{invoiceNo}</p></div>
              <div style={{ textAlign:"center" }}><p style={lg}>N</p></div>
              <div style={{ textAlign:"right" }}><p style={sn}>Date</p><p style={sn}>{date}</p></div>
            </div>

            {/* 2 · FROM / TO / ACCOUNT */}
            <div style={{ display:"grid", gridTemplateColumns:G3, alignItems:"start" }}>
              <div>
                <p style={sn}>From</p><Gap />
                <p style={si}>{FROM.name}</p>
                <p style={sr}><Email value={FROM.email} /></p>
                <p style={sr}>{FROM.phone}</p>
                <p style={sr}>{FROM.abn}</p>
              </div>
              <div>
                <p style={sn}>To</p><Gap />
                <p style={si}>{recipient.name || "John Smith"}</p>
                <p style={sr}>{recipient.company || "Nike"}</p>
                <p style={sr}><Email value={recipient.email || "John@nike.com"} /></p>
                <p style={sr}>{recipient.phone || "0411 462 166"}</p>
              </div>
              <div>
                <p style={sn}>Account</p><Gap />
                <p style={sn}>{ACCOUNT.bank}</p>
                <p style={sn}>BSB NO.&nbsp;&nbsp;&nbsp;{ACCOUNT.bsb}</p>
                <p style={sn}>ACC NO.&nbsp;&nbsp;&nbsp;{ACCOUNT.acc}</p>
              </div>
            </div>

            {/* 3 · LINE ITEMS */}
            <div>
              <div style={{ display:"grid", gridTemplateColumns:G3 }}>
                <p style={sn}>NO.</p><p style={sn}>Description</p><p style={sn}>Price</p>
              </div>
              {services.map((s, i) => (
                <div key={i}>
                  <Gap />
                  <div style={{ display:"grid", gridTemplateColumns:G3 }}>
                    <p style={sn}>{String(i + 1).padStart(2, "0")}</p>
                    <p style={sn}>{s.desc || "Lorem Ipsum Dolor"}</p>
                    <p style={sn}>{money(s.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4 · PLEASE NOTE / TOTAL */}
            <div style={{ display:"grid", gridTemplateColumns:GF, alignItems:"start" }}>
              <div>
                <p style={sn}>Please Note</p><Gap />
                <p style={sr}>{notes || "—"}</p>
              </div>
              <div />
              <div>
                <p style={sn}>Total</p><Gap />
                <p style={sn}>{removeGST ? money(subtotal) : `${money(subtotal)} + GST (${gstPct}%)`}</p><Gap />
                <p style={sn}>Final Total</p><Gap />
                <p style={sn}>{money(finalTotal)}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
