import { useState, useRef, useLayoutEffect, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════════
   NAV1 — Cover Letter Tool (Cold + Known share this component)
   Form (left) → live A4 preview (right) → PDF export.
   ════════════════════════════════════════════════════════════════════ */

/* ── CONFIG (shared sender details) ─────────────────────────────────── */
const FROM = {
  name:  "Navaal Saeed",
  email: "hello@navaalsaaed.com",
  phone: "0412 255 250",
  abn:   "ABN: 00-000-0000",
};

/* ── A4 geometry ────────────────────────────────────────────────────── */
const W = 794, H = 1123;
const PREVIEW_SCALE = 0.66;

/* ── Type tokens — identical to the invoice maker ───────────────────── */
const SANS  = '"NHU", "Helvetica Medium", Helvetica, "Helvetica Neue", Arial, sans-serif';
const SERIF = '"EB Garamond", Garamond, serif';
const SS = 10.5, RS = 12, LS = 29;
const YELLOW = "#F8C14C";
const MAGENTA = "#FF00FF";

/* ── System-UI tokens (form chrome) ─────────────────────────────────── */
const INK = "#111", PANEL = "#F3F2EC", STAGE = "#E9E8E2", LINE = "#D9D7CF", MUTE = "#9C988E";

/* ── Expansion caps (px on the A4 page) ─────────────────────────────── */
const COLD_MAX_MSG  = 652;   // message height ceiling (centred zone − gap − sig)
const KNOWN_MAX_MSG = 391;   // message height ceiling (anchored, above S)
const SIG_W = 140, SIG_H = 44;

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
@font-face{ font-family:"NHU"; font-weight:500;
  src:url("https://db.onlinewebfonts.com/t/7d349f3b93cd47712cf75443b05965bf.woff2") format("woff2"),
      url("https://db.onlinewebfonts.com/t/7d349f3b93cd47712cf75443b05965bf.woff") format("woff"); }`;

/* ── helpers ────────────────────────────────────────────────────────── */
function Email({ value }) {
  const norm = (value || "").replace(/\(at\)/gi, "@");
  const at = norm.indexOf("@");
  if (at < 0) return <>{norm}</>;
  return (<>{norm.slice(0, at)}<em style={{ fontStyle:"italic" }}>(at)</em>{norm.slice(at + 1)}</>);
}
const sans = (size = SS, w = 500) => ({ fontFamily:SANS, fontSize:size, fontWeight:w, lineHeight:1, margin:0, color:"#000" });
const gar  = (it = false) => ({ fontFamily:SERIF, fontSize:RS, fontStyle: it?"italic":"normal", lineHeight:1, margin:0, color:"#000" });
const nsTok = { fontFamily:SANS, fontSize:LS, fontWeight:500, lineHeight:1, margin:0, color:YELLOW };
const msgStyle = { fontFamily:SANS, fontSize:SS, fontWeight:500, lineHeight:1.45, margin:0,
                   color:"#000", whiteSpace:"pre-wrap" };

const SAMPLE =
  "Lesequam reremosaerum sam ipsam hil in res into blanto conet facipsust, quasin parupti quas nossit mos re rem eniscid ex etur? Ad maio. Endita et perumqui volentur molutempor molorum fuga.\n\nRegards,";

const Sig = () => <div style={{ width:SIG_W, height:SIG_H, background:MAGENTA }} />;

/* ════════════════════════════════════════════════════════════════════ */
export default function CoverLetterTool({ variant = "cold", onBack }) {
  const isCold = variant === "cold";
  const title  = isCold ? "Cold Cover Letter" : "Known Cover Letter";
  const filePrefix = isCold ? "NS_C_CoverLetter" : "NS_K_CoverLetter";
  const MAX_MSG = isCold ? COLD_MAX_MSG : KNOWN_MAX_MSG;

  const [recipient, setRecipient] = useState({ name:"", company:"", email:"", phone:"" });
  const [message, setMessage] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [error, setError] = useState("");

  const previewRef = useRef(null);
  const msgRef = useRef(null);
  const lastValid = useRef("");

  /* cap the message so the page never overflows / never spills to page 2 */
  useLayoutEffect(() => {
    if (!message) { lastValid.current = ""; return; }
    const el = msgRef.current;
    if (!el) return;
    if (el.offsetHeight > MAX_MSG) {
      setMessage(lastValid.current);
      setLimitHit(true);
    } else {
      lastValid.current = message;
    }
  }, [message, MAX_MSG]);

  useEffect(() => {
    if (!limitHit) return;
    const t = setTimeout(() => setLimitHit(false), 2600);
    return () => clearTimeout(t);
  }, [limitHit]);

  /* ── EXPORT (identical mechanism to the invoice) ─────────────────── */
  const handleExport = () => {
    const r = recipient;
    if (!r.name.trim() || !r.company.trim() || !r.email.trim() || !r.phone.trim() || !message.trim()) {
      setError("All fields are required.");
      setTimeout(() => setError(""), 2600);
      return;
    }
    const node = previewRef.current;
    if (!node) return;
    const co = r.company.trim().replace(/\s+/g, "") || "Company";
    const fname = `${filePrefix}_${co}`;

    const printDoc = `<!doctype html><html><head><meta charset="utf-8">
      <title>${fname}</title>
      <style>
        ${FONT_CSS}
        *{box-sizing:border-box;} html,body{margin:0;padding:0;background:#fff;}
        @page{ size:A4; margin:0; }
        .cl{ width:210mm !important; height:297mm !important;
             box-shadow:none !important; overflow:hidden; }
      </style></head><body>${node.outerHTML}</body></html>`;

    let win = null;
    try { win = window.open("", "_blank", "width=900,height=1200"); } catch (e) { win = null; }
    if (!win) {
      const prev = document.title; document.title = fname;
      try { window.print(); } catch (e) {}
      setTimeout(() => { document.title = prev; }, 3000);
      return;
    }
    win.document.open(); win.document.write(printDoc); win.document.close();
    const fire = () => { try { win.focus(); win.print(); } catch (e) {} };
    const ready = win.document.fonts && win.document.fonts.ready;
    if (ready) { ready.then(() => setTimeout(fire, 150)); setTimeout(fire, 1200); }
    else { setTimeout(fire, 800); }
  };

  /* live values with placeholders for the preview */
  const rName  = recipient.name    || "John Smith";
  const rCo    = recipient.company || "Nike";
  const rEmail = recipient.email   || "John@nike.com";
  const rPhone = recipient.phone   || "04XX XXX XXX";
  const bodyText = message || SAMPLE;

  /* ── form primitives ─────────────────────────────────────────────── */
  const fLabel = { display:"block", fontFamily:SANS, fontSize:9.5, fontWeight:500,
    letterSpacing:".09em", textTransform:"uppercase", color:MUTE, marginBottom:5 };
  const fInput = { width:"100%", fontFamily:SANS, fontSize:13, fontWeight:500, color:INK,
    background:"transparent", border:"none", borderBottom:`1px solid ${LINE}`,
    padding:"5px 0", outline:"none" };
  const Field = ({ label, val, set, ph }) => (
    <div style={{ marginBottom:16 }}>
      <label style={fLabel}>{label}</label>
      <input className="sys-in" value={val} placeholder={ph || ""}
             onChange={(e)=>set(e.target.value)} style={fInput} />
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
        .lnk{ cursor:pointer; }
        .lnk:hover{ color:${YELLOW} !important; }
        .exp:hover{ color:${YELLOW} !important; }
        .clform{ flex:0 0 440px; width:440px; height:100vh; display:flex;
                 flex-direction:column; background:${PANEL}; border-right:1px solid ${LINE}; }
        .clstage{ flex:1; height:100vh; overflow:auto; display:flex; align-items:flex-start;
                  justify-content:center; background:${STAGE}; padding:40px 24px; position:relative; }
        @media print {
          .clform{ display:none !important; }
          .clstage{ height:auto; overflow:visible; padding:0; background:#fff; display:block; }
          .clscale{ transform:none !important; }
          .cl{ width:210mm !important; height:297mm !important; box-shadow:none !important; overflow:hidden; }
          .stage-extra{ display:none !important; }
          @page{ size:A4; margin:0; }
        }
      `}</style>

      {/* ── LEFT · FORM ─────────────────────────────────────────────── */}
      <div className="clform">
        <div className="clscroll" style={{ flex:1, overflowY:"auto", padding:"22px 26px 8px" }}>
          {onBack && (
            <div onClick={onBack} className="lnk"
              style={{ fontFamily:SANS, fontSize:11, fontWeight:500, color:MUTE,
                       marginBottom:18, display:"inline-block" }}>← Tools</div>
          )}
          <div style={{ fontFamily:SANS, fontSize:12, fontWeight:500, color:INK, marginBottom:3 }}>{title}</div>
          <div style={{ fontFamily:SANS, fontSize:11, color:MUTE, marginBottom:26 }}>All fields required</div>

          <div style={{ fontFamily:SANS, fontSize:11, fontWeight:500, color:MUTE,
                        textTransform:"uppercase", letterSpacing:".08em", marginBottom:14 }}>Recipient</div>
          <Field label="Name of recipient" ph="John Smith"   val={recipient.name}
                 set={(v)=>setRecipient({...recipient,name:v})} />
          <Field label="Company" ph="Nike"                   val={recipient.company}
                 set={(v)=>setRecipient({...recipient,company:v})} />
          <Field label="Email" ph="john@nike.com"            val={recipient.email}
                 set={(v)=>setRecipient({...recipient,email:v})} />
          <Field label="Phone Number" ph="04XX XXX XXX"      val={recipient.phone}
                 set={(v)=>setRecipient({...recipient,phone:v})} />

          <div style={{ height:1, background:LINE, margin:"18px 0 22px" }} />

          <label style={fLabel}>Message</label>
          <textarea className="sys-in" placeholder="Write the letter…" value={message}
                    onChange={(e)=>setMessage(e.target.value)}
                    style={{ ...fInput, minHeight:220, resize:"vertical", lineHeight:1.5,
                             border:`1px solid ${LINE}`, padding:"10px 11px" }} />
          {limitHit && (
            <div style={{ marginTop:8, fontFamily:SANS, fontSize:11, fontWeight:500, color:"#b23b3b" }}>
              Character limit reached — this letter fills one page.
            </div>
          )}
        </div>

        <div style={{ borderTop:`1px solid ${LINE}`, padding:"16px 26px 22px" }}>
          <button className="exp" onClick={handleExport}
            style={{ width:"100%", fontFamily:SANS, fontSize:12, fontWeight:500, color:INK,
                     background:"transparent", border:"none", textAlign:"left", padding:0,
                     cursor:"pointer", marginBottom:10 }}>
            Export Cover Letter PDF →
          </button>
          {error && (
            <div style={{ fontFamily:SANS, fontSize:11, fontWeight:500, color:"#b23b3b", marginBottom:8 }}>
              {error}
            </div>
          )}
          <div style={{ fontFamily:SANS, fontSize:10, color:MUTE }}>
            {filePrefix}_{(recipient.company.trim().replace(/\s+/g,"")) || "Company"}
          </div>
        </div>
      </div>

      {/* ── RIGHT · PREVIEW ─────────────────────────────────────────── */}
      <div className="clstage">
        <span className="stage-extra" style={{ position:"absolute", right:26, bottom:22,
              fontFamily:SANS, fontSize:11, fontWeight:500, color:YELLOW }}>Preview</span>

        <div className="clscale" style={{ transform:`scale(${PREVIEW_SCALE})`, transformOrigin:"top center" }}>
          <div ref={previewRef} className="cl" style={{
            position:"relative", width:W, height:H, background:"#fff", overflow:"hidden",
            boxShadow:"0 2px 24px rgba(0,0,0,.10)" }}>

            {isCold ? (
              /* ── COLD ─────────────────────────────────────────────── */
              <>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"2.26%" }}>
                  <p style={nsTok}>Navaal Saeed</p></div>

                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"15.11%" }}><p style={sans()}>To</p></div>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"18.77%" }}><p style={gar(true)}>{rName}</p></div>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"20.19%" }}><p style={gar()}>{rCo}</p></div>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"21.62%" }}><p style={gar()}><Email value={rEmail} /></p></div>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"23.04%" }}><p style={gar()}>{rPhone}</p></div>

                <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)",
                              top:"26.9%", bottom:"9.8%", width:"58.3%",
                              display:"flex", flexDirection:"column",
                              justifyContent:"center", alignItems:"center", textAlign:"center" }}>
                  <p ref={msgRef} style={msgStyle}>{bodyText}</p>
                  <div style={{ marginTop:15 }}><Sig /></div>
                </div>

                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"92.89%" }}><p style={gar(true)}>{FROM.name}</p></div>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"94.31%" }}><p style={gar()}><Email value={FROM.email} /></p></div>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"95.74%" }}><p style={gar()}>{FROM.phone}</p></div>
              </>
            ) : (
              /* ── KNOWN ────────────────────────────────────────────── */
              <>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"2.26%" }}><p style={{ ...nsTok, letterSpacing:"0.5em" }}>N</p></div>
                <div style={{ position:"absolute", left:0, width:"100%", textAlign:"center", top:"93.66%" }}><p style={nsTok}>S</p></div>

                <p style={{ position:"absolute", left:"4.76%", top:"15.1%",  ...sans() }}>From</p>
                <p style={{ position:"absolute", left:"4.76%", top:"18.76%", ...gar(true) }}>{FROM.name}</p>
                <p style={{ position:"absolute", left:"4.76%", top:"20.19%", ...gar() }}><Email value={FROM.email} /></p>
                <p style={{ position:"absolute", left:"4.76%", top:"21.62%", ...gar() }}>{FROM.phone}</p>
                <p style={{ position:"absolute", left:"4.76%", top:"23.05%", ...gar() }}>{FROM.abn}</p>

                <p style={{ position:"absolute", left:"50.71%", top:"15.1%",  ...sans() }}>To</p>
                <p style={{ position:"absolute", left:"50.71%", top:"18.76%", ...gar(true) }}>{rName}</p>
                <p style={{ position:"absolute", left:"50.71%", top:"20.18%", ...gar() }}>{rCo}</p>
                <p style={{ position:"absolute", left:"50.71%", top:"21.62%", ...gar() }}><Email value={rEmail} /></p>
                <p style={{ position:"absolute", left:"50.71%", top:"23.05%", ...gar() }}>{rPhone}</p>

                <div style={{ position:"absolute", left:"4.76%", top:"49.57%", width:"59.3%" }}>
                  <p ref={msgRef} style={msgStyle}>{bodyText}</p>
                  <div style={{ marginTop:30 }}><Sig /></div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
