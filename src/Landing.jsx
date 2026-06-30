import { useState, useEffect } from "react";

const SANS = '"NHU", "Helvetica Medium", Helvetica, "Helvetica Neue", Arial, sans-serif';
const YELLOW = "#F8C14C";

const FONT_CSS = `
@font-face{ font-family:"NHU"; font-weight:500;
  src:url("https://db.onlinewebfonts.com/t/7d349f3b93cd47712cf75443b05965bf.woff2") format("woff2"),
      url("https://db.onlinewebfonts.com/t/7d349f3b93cd47712cf75443b05965bf.woff") format("woff"); }`;

export default function Landing({ animate, onRoute }) {
  const [phase, setPhase] = useState(animate ? 0 : 4);

  useEffect(() => {
    if (!animate) return;
    const t = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 4800),
    ];
    return () => t.forEach(clearTimeout);
  }, [animate]);

  const apart = phase >= 3;
  const ns = (extra) => ({
    position:"absolute", left:"50%", fontFamily:SANS, fontWeight:500, fontSize:42,
    lineHeight:1, color:"#fff",
    transition:"transform 1.15s cubic-bezier(.22,.61,.36,1), opacity 1.1s ease",
    opacity: phase === 0 ? 0 : phase === 1 ? 0.3 : 1, ...extra });
  const label = (left) => ({
    position:"absolute", top:"49.4%", left:`${left}%`, transform:"translateX(-50%)",
    fontFamily:SANS, fontWeight:500, fontSize:10, color:"#fff", whiteSpace:"nowrap",
    cursor:"pointer", transition:"opacity 1.0s ease, color .15s ease",
    opacity: phase >= 4 ? 1 : 0 });

  const lab = (left, text, id) => (
    <div style={label(left)} onClick={() => onRoute(id)}
         onMouseEnter={(e)=>e.currentTarget.style.color=YELLOW}
         onMouseLeave={(e)=>e.currentTarget.style.color="#fff"}>{text}</div>
  );

  return (
    <div style={{ position:"relative", width:"100%", height:"100vh", background:"#000", overflow:"hidden" }}>
      <style>{`${FONT_CSS} *,*::before,*::after{box-sizing:border-box;}`}</style>
      <div style={ns({ top:32,
        transform: apart ? "translate(-50%,0)" : "translate(-50%, calc(42vh - 32px))" })}>N</div>
      <div style={ns({ bottom:30, top:"auto",
        transform: apart ? "translate(-50%,0)" : "translate(-50%, calc(-42vh + 30px))" })}>S</div>

      {lab(17.85, "Cold Cover Letter", "cold")}
      {lab(50,    "Invoice Maker",     "invoice")}
      {lab(81.9,  "Known Cover Letter","known")}
    </div>
  );
}
