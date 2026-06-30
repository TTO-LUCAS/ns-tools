import { useState, useRef, useEffect } from "react";
import Landing from "./Landing.jsx";
import InvoiceTool from "./InvoiceTool.jsx";
import CoverLetterTool from "./CoverLetterTool.jsx";

const SANS = '"NHU", "Helvetica Medium", Helvetica, "Helvetica Neue", Arial, sans-serif';
const YELLOW = "#F8C14C";
const PHONE_MAX = 600;   // phones only

function MobileBlock({ onContinue }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:9999,
                  display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", padding:"0 32px", textAlign:"center" }}>
      <p style={{ fontFamily:SANS, fontSize:14, fontWeight:500, color:"#fff", lineHeight:1.5, margin:0 }}>
        This tool is intended for use on desktop only.
      </p>
      <div onClick={onContinue}
        style={{ marginTop:14, fontFamily:SANS, fontSize:12, fontWeight:500, color:YELLOW,
                 cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 }}>
        Continue anyway
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing");
  const [isPhone, setIsPhone] = useState(false);
  const [override, setOverride] = useState(false);
  const seen = useRef(false);

  useEffect(() => {
    const check = () => setIsPhone(window.innerWidth <= PHONE_MAX);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const route = (id) => { seen.current = true; setView(id); };
  const back  = () => setView("landing");

  return (
    <>
      {isPhone && !override && <MobileBlock onContinue={() => setOverride(true)} />}

      {view === "landing"  && <Landing animate={!seen.current} onRoute={route} />}
      {view === "invoice"  && <InvoiceTool onBack={back} />}
      {view === "cold"     && <CoverLetterTool variant="cold"  onBack={back} />}
      {view === "known"    && <CoverLetterTool variant="known" onBack={back} />}
    </>
  );
}
