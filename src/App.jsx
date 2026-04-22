import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";

// ─── DB ───────────────────────────────────────────────────────
async function dbGet(key) {
  try { const { data } = await supabase.from("kv_store").select("value").eq("key", key).single(); return data ? JSON.parse(data.value) : null; }
  catch { return null; }
}
async function dbSet(key, val) {
  try { await supabase.from("kv_store").upsert({ key, value: JSON.stringify(val) }, { onConflict: "key" }); return true; }
  catch { return false; }
}

// ─── CONSTANTS ────────────────────────────────────────────────
const ADMIN_PASSWORD = "sanbing2024";
const DEFAULT_OPERATORS = [
  { id: "op_songshuai", name: "宋帅",  color: "#6366F1" },
  { id: "op_fubaikun",  name: "付百坤", color: "#10B981" },
];
const DEFAULT_GROUPS = ["合作", "公会", "重点跟播"];
const GROUP_COLORS   = { "合作": "#6366F1", "公会": "#10B981", "重点跟播": "#F59E0B" };
const DEFAULT_STREAMERS = [
  { id:"s1",  name:"天才小梨",      tid:"weibaweiba1231", group:"合作",     opId:"op_songshuai", deleted:false },
  { id:"s2",  name:"最强零氪",      tid:"dycf491036",     group:"合作",     opId:"op_songshuai", deleted:false },
  { id:"s3",  name:"什刹海",        tid:"46380510043",    group:"合作",     opId:"op_fubaikun",  deleted:false },
  { id:"s4",  name:"风",            tid:"too7060",        group:"合作",     opId:"op_fubaikun",  deleted:false },
  { id:"s5",  name:"懒大王",        tid:"mmm_714",        group:"合作",     opId:"op_songshuai", deleted:false },
  { id:"s6",  name:"蛋蛋",          tid:"79028547988",    group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s7",  name:"咕噜噜",        tid:"40380793848",    group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s8",  name:"须尽欢",        tid:"sanbingmq",      group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s9",  name:"狂欢泡泡",      tid:"aaa..ss",        group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s10", name:"小奶龙波波",    tid:"31459088643",    group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s11", name:"车厘子",        tid:"view_0728",      group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s12", name:"三冰龙三",      tid:"948083399",      group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s13", name:"三冰猛男",      tid:"67005932855",    group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s14", name:"闲游虾仁",      tid:"iii66856",       group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s15", name:"国冰河时代ma",  tid:"91443873441",    group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s16", name:"国冰河时代劝",  tid:"130134487",      group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s17", name:"小板凳",        tid:"yxswi",          group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s18", name:"三国冰河时",    tid:"574022932",      group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s19", name:"4Uoik",         tid:"74589263266",    group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s20", name:"Z+è",           tid:"e_quation",      group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s21", name:"冰河时代最胖",  tid:"2171606548",     group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s22", name:"小风车",        tid:"81963397842",    group:"公会",     opId:"op_songshuai", deleted:false },
  { id:"s23", name:"国冰河时代爱马",tid:"68212721935",    group:"公会",     opId:"op_fubaikun",  deleted:false },
  { id:"s24", name:"无所畏惧",      tid:"Y2321692395",    group:"重点跟播", opId:"op_songshuai", deleted:false },
  { id:"s25", name:"三国冰河时星",  tid:"65600732710",    group:"重点跟播", opId:"op_fubaikun",  deleted:false },
  { id:"s26", name:"唐八苦",        tid:"xx789879xx",     group:"重点跟播", opId:"op_songshuai", deleted:false },
  { id:"s27", name:"莉丝逆战未来",  tid:"czm775201314",   group:"重点跟播", opId:"op_fubaikun",  deleted:false },
  { id:"s28", name:"国冰河时代梦",  tid:"38305562956",    group:"重点跟播", opId:"op_songshuai", deleted:false },
  { id:"s29", name:"北辰星",        tid:"189378733",      group:"重点跟播", opId:"op_fubaikun",  deleted:false },
  { id:"s30", name:"三冰大帅",      tid:"40180886324",    group:"重点跟播", opId:"op_songshuai", deleted:false },
  { id:"s31", name:"凤",            tid:"27915685786",    group:"重点跟播", opId:"op_fubaikun",  deleted:false },
];

const RATING_OPTIONS = ["S","A+","A","B+","B","C+","C","D"];
const RATING_COLORS  = { S:"#7C3AED","A+":"#2563EB",A:"#0891B2","B+":"#059669",B:"#65A30D","C+":"#D97706",C:"#EA580C",D:"#DC2626" };
const DATA_FIELDS = [
  { key:"exposure", short:"曝光",          label:"曝光量",     w:75, ph:"0" },
  { key:"uv",       short:"UV\n(场观)",    label:"UV(场观)",   w:75, ph:"0" },
  { key:"acu",      short:"ACU\n均在线",   label:"ACU",        w:75, ph:"0" },
  { key:"peak",     short:"峰值\n在线",    label:"峰值在线",   w:75, ph:"0" },
  { key:"stay",     short:"停留\n时长(s)", label:"停留时长(s)",w:75, ph:"0" },
  { key:"interact", short:"互动率\n%",     label:"互动率%",    w:68, ph:"0" },
  { key:"fans",     short:"粉丝\n净增",    label:"粉丝净增",   w:68, ph:"0" },
];
const CONTENT_FIELDS = [
  { key:"script",   label:"话术要点",  w:160, ph:"有效话术 / 需改进的..." },
  { key:"bgm",      label:"BGM&节奏",  w:140, ph:"本周用了什么 / 下周换..." },
  { key:"hotspot",  label:"热点追踪",  w:150, ph:"追了哪个热点 / 效果..." },
  { key:"activity", label:"活动执行",  w:150, ph:"活动节点 / 配合情况..." },
];
const CONCLUDE_FIELDS = [
  { key:"highlight", label:"本周亮点",   w:155, ph:"做对了什么..." },
  { key:"problem",   label:"待解决问题", w:155, ph:"最优先1条..." },
  { key:"nextplan",  label:"下周方向",   w:145, ph:"重点要做的..." },
];
const EMPTY_REC = () => ({ exposure:"",uv:"",acu:"",peak:"",stay:"",interact:"",fans:"",script:"",bgm:"",hotspot:"",activity:"",highlight:"",problem:"",nextplan:"",rating:"" });
const getWeekKey  = (opId, w) => `wr_${opId}_${w.replace(/[\s.\-]/g,"_")}`;
const getMonthKey = (opId, m) => `mr_${opId}_${m.replace(/[\s年月]/g,"_")}`;

// ─── ICONS ────────────────────────────────────────────────────
const PATHS = {
  calendar:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  plus:"M12 4v16m8-8H4", x:"M6 18L18 6M6 6l12 12", check:"M5 13l4 4L19 7",
  save:"M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
  settings:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  upload:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  download:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  shield:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  chart:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  trend:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  lock:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
};
const Ic = ({ n, s=16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {PATHS[n].split(" M").map((seg,i)=><path key={i} d={i===0?seg:"M"+seg}/>)}
  </svg>
);

// ─── WEEK PICKER ──────────────────────────────────────────────
function WeekPicker({ value, onChange }) {
  const [open,setOpen]=useState(false); const ref=useRef();
  const now=new Date();
  const [ym,setYm]=useState(`${now.getFullYear()}-${now.getMonth()+1}`);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const [y,m]=ym.split("-").map(Number);
  const weeks=(()=>{const arr=[];let cur=new Date(y,m-1,1);while(cur.getDay()!==1)cur.setDate(cur.getDate()-1);const last=new Date(y,m,0);while(cur<=last){const end=new Date(cur);end.setDate(end.getDate()+6);const f=d=>`${d.getMonth()+1}.${String(d.getDate()).padStart(2,"0")}`;arr.push(`${f(cur)} - ${f(end)}`);cur.setDate(cur.getDate()+7);}return arr;})();
  const shift=n=>{const d=new Date(y,m-1+n,1);setYm(`${d.getFullYear()}-${d.getMonth()+1}`);};
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",background:value?"#1e293b":"#334155",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",whiteSpace:"nowrap"}}>
        <Ic n="calendar" s={13}/>{value||"选择周期"}
      </button>
      {open&&(<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:300,background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:14,minWidth:230,boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button onClick={()=>shift(-1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>‹</button>
          <span style={{color:"#f1f5f9",fontWeight:700,fontSize:13}}>{y}年{m}月</span>
          <button onClick={()=>shift(1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>›</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          {weeks.map(w=>(<button key={w} onClick={()=>{onChange(w);setOpen(false);}} style={{padding:"7px 11px",background:value===w?"#6366F1":"#0f172a",border:`1px solid ${value===w?"#6366F1":"#334155"}`,borderRadius:6,color:"#f1f5f9",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>{w}</button>))}
        </div>
      </div>)}
    </div>
  );
}

// ─── MONTH PICKER ─────────────────────────────────────────────
function MonthPicker({ value, onChange }) {
  const [open,setOpen]=useState(false); const ref=useRef();
  const now=new Date();
  const [year,setYear]=useState(now.getFullYear());
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const months=Array.from({length:12},(_,i)=>`${year}年${i+1}月`);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",background:value?"#1e293b":"#334155",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",whiteSpace:"nowrap"}}>
        <Ic n="calendar" s={13}/>{value||"选择月份"}
      </button>
      {open&&(<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:300,background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:14,minWidth:180,boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button onClick={()=>setYear(y=>y-1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>‹</button>
          <span style={{color:"#f1f5f9",fontWeight:700,fontSize:13}}>{year}年</span>
          <button onClick={()=>setYear(y=>y+1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
          {months.map(mo=>(<button key={mo} onClick={()=>{onChange(mo);setOpen(false);}} style={{padding:"6px 4px",background:value===mo?"#6366F1":"#0f172a",border:`1px solid ${value===mo?"#6366F1":"#334155"}`,borderRadius:6,color:"#f1f5f9",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>{mo.split("年")[1]}</button>))}
        </div>
      </div>)}
    </div>
  );
}

// ─── ADMIN LOGIN MODAL ────────────────────────────────────────
function AdminLoginModal({ onSuccess, onClose }) {
  const [pw,setPw]=useState(""); const [err,setErr]=useState(false);
  const check=()=>{ if(pw===ADMIN_PASSWORD){onSuccess();}else{setErr(true);setTimeout(()=>setErr(false),1500);} };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:16,padding:32,width:320,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>🔐</div>
        <div style={{color:"#f1f5f9",fontWeight:800,fontSize:16,marginBottom:6}}>管理员验证</div>
        <div style={{color:"#64748B",fontSize:13,marginBottom:20}}>输入管理员密码进入审批模式</div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()}
          placeholder="输入密码"
          style={{width:"100%",background:err?"#2D1515":"#1e293b",border:`1px solid ${err?"#EF4444":"#334155"}`,borderRadius:8,color:"#f1f5f9",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box",marginBottom:8,transition:"all .2s"}}/>
        {err&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8}}>密码错误</div>}
        <button onClick={check} style={{width:"100%",padding:"10px",background:"#6366F1",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Noto Sans SC',sans-serif"}}>确认</button>
      </div>
    </div>
  );
}

// ─── IMPORT MODAL ─────────────────────────────────────────────
function ImportModal({ operators, currentOpId, onImport, onClose }) {
  const [mode,setMode]=useState("download"); // download | upload
  const [rows,setRows]=useState([]);
  const [opId,setOpId]=useState(currentOpId||operators[0]?.id||"");
  const [msg,setMsg]=useState("");

  const downloadTemplate=()=>{
    const headers=["主播昵称","抖音ID","分组(合作/公会/重点跟播)","曝光","UV(场观)","ACU","峰值在线","停留时长(s)","互动率%","粉丝净增","话术要点","BGM节奏","热点追踪","活动执行","本周亮点","待解决问题","下周方向","评级(S/A+/A/B+/B/C+/C/D)"];
    const example=["示例主播","example123","公会","10000","5000","200","500","45","5.2","100","开场话术很好用","节奏快","追了XX热点","活动配合到位","互动率高","话术需改进","加强开场钩子","A"];
    const csv=[headers,example].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="三冰复盘导入模板.csv";a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV=(text)=>{
    const lines=text.trim().split("\n");
    const headers=lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
    return lines.slice(1).map(line=>{
      const vals=[];let cur="";let inQ=false;
      for(let ch of line){if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){vals.push(cur.trim());cur="";}else{cur+=ch;}}
      vals.push(cur.trim());
      const obj={};headers.forEach((h,i)=>{obj[h]=vals[i]||"";});
      return obj;
    }).filter(r=>r["主播昵称"]);
  };

  const handleFile=async(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const text=await file.text();
    try{
      const parsed=parseCSV(text);
      const mapped=parsed.map((r,i)=>({
        id:"import_"+Date.now()+"_"+i,
        name:r["主播昵称"]||"",
        tid:r["抖音ID"]||"",
        group:r["分组(合作/公会/重点跟播)"]||"公会",
        opId,
        deleted:false,
        _weekData:{
          exposure:r["曝光"]||"", uv:r["UV(场观)"]||"", acu:r["ACU"]||"",
          peak:r["峰值在线"]||"", stay:r["停留时长(s)"]||"", interact:r["互动率%"]||"",
          fans:r["粉丝净增"]||"", script:r["话术要点"]||"", bgm:r["BGM节奏"]||"",
          hotspot:r["热点追踪"]||"", activity:r["活动执行"]||"",
          highlight:r["本周亮点"]||"", problem:r["待解决问题"]||"",
          nextplan:r["下周方向"]||"", rating:r["评级(S/A+/A/B+/B/C+/C/D)"]||"",
        }
      }));
      setRows(mapped);
      setMode("preview");
      setMsg(`解析成功，共 ${mapped.length} 条记录`);
    }catch(err){setMsg("解析失败，请确认文件格式正确");}
  };

  const btn=(bg,ex={})=>({padding:"8px 18px",background:bg,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif",display:"flex",alignItems:"center",gap:6,...ex});

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,width:"min(700px,94vw)",maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <span style={{color:"#f1f5f9",fontWeight:800,fontSize:15}}>📥 批量导入主播数据</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer"}}><Ic n="x" s={19}/></button>
        </div>
        <div style={{overflowY:"auto",padding:22,flex:1}}>
          {mode!=="preview"&&(<>
            <div style={{marginBottom:20}}>
              <div style={{color:"#94a3b8",fontSize:13,marginBottom:10}}>归属运营</div>
              <div style={{display:"flex",gap:8}}>
                {operators.map(op=>(<button key={op.id} onClick={()=>setOpId(op.id)} style={{...btn(opId===op.id?op.color:"#1e293b"),border:`1px solid ${opId===op.id?op.color:"#334155"}`}}>{op.name}</button>))}
              </div>
            </div>
            <div style={{background:"#080f1e",borderRadius:12,padding:20,marginBottom:16,border:"1px solid #1e293b"}}>
              <div style={{color:"#6366F1",fontWeight:700,fontSize:14,marginBottom:8}}>第一步：下载模板</div>
              <div style={{color:"#64748B",fontSize:13,marginBottom:12}}>下载 CSV 模板，按格式填写主播信息和本周数据，支持一次导入多个主播。</div>
              <button onClick={downloadTemplate} style={btn("#334155")}><Ic n="download" s={14}/>下载 CSV 模板</button>
            </div>
            <div style={{background:"#080f1e",borderRadius:12,padding:20,border:"1px solid #1e293b"}}>
              <div style={{color:"#10B981",fontWeight:700,fontSize:14,marginBottom:8}}>第二步：上传填好的文件</div>
              <div style={{color:"#64748B",fontSize:13,marginBottom:12}}>支持 CSV 格式（Excel 另存为 CSV 即可）</div>
              <label style={{...btn("#10B981"),display:"inline-flex",cursor:"pointer"}}>
                <Ic n="upload" s={14}/>选择文件上传
                <input type="file" accept=".csv" onChange={handleFile} style={{display:"none"}}/>
              </label>
              {msg&&<div style={{color:msg.includes("失败")?"#EF4444":"#10B981",fontSize:13,marginTop:10}}>{msg}</div>}
            </div>
          </>)}

          {mode==="preview"&&(<>
            <div style={{color:"#10B981",fontSize:13,marginBottom:14,fontWeight:700}}>{msg}</div>
            <div style={{overflowX:"auto",borderRadius:10,border:"1px solid #1e293b",marginBottom:16}}>
              <table style={{borderCollapse:"collapse",width:"100%",minWidth:500}}>
                <thead><tr>{["昵称","抖音ID","分组","UV","ACU","评级"].map(h=>(<th key={h} style={{padding:"8px 10px",background:"#1e293b",color:"#64748B",fontSize:11,fontWeight:700,textAlign:"left",borderBottom:"1px solid #334155"}}>{h}</th>))}</tr></thead>
                <tbody>{rows.map((r,i)=>(<tr key={i}>{[r.name,r.tid,r.group,r._weekData.uv,r._weekData.acu,r._weekData.rating].map((v,vi)=>(<td key={vi} style={{padding:"7px 10px",background:i%2===0?"#080f1e":"#0a1628",color:"#e2e8f0",fontSize:12,border:"1px solid #0d1929"}}>{v||"-"}</td>))}</tr>))}</tbody>
              </table>
            </div>
          </>)}
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #1e293b",display:"flex",justifyContent:"space-between",gap:8,flexShrink:0}}>
          {mode==="preview"?(<>
            <button onClick={()=>{setMode("upload");setRows([]);setMsg("");}} style={btn("#334155")}>重新上传</button>
            <button onClick={()=>{onImport(rows,opId);onClose();}} style={btn("#6366F1")}><Ic n="check" s={14}/>确认导入 {rows.length} 条</button>
          </>):(<>
            <div/>
            <button onClick={onClose} style={btn("#334155")}>取消</button>
          </>)}
        </div>
      </div>
    </div>
  );
}

// ─── MANAGE MODAL ─────────────────────────────────────────────
function ManageModal({ operators, streamers, isAdmin, onClose, onSave }) {
  const [ops,setOps]=useState(JSON.parse(JSON.stringify(operators)));
  const [strs,setStrs]=useState(JSON.parse(JSON.stringify(streamers)));
  const [tab,setTab]=useState("ops");
  const [newOp,setNewOp]=useState({name:"",color:"#6366F1"});
  const [newStr,setNewStr]=useState({name:"",tid:"",group:DEFAULT_GROUPS[0],opId:operators[0]?.id||""});
  const PALETTE=["#6366F1","#10B981","#F59E0B","#EC4899","#14B8A6","#F97316","#8B5CF6","#EF4444","#0EA5E9","#84CC16"];
  const inp=(ex={})=>({background:"#1e293b",border:"1px solid #334155",borderRadius:7,color:"#f1f5f9",padding:"7px 11px",fontSize:13,outline:"none",fontFamily:"'Noto Sans SC',sans-serif",...ex});
  const btn=(bg,ex={})=>({padding:"8px 16px",background:bg,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif",display:"flex",alignItems:"center",gap:6,...ex});
  const addOp=()=>{if(!newOp.name.trim())return;setOps(p=>[...p,{id:"op_"+Date.now(),name:newOp.name.trim(),color:newOp.color}]);setNewOp({name:"",color:"#6366F1"});};
  const delOp=id=>{setOps(p=>p.filter(o=>o.id!==id));setStrs(p=>p.map(s=>s.opId===id?{...s,opId:""}:s));};
  const addStr=()=>{if(!newStr.name.trim())return;setStrs(p=>[...p,{id:"s_"+Date.now(),...newStr,name:newStr.name.trim(),tid:newStr.tid.trim(),deleted:false}]);setNewStr(p=>({...p,name:"",tid:""}));};

  // 运营只能申请删除，管理员才能真正删除
  const requestDelete=(id)=>setStrs(p=>p.map(s=>s.id===id?{...s,deleteRequested:true}:s));
  const approveDelete=(id)=>setStrs(p=>p.filter(s=>s.id!==id));
  const rejectDelete=(id)=>setStrs(p=>p.map(s=>s.id===id?{...s,deleteRequested:false}:s));
  const updStr=(id,f,v)=>setStrs(p=>p.map(s=>s.id===id?{...s,[f]:v}:s));

  const pendingDeletes=strs.filter(s=>s.deleteRequested);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,width:"min(900px,94vw)",maxHeight:"87vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:"#f1f5f9",fontWeight:800,fontSize:15}}>⚙️ 管理运营 & 主播</span>
            {isAdmin&&<span style={{background:"#7C3AED",color:"#fff",fontSize:11,padding:"2px 8px",borderRadius:10,fontWeight:700}}>管理员模式</span>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer"}}><Ic n="x" s={19}/></button>
        </div>
        <div style={{display:"flex",padding:"0 22px",borderBottom:"1px solid #1e293b",flexShrink:0}}>
          {[["ops","👤 运营管理"],["strs","🎮 主播管理"],isAdmin&&pendingDeletes.length>0&&["del",`🗑️ 删除审批 (${pendingDeletes.length})`]].filter(Boolean).map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:"11px 18px",background:"none",border:"none",borderBottom:`2px solid ${tab===k?"#6366F1":"transparent"}`,color:tab===k?"#6366F1":"#64748B",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif"}}>{l}</button>
          ))}
        </div>
        <div style={{overflowY:"auto",padding:22,flex:1}}>
          {tab==="ops"&&(<div>
            <div style={{display:"flex",gap:8,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
              <input value={newOp.name} onChange={e=>setNewOp(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addOp()} placeholder="运营姓名" style={{...inp(),flex:"1 1 120px"}}/>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{PALETTE.map(c=>(<button key={c} onClick={()=>setNewOp(p=>({...p,color:c}))} style={{width:22,height:22,borderRadius:5,background:c,cursor:"pointer",border:`2px solid ${newOp.color===c?"#fff":"transparent"}`}}/>))}</div>
              <button onClick={addOp} style={btn("#6366F1")}><Ic n="plus" s={13}/>添加运营</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ops.map(op=>(<div key={op.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 15px",background:"#1e293b",borderRadius:10,border:`1px solid ${op.color}44`}}>
                <div style={{width:11,height:11,borderRadius:3,background:op.color,flexShrink:0}}/>
                <span style={{color:"#f1f5f9",fontWeight:700,flex:1,fontSize:14}}>{op.name}</span>
                <span style={{color:"#475569",fontSize:12}}>{strs.filter(s=>s.opId===op.id).length} 个主播</span>
                {isAdmin&&<button onClick={()=>delOp(op.id)} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer"}}><Ic n="trash" s={14}/></button>}
              </div>))}
            </div>
          </div>)}

          {tab==="strs"&&(<div>
            <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
              <input value={newStr.name} onChange={e=>setNewStr(p=>({...p,name:e.target.value}))} placeholder="主播昵称" style={{...inp(),width:110}}/>
              <input value={newStr.tid}  onChange={e=>setNewStr(p=>({...p,tid:e.target.value}))}  placeholder="抖音ID"   style={{...inp(),width:140}}/>
              <select value={newStr.group} onChange={e=>setNewStr(p=>({...p,group:e.target.value}))} style={inp()}>{DEFAULT_GROUPS.map(g=><option key={g}>{g}</option>)}</select>
              <select value={newStr.opId}  onChange={e=>setNewStr(p=>({...p,opId:e.target.value}))}  style={inp()}><option value="">未分配</option>{ops.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
              <button onClick={addStr} style={btn("#6366F1")}><Ic n="plus" s={13}/>添加主播</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
                <thead><tr>{["昵称","抖音ID","分组","归属运营","操作"].map(h=>(<th key={h} style={{padding:"8px 11px",background:"#1e293b",color:"#64748B",fontSize:11,fontWeight:700,textAlign:"left",borderBottom:"1px solid #334155"}}>{h}</th>))}</tr></thead>
                <tbody>{strs.filter(s=>!s.deleteRequested).map((s,i)=>{
                  const op=ops.find(o=>o.id===s.opId);const bg=i%2===0?"#0a1628":"#080f1e";const td={padding:"8px 11px",background:bg,borderBottom:"1px solid #0d1929"};
                  return (<tr key={s.id}><td style={{...td,color:"#f1f5f9",fontWeight:700,fontSize:12}}>{s.name}</td><td style={{...td,color:"#64748B",fontSize:11}}>{s.tid}</td>
                    <td style={td}><select value={s.group} onChange={e=>updStr(s.id,"group",e.target.value)} style={{...inp({padding:"4px 8px",fontSize:12})}}>{DEFAULT_GROUPS.map(g=><option key={g}>{g}</option>)}</select></td>
                    <td style={td}><select value={s.opId} onChange={e=>updStr(s.id,"opId",e.target.value)} style={{...inp({padding:"4px 8px",fontSize:12,borderColor:op?.color||"#334155"})}}><option value="">未分配</option>{ops.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></td>
                    <td style={td}>
                      {isAdmin?(<button onClick={()=>approveDelete(s.id)} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer"}}><Ic n="trash" s={13}/></button>)
                        :(<button onClick={()=>requestDelete(s.id)} style={{background:"none",border:"1px solid #475569",borderRadius:5,color:"#94a3b8",cursor:"pointer",fontSize:11,padding:"2px 8px",fontFamily:"'Noto Sans SC',sans-serif"}}>申请删除</button>)}
                    </td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>)}

          {tab==="del"&&isAdmin&&(<div>
            <div style={{color:"#94a3b8",fontSize:13,marginBottom:14}}>以下主播已申请删除，请确认是否批准：</div>
            {pendingDeletes.length===0?(<div style={{color:"#334155",fontSize:14,textAlign:"center",padding:"40px 0"}}>暂无待审批的删除申请</div>)
              :pendingDeletes.map((s,i)=>{
              const op=ops.find(o=>o.id===s.opId);
              return (<div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"#1e293b",borderRadius:10,marginBottom:8,border:"1px solid #EF444433"}}>
                <div style={{flex:1}}>
                  <div style={{color:"#f1f5f9",fontWeight:700,fontSize:14}}>{s.name}</div>
                  <div style={{color:"#64748B",fontSize:12}}>{s.tid} · {op?.name||"未分配"} · {s.group}</div>
                </div>
                <button onClick={()=>rejectDelete(s.id)} style={{padding:"6px 14px",background:"#334155",border:"none",borderRadius:7,color:"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>拒绝</button>
                <button onClick={()=>approveDelete(s.id)} style={{padding:"6px 14px",background:"#EF4444",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif"}}>批准删除</button>
              </div>);
            })}
          </div>)}
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #1e293b",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0}}>
          <button onClick={onClose} style={btn("#334155")}>取消</button>
          <button onClick={()=>onSave(ops,strs)} style={btn("#6366F1")}><Ic n="save" s={13}/>保存设置</button>
        </div>
      </div>
    </div>
  );
}

// ─── TABLE STYLES ─────────────────────────────────────────────
const TH=(bg,color="#94a3b8",ex={})=>({padding:"8px 7px",border:"1px solid #1e293b",fontSize:11,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif",background:bg,color,whiteSpace:"pre-line",lineHeight:1.35,verticalAlign:"middle",textAlign:"center",...ex});
const TD=(bg,ex={})=>({border:"1px solid #0d1929",background:bg,verticalAlign:"middle",fontFamily:"'Noto Sans SC',sans-serif",padding:"5px 7px",...ex});

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard({ operators, streamers, allWeeks }) {
  const [loading,setLoading]=useState(true);
  const [weekData,setWeekData]=useState({});
  const [viewOp,setViewOp]=useState("all"); // all | opId

  const now=new Date();
  const getWeekLabel=(date)=>{
    const d=new Date(date); while(d.getDay()!==1)d.setDate(d.getDate()-1);
    const end=new Date(d); end.setDate(end.getDate()+6);
    const f=x=>`${x.getMonth()+1}.${String(x.getDate()).padStart(2,"0")}`;
    return `${f(d)} - ${f(end)}`;
  };
  const thisWeek=getWeekLabel(now);
  const lastWeekDate=new Date(now); lastWeekDate.setDate(now.getDate()-7);
  const lastWeek=getWeekLabel(lastWeekDate);

  const thisMonth=`${now.getFullYear()}年${now.getMonth()+1}月`;
  const lastMonthDate=new Date(now.getFullYear(),now.getMonth()-1,1);
  const lastMonth=`${lastMonthDate.getFullYear()}年${lastMonthDate.getMonth()+1}月`;

  useEffect(()=>{
    const weeks=[...new Set([thisWeek,lastWeek])];
    const keys=[];
    operators.forEach(op=>{ weeks.forEach(w=>keys.push({opId:op.id,w,key:getWeekKey(op.id,w)})); });
    Promise.all(keys.map(({key,opId,w})=>dbGet(key).then(d=>[`${opId}__${w}`,d]))).then(res=>{
      const obj={}; res.forEach(([k,d])=>{obj[k]=d;});
      setWeekData(obj); setLoading(false);
    });
  },[allWeeks.length]);

  const getVal=(opId,week,field)=>{
    const d=weekData[`${opId}__${week}`];
    if(!d) return null;
    const vals=Object.values(d.records||{}).map(r=>parseFloat(r[field])||0).filter(v=>v>0);
    return vals.length?Math.round(vals.reduce((a,b)=>a+b)/vals.length):null;
  };

  const filteredStreamers=viewOp==="all"?streamers:streamers.filter(s=>s.opId===viewOp);
  const filteredOps=viewOp==="all"?operators:operators.filter(o=>o.id===viewOp);

  const KPICard=({field,label,color})=>{
    const thisVals=filteredOps.flatMap(op=>filteredStreamers.filter(s=>s.opId===op.id).map(s=>{const d=weekData[`${op.id}__${thisWeek}`];return parseFloat(d?.records?.[s.id]?.[field])||0;})).filter(v=>v>0);
    const lastVals=filteredOps.flatMap(op=>filteredStreamers.filter(s=>s.opId===op.id).map(s=>{const d=weekData[`${op.id}__${lastWeek}`];return parseFloat(d?.records?.[s.id]?.[field])||0;})).filter(v=>v>0);
    const thisAvg=thisVals.length?Math.round(thisVals.reduce((a,b)=>a+b)/thisVals.length):null;
    const lastAvg=lastVals.length?Math.round(lastVals.reduce((a,b)=>a+b)/lastVals.length):null;
    const delta=thisAvg!==null&&lastAvg!==null?thisAvg-lastAvg:null;
    const pct=delta!==null&&lastAvg?((delta/lastAvg)*100).toFixed(1):null;
    return (
      <div style={{background:"#0f172a",borderRadius:12,padding:18,border:`1px solid ${color}33`,flex:"1 1 140px",minWidth:130}}>
        <div style={{color,fontSize:11,fontWeight:700,marginBottom:10,letterSpacing:.5}}>{label}</div>
        <div style={{color:"#f1f5f9",fontSize:24,fontWeight:900,marginBottom:6}}>{thisAvg!==null?thisAvg.toLocaleString():"--"}</div>
        {delta!==null&&(<div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{color:delta>=0?"#10B981":"#EF4444",fontSize:12,fontWeight:700}}>{delta>=0?"▲":"▼"}{Math.abs(delta).toLocaleString()}</span>
          {pct&&<span style={{color:"#475569",fontSize:11}}>({delta>=0?"+":""}{pct}%)</span>}
          <span style={{color:"#334155",fontSize:11}}>vs上周</span>
        </div>)}
        {delta===null&&<div style={{color:"#334155",fontSize:12}}>上周无数据对比</div>}
      </div>
    );
  };

  // Per-streamer table for this week
  const activeStreamers=filteredStreamers.filter(s=>!s.deleted&&!s.deleteRequested);

  return (
    <div>
      {/* Op filter */}
      <div style={{display:"flex",gap:8,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{color:"#64748B",fontSize:13}}>查看维度：</span>
        <button onClick={()=>setViewOp("all")} style={{padding:"5px 14px",borderRadius:18,border:`1px solid ${viewOp==="all"?"#6366F1":"#334155"}`,background:viewOp==="all"?"#6366F1":"#1e293b",color:viewOp==="all"?"#fff":"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>全部</button>
        {operators.map(op=>(<button key={op.id} onClick={()=>setViewOp(op.id)} style={{padding:"5px 14px",borderRadius:18,border:`1px solid ${viewOp===op.id?op.color:"#334155"}`,background:viewOp===op.id?op.color:"#1e293b",color:viewOp===op.id?"#fff":"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>{op.name}</button>))}
      </div>

      {loading?(<div style={{textAlign:"center",padding:"60px 0",color:"#475569"}}><div style={{fontSize:32,marginBottom:10}}>⏳</div><div>加载数据中...</div></div>):(<>

        {/* This week vs last week KPIs */}
        <div style={{background:"#0f172a",borderRadius:14,padding:20,marginBottom:20,border:"1px solid #1e293b"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{color:"#f1f5f9",fontWeight:800,fontSize:15}}>📊 本周数据概览</div>
              <div style={{color:"#475569",fontSize:12,marginTop:2}}>{thisWeek}  vs  上周 {lastWeek}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <KPICard field="exposure" label="曝光量（场均）" color="#A855F7"/>
            <KPICard field="uv"       label="UV（场观）"     color="#6366F1"/>
            <KPICard field="acu"      label="ACU（均在线）"  color="#10B981"/>
            <KPICard field="peak"     label="峰值在线"       color="#F59E0B"/>
            <KPICard field="stay"     label="停留时长(s)"    color="#14B8A6"/>
            <KPICard field="interact" label="互动率%"        color="#EC4899"/>
            <KPICard field="fans"     label="粉丝净增"       color="#84CC16"/>
          </div>
        </div>

        {/* Per-streamer ranking this week */}
        <div style={{background:"#0f172a",borderRadius:14,padding:20,marginBottom:20,border:"1px solid #1e293b"}}>
          <div style={{color:"#f1f5f9",fontWeight:800,fontSize:15,marginBottom:4}}>🏆 本周主播 UV 排行</div>
          <div style={{color:"#475569",fontSize:12,marginBottom:16}}>{thisWeek}</div>
          {activeStreamers.length===0?(<div style={{color:"#334155",fontSize:13,textAlign:"center",padding:"30px 0"}}>暂无数据，请先填写本周复盘</div>):(()=>{
            const withUV=activeStreamers.map(s=>{
              const op=operators.find(o=>o.id===s.opId);
              const d=weekData[`${s.opId}__${thisWeek}`];
              const uv=parseFloat(d?.records?.[s.id]?.uv)||0;
              const lastD=weekData[`${s.opId}__${lastWeek}`];
              const lastUv=parseFloat(lastD?.records?.[s.id]?.uv)||0;
              return {...s,uv,lastUv,opName:op?.name||"",opColor:op?.color||"#6366F1"};
            }).sort((a,b)=>b.uv-a.uv).slice(0,10);
            const maxUV=withUV[0]?.uv||1;
            return withUV.map((s,i)=>{
              const delta=s.lastUv?s.uv-s.lastUv:null;
              return (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:22,color:i<3?"#F59E0B":"#475569",fontWeight:800,fontSize:13,textAlign:"center",flexShrink:0}}>{i+1}</div>
                  <div style={{width:90,color:"#f1f5f9",fontSize:13,fontWeight:700,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                  <div style={{width:60,flexShrink:0}}>
                    <span style={{background:GROUP_COLORS[s.group]||"#6366F1",color:"#fff",fontSize:10,padding:"1px 6px",borderRadius:8,fontWeight:700}}>{s.group}</span>
                  </div>
                  <div style={{flex:1,background:"#1e293b",borderRadius:4,height:8,overflow:"hidden"}}>
                    <div style={{width:`${s.uv?Math.round((s.uv/maxUV)*100):0}%`,height:"100%",background:s.opColor,borderRadius:4,transition:"width .5s"}}/>
                  </div>
                  <div style={{width:70,color:"#6366F1",fontWeight:700,fontSize:13,textAlign:"right",flexShrink:0}}>{s.uv?s.uv.toLocaleString():"--"}</div>
                  {delta!==null&&<div style={{width:60,color:delta>=0?"#10B981":"#EF4444",fontSize:11,textAlign:"right",flexShrink:0}}>{delta>=0?"▲":"▼"}{Math.abs(delta).toLocaleString()}</div>}
                </div>
              );
            });
          })()}
        </div>

        {/* Rating distribution */}
        <div style={{background:"#0f172a",borderRadius:14,padding:20,border:"1px solid #1e293b"}}>
          <div style={{color:"#f1f5f9",fontWeight:800,fontSize:15,marginBottom:4}}>📈 本周评级分布</div>
          <div style={{color:"#475569",fontSize:12,marginBottom:16}}>{thisWeek}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {RATING_OPTIONS.map(r=>{
              const count=activeStreamers.filter(s=>{const d=weekData[`${s.opId}__${thisWeek}`];return d?.records?.[s.id]?.rating===r;}).length;
              return (<div key={r} style={{background:RATING_COLORS[r]+"22",border:`1px solid ${RATING_COLORS[r]}44`,borderRadius:10,padding:"10px 16px",textAlign:"center",minWidth:60}}>
                <div style={{color:RATING_COLORS[r],fontWeight:900,fontSize:18}}>{r}</div>
                <div style={{color:"#94a3b8",fontSize:20,fontWeight:700}}>{count}</div>
                <div style={{color:"#475569",fontSize:10}}>人</div>
              </div>);
            })}
            <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"10px 16px",textAlign:"center",minWidth:60}}>
              <div style={{color:"#64748B",fontWeight:900,fontSize:18}}>-</div>
              <div style={{color:"#94a3b8",fontSize:20,fontWeight:700}}>{activeStreamers.filter(s=>{const d=weekData[`${s.opId}__${thisWeek}`];return !d?.records?.[s.id]?.rating;}).length}</div>
              <div style={{color:"#475569",fontSize:10}}>未填</div>
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
}

// ─── WEEKLY VIEW ──────────────────────────────────────────────
function WeeklyView({ weekKey, myStreamers }) {
  const [data,setData]=useState({}); const [teamNote,setTeamNote]=useState({good:"",issue:""});
  const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false); const [loading,setLoading]=useState(false);
  useEffect(()=>{if(!weekKey)return;setLoading(true);setData({});setTeamNote({good:"",issue:""});dbGet(weekKey).then(d=>{if(d){setData(d.records||{});setTeamNote(d.teamNote||{good:"",issue:""});}setLoading(false);});},[weekKey]);
  const upd=(sid,f,v)=>setData(p=>({...p,[sid]:{...(p[sid]||EMPTY_REC()),[f]:v}}));
  const handleSave=async()=>{if(!weekKey)return;setSaving(true);await dbSet(weekKey,{records:data,teamNote,savedAt:new Date().toISOString()});setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2200);};
  const grouped=DEFAULT_GROUPS.map(g=>({group:g,members:myStreamers.filter(s=>s.group===g&&!s.deleted&&!s.deleteRequested)})).filter(g=>g.members.length>0);
  const CD="#3B82F6",CC="#10B981",CR="#8B5CF6";
  if(!weekKey)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:380,color:"#334155"}}><div style={{textAlign:"center"}}><div style={{fontSize:46,marginBottom:12}}>📅</div><div style={{fontSize:17,fontWeight:700,color:"#475569",marginBottom:6}}>请先选择复盘周期</div><div style={{fontSize:13}}>在顶部日历中选择本周日期范围</div></div></div>);
  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#475569"}}><div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>⏳</div><div>加载中...</div></div></div>);
  if(myStreamers.filter(s=>!s.deleted&&!s.deleteRequested).length===0)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:280,color:"#334155"}}><div style={{textAlign:"center"}}><div style={{fontSize:38,marginBottom:10}}>🎮</div><div style={{fontSize:14,fontWeight:700,color:"#475569",marginBottom:4}}>当前运营暂无归属主播</div><div style={{fontSize:12}}>在右上角「管理」中为该运营分配主播</div></div></div>);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        {[{key:"good",l:"🔥 本周最值得全团队复用的内容动作",c:"#10B981"},{key:"issue",l:"⚠️ 本周需集中解决的共性问题",c:"#F59E0B"}].map(({key,l,c})=>(
          <div key={key} style={{background:"#0f172a",borderRadius:10,padding:13,border:`1px solid ${c}33`}}>
            <div style={{color:c,fontSize:11,fontWeight:700,marginBottom:6}}>{l}</div>
            <textarea value={teamNote[key]} onChange={e=>setTeamNote(p=>({...p,[key]:e.target.value}))} placeholder="填写关键结论..." rows={2} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:12,resize:"none",outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <button onClick={handleSave} disabled={saving} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 20px",background:saved?"#10B981":"#6366F1",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",transition:"all .2s"}}>
          <Ic n={saved?"check":"save"} s={13}/>{saving?"保存中...":saved?"已保存！":"保存本周复盘"}
        </button>
      </div>
      <div style={{overflowX:"auto",borderRadius:11,border:"1px solid #1e293b"}}>
        <table style={{borderCollapse:"collapse",minWidth:1760,width:"100%"}}>
          <thead>
            <tr>
              <th style={TH("#060e1c","#475569",{width:30})}>#</th>
              <th style={TH("#060e1c","#94a3b8",{width:100})}>昵称</th>
              <th style={TH("#060e1c","#64748B",{width:108})}>抖音ID</th>
              <th colSpan={DATA_FIELDS.length} style={TH(CD+"22",CD,{borderLeft:`2px solid ${CD}`})}>📊 核心数据</th>
              <th colSpan={CONTENT_FIELDS.length} style={TH(CC+"22",CC,{borderLeft:`2px solid ${CC}`})}>🎙️ 内容复盘</th>
              <th colSpan={CONCLUDE_FIELDS.length} style={TH(CR+"22",CR,{borderLeft:`2px solid ${CR}`})}>🔍 结论 & 计划</th>
              <th style={TH("#ef444422","#ef4444",{minWidth:66})}>评级</th>
            </tr>
            <tr>
              <th colSpan={3} style={TH("#040c18")}></th>
              {DATA_FIELDS.map((f,i)=>(<th key={f.key} style={TH(CD+"0d","#93C5FD",{borderLeft:i===0?`2px solid ${CD}44`:undefined,minWidth:f.w})}>{f.short}</th>))}
              {CONTENT_FIELDS.map((f,i)=>(<th key={f.key} style={TH(CC+"0d","#6EE7B7",{borderLeft:i===0?`2px solid ${CC}44`:undefined,minWidth:f.w})}>{f.label}</th>))}
              {CONCLUDE_FIELDS.map((f,i)=>(<th key={f.key} style={TH(CR+"0d","#C4B5FD",{borderLeft:i===0?`2px solid ${CR}44`:undefined,minWidth:f.w})}>{f.label}</th>))}
              <th style={TH("#ef44440d","#FCA5A5")}></th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({group,members})=>{
              const gc=GROUP_COLORS[group]||"#6366F1";
              return members.map((s,mi)=>{
                const rec=data[s.id]||EMPTY_REC(); const bg=mi%2===0?"#080f1e":"#0a1628";
                const cell=(ex={})=>TD(bg,ex);
                const ta=(field,ph,isText=false)=>(<textarea value={rec[field]} onChange={e=>upd(s.id,field,e.target.value)} placeholder={ph} rows={isText?2:1} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:isText?11:12,resize:"none",outline:"none",lineHeight:1.4,fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/>);
                return (
                  <tr key={s.id}>
                    {mi===0&&(<td rowSpan={members.length} style={{background:gc,color:"#fff",fontWeight:800,fontSize:11,textAlign:"center",writingMode:"vertical-rl",padding:"10px 5px",border:"1px solid #1e293b",letterSpacing:2}}>{group}</td>)}
                    <td style={cell({fontWeight:700,color:"#f1f5f9",fontSize:12,whiteSpace:"nowrap"})}>{mi+1}. {s.name}</td>
                    <td style={cell({color:"#475569",fontSize:11})}>{s.tid}</td>
                    {DATA_FIELDS.map((f,i)=>(<td key={f.key} style={cell({borderLeft:i===0?`2px solid ${CD}44`:undefined})}>{ta(f.key,f.ph)}</td>))}
                    {CONTENT_FIELDS.map((f,i)=>(<td key={f.key} style={cell({borderLeft:i===0?`2px solid ${CC}44`:undefined,verticalAlign:"top",padding:"7px 9px"})}>{ta(f.key,f.ph,true)}</td>))}
                    {CONCLUDE_FIELDS.map((f,i)=>(<td key={f.key} style={cell({borderLeft:i===0?`2px solid ${CR}44`:undefined,verticalAlign:"top",padding:"7px 9px"})}>{ta(f.key,f.ph,true)}</td>))}
                    <td style={cell({padding:"7px 5px"})}>
                      <select value={rec.rating} onChange={e=>upd(s.id,"rating",e.target.value)} style={{width:"100%",background:rec.rating?RATING_COLORS[rec.rating]:"#1e293b",border:"1px solid #334155",borderRadius:6,color:"#fff",padding:"4px 5px",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif"}}>
                        <option value="">-</option>{RATING_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MONTHLY VIEW ─────────────────────────────────────────────
function MonthlyView({ operators, streamers, allWeeks, currentOpId }) {
  const myStreamers=streamers.filter(s=>s.opId===currentOpId&&!s.deleted&&!s.deleteRequested);
  const currentOp=operators.find(o=>o.id===currentOpId);
  const now=new Date();
  const [month,setMonth]=useState(`${now.getFullYear()}年${now.getMonth()+1}月`);
  const [weekData,setWeekData]=useState({});
  const [monthRec,setMonthRec]=useState({summary:{best:"",help:"",method:"",next:""},teamNote:{good:"",issue:""}});
  const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false);

  // weeks in this month
  const match=month.match(/(\d+)年(\d+)月/); const [,my,mm]=(match||[]).map(Number).concat([0,0]);
  const monthWeeks=allWeeks.filter(w=>{const mo=parseInt((w.split(" - ")[0]||"").split(".")[0]);return mo===mm;});

  useEffect(()=>{
    if(!monthWeeks.length||!currentOp) return;
    Promise.all(monthWeeks.map(w=>dbGet(getWeekKey(currentOpId,w)).then(d=>[w,d]))).then(res=>{const obj={};res.forEach(([w,d])=>{obj[w]=d;});setWeekData(obj);});
    dbGet(getMonthKey(currentOpId,month)).then(d=>{if(d)setMonthRec(d);});
  },[month,allWeeks.length,currentOpId]);

  const handleSaveMonth=async()=>{
    setSaving(true);
    await dbSet(getMonthKey(currentOpId,month),{...monthRec,savedAt:new Date().toISOString()});
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2200);
  };

  const avg=(recs,f)=>{const vs=recs.map(r=>parseFloat(r[f])||0).filter(v=>v>0);return vs.length?Math.round(vs.reduce((a,b)=>a+b)/vs.length):"-";};
  const sum=(recs,f)=>recs.map(r=>parseFloat(r[f])||0).reduce((a,b)=>a+b,0);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <MonthPicker value={month} onChange={setMonth}/>
        <span style={{color:"#334155",fontSize:12}}>共 {monthWeeks.length} 个周期</span>
        <button onClick={handleSaveMonth} disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",background:saved?"#10B981":"#6366F1",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",marginLeft:"auto"}}>
          <Ic n={saved?"check":"save"} s={13}/>{saving?"保存中...":saved?"已保存！":"保存月报"}
        </button>
      </div>

      {/* Team notes for month */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[{key:"good",l:"🔥 本月最值得复用的内容动作",c:"#10B981"},{key:"issue",l:"⚠️ 本月需集中解决的共性问题",c:"#F59E0B"}].map(({key,l,c})=>(
          <div key={key} style={{background:"#0f172a",borderRadius:10,padding:13,border:`1px solid ${c}33`}}>
            <div style={{color:c,fontSize:11,fontWeight:700,marginBottom:6}}>{l}</div>
            <textarea value={monthRec.teamNote?.[key]||""} onChange={e=>setMonthRec(p=>({...p,teamNote:{...p.teamNote,[key]:e.target.value}}))} placeholder="填写关键结论..." rows={2} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:12,resize:"none",outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/>
          </div>
        ))}
      </div>

      {/* Week index */}
      <div style={{background:"#0f172a",borderRadius:12,padding:18,marginBottom:14,border:"1px solid #1e293b"}}>
        <div style={{color:"#6366F1",fontWeight:700,fontSize:13,marginBottom:12}}>📋 本月各周索引</div>
        {monthWeeks.length===0?<div style={{color:"#334155",fontSize:13}}>本月暂无数据，请先完成周复盘</div>:monthWeeks.map(w=>{const d=weekData[w];return(<div key={w} style={{display:"grid",gridTemplateColumns:"165px 1fr 1fr",gap:10,padding:"10px 0",borderBottom:"1px solid #1e293b",alignItems:"start"}}>
          <div style={{color:"#6366F1",fontWeight:700,fontSize:12}}>{w}</div>
          <div><div style={{color:"#10B981",fontSize:11,marginBottom:3}}>本周亮点</div><div style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{d?.teamNote?.good||"暂未填写"}</div></div>
          <div><div style={{color:"#F59E0B",fontSize:11,marginBottom:3}}>共性问题</div><div style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{d?.teamNote?.issue||"暂未填写"}</div></div>
        </div>);})}
      </div>

      {/* Monthly data table */}
      {monthWeeks.length>0&&(<div style={{marginBottom:14,overflowX:"auto",borderRadius:11,border:"1px solid #1e293b"}}>
        <table style={{borderCollapse:"collapse",minWidth:650,width:"100%"}}>
          <thead>
            <tr><th style={TH("#0a1628","#64748B",{textAlign:"left",padding:"9px 11px",whiteSpace:"nowrap"})}>主播</th>{monthWeeks.map(w=>(<th key={w} colSpan={3} style={TH("#3B82F611","#93C5FD")}>{w}</th>))}<th colSpan={3} style={TH("#6366F122","#C4B5FD")}>月均/合计</th></tr>
            <tr><th style={TH("#060e1c","#334155",{textAlign:"left",padding:"5px 11px"})}></th>{monthWeeks.map(w=>["UV","ACU","粉增"].map(l=>(<th key={w+l} style={TH("#3B82F606","#475569",{fontSize:10})}>{l}</th>)))}{["月均UV","月均ACU","总粉增"].map(l=>(<th key={l} style={TH("#6366F108","#6366F1",{fontSize:10})}>{l}</th>))}</tr>
          </thead>
          <tbody>{myStreamers.map((s,i)=>{const bg=i%2===0?"#080f1e":"#0a1628";const recs=monthWeeks.map(w=>weekData[w]?.records?.[s.id]||EMPTY_REC());return(<tr key={s.id}><td style={{padding:"8px 11px",background:bg,color:"#f1f5f9",fontWeight:700,fontSize:12,border:"1px solid #0d1929",whiteSpace:"nowrap"}}>{s.name}</td>{monthWeeks.map(w=>{const r=weekData[w]?.records?.[s.id]||EMPTY_REC();return[r.uv,r.acu,r.fans].map((v,vi)=>(<td key={w+vi} style={{padding:"8px 7px",background:bg,color:v?"#93C5FD":"#1e293b",fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{v||"-"}</td>));})}<td style={{padding:"8px 7px",background:bg,color:"#C4B5FD",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{avg(recs,"uv")}</td><td style={{padding:"8px 7px",background:bg,color:"#C4B5FD",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{avg(recs,"acu")}</td><td style={{padding:"8px 7px",background:bg,color:"#6EE7B7",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{sum(recs,"fans")>0?`+${sum(recs,"fans")}`:"-"}</td></tr>);})}</tbody>
        </table>
      </div>)}

      {/* Monthly qualitative */}
      <div style={{background:"#0f172a",borderRadius:12,padding:18,border:"1px solid #1e293b"}}>
        <div style={{color:"#f1f5f9",fontWeight:700,fontSize:13,marginBottom:12}}>🔍 月度定性总结</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{k:"best",l:"🏆 本月表现最佳主播（前3）",c:"#10B981"},{k:"help",l:"⚠️ 本月需重点帮扶主播",c:"#EF4444"},{k:"method",l:"💡 本月内容方法论沉淀",c:"#8B5CF6"},{k:"next",l:"📋 下月核心运营方向",c:"#F59E0B"}].map(({k,l,c})=>(
            <div key={k} style={{border:`1px solid ${c}33`,borderRadius:10,padding:13}}>
              <div style={{color:c,fontSize:12,fontWeight:700,marginBottom:7}}>{l}</div>
              <textarea value={monthRec.summary?.[k]||""} onChange={e=>setMonthRec(p=>({...p,summary:{...p.summary,[k]:e.target.value}}))} placeholder="填写..." rows={4} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:12,resize:"none",outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
export default function App() {
  const [operators,setOperators]=useState(DEFAULT_OPERATORS);
  const [streamers,setStreamers]=useState(DEFAULT_STREAMERS);
  const [currentOpId,setCurrentOpId]=useState(DEFAULT_OPERATORS[0].id);
  const [tab,setTab]=useState("dashboard");
  const [selectedWeek,setSelectedWeek]=useState("");
  const [selectedMonth,setSelectedMonth]=useState(()=>{const d=new Date();return `${d.getFullYear()}年${d.getMonth()+1}月`;});
  const [allWeeks,setAllWeeks]=useState([]);
  const [showManage,setShowManage]=useState(false);
  const [showImport,setShowImport]=useState(false);
  const [showAdminLogin,setShowAdminLogin]=useState(false);
  const [isAdmin,setIsAdmin]=useState(false);
  const [booting,setBooting]=useState(true);

  // Logo long-press for admin
  const logoHoldTimer=useRef(null);
  const handleLogoPress=()=>{ logoHoldTimer.current=setTimeout(()=>{ if(!isAdmin)setShowAdminLogin(true); else{setIsAdmin(false);} },1500); };
  const handleLogoRelease=()=>{ if(logoHoldTimer.current)clearTimeout(logoHoldTimer.current); };

  useEffect(()=>{
    Promise.all([dbGet("__operators__"),dbGet("__streamers__"),dbGet("__weeks_idx__")]).then(([ops,strs,idx])=>{
      if(ops) setOperators(ops);
      if(strs) setStreamers(strs);
      if(idx?.list) setAllWeeks(idx.list);
      setBooting(false);
    });
  },[]);

  const currentOp=operators.find(o=>o.id===currentOpId)||operators[0];
  const myStreamers=streamers.filter(s=>s.opId===currentOpId);

  const handleWeekSelect=useCallback(async w=>{
    setSelectedWeek(w);
    if(!allWeeks.includes(w)){
      const next=[...allWeeks,w].sort((a,b)=>{const p=s=>{const[mo,dy]=(s.split(" - ")[0]||"").split(".");return parseInt(mo)*100+parseInt(dy);};return p(b)-p(a);});
      setAllWeeks(next); await dbSet("__weeks_idx__",{list:next});
    }
  },[allWeeks]);

  const handleSaveManage=async(ops,strs)=>{
    setOperators(ops);setStreamers(strs);
    await dbSet("__operators__",ops);await dbSet("__streamers__",strs);
    setShowManage(false);
    if(!ops.find(o=>o.id===currentOpId)) setCurrentOpId(ops[0]?.id||"");
  };

  const handleImport=async(rows,opId)=>{
    // Add streamers that don't exist yet
    const newStrs=[...streamers];
    const weekKey=selectedWeek?getWeekKey(opId,selectedWeek):null;
    let weekRec=weekKey?await dbGet(weekKey)||{records:{},teamNote:{good:"",issue:""}}:{records:{},teamNote:{good:"",issue:""}};

    rows.forEach(r=>{
      const exists=newStrs.find(s=>s.tid===r.tid||s.name===r.name);
      if(!exists){ newStrs.push({id:r.id,name:r.name,tid:r.tid,group:r.group,opId,deleted:false}); }
      const sid=exists?.id||r.id;
      if(weekKey){ weekRec.records[sid]=r._weekData; }
    });
    setStreamers(newStrs);
    await dbSet("__streamers__",newStrs);
    if(weekKey) await dbSet(weekKey,weekRec);
  };

  const pendingDeleteCount=streamers.filter(s=>s.deleteRequested).length;

  const TABS=[
    {key:"dashboard", l:"📊 数据面板"},
    {key:"weekly",    l:"📋 周复盘"},
    {key:"monthly",   l:"🗓️ 月复盘"},
    {key:"trend",     l:"📈 趋势"},
  ];

  if(booting)return(<div style={{minHeight:"100vh",background:"#020817",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:"#475569"}}><div style={{fontSize:40,marginBottom:16}}>⏳</div><div style={{fontSize:16,fontFamily:"'Noto Sans SC',sans-serif"}}>连接数据库中...</div></div></div>);

  return (
    <div style={{minHeight:"100vh",background:"#020817",fontFamily:"'Noto Sans SC',sans-serif",color:"#f1f5f9"}}>
      {showAdminLogin&&<AdminLoginModal onSuccess={()=>{setIsAdmin(true);setShowAdminLogin(false);}} onClose={()=>setShowAdminLogin(false)}/>}
      {showManage&&<ManageModal operators={operators} streamers={streamers} isAdmin={isAdmin} onClose={()=>setShowManage(false)} onSave={handleSaveManage}/>}
      {showImport&&<ImportModal operators={operators} currentOpId={currentOpId} onImport={handleImport} onClose={()=>setShowImport(false)}/>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)",borderBottom:"1px solid #1e293b",padding:"0 24px",position:"sticky",top:0,zIndex:50,boxShadow:"0 4px 24px rgba(0,0,0,0.45)"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,height:58,flexWrap:"wrap"}}>
          {/* Logo — long press to toggle admin */}
          <div onMouseDown={handleLogoPress} onMouseUp={handleLogoRelease} onMouseLeave={handleLogoRelease} onTouchStart={handleLogoPress} onTouchEnd={handleLogoRelease}
            style={{display:"flex",alignItems:"center",gap:9,flexShrink:0,cursor:"pointer",userSelect:"none"}}>
            <div style={{width:32,height:32,borderRadius:8,background:isAdmin?"linear-gradient(135deg,#7C3AED,#4F46E5)":"linear-gradient(135deg,#6366F1,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:"#fff",transition:"all .3s"}}>
              {isAdmin?<Ic n="shield" s={16}/>:"冰"}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:900,color:"#f1f5f9",letterSpacing:.5}}>三冰主播团队</div>
              <div style={{fontSize:10,color:isAdmin?"#A78BFA":"#475569",letterSpacing:1.5}}>{isAdmin?"管理员模式":"直播复盘系统"}</div>
            </div>
          </div>

          {/* Operator switcher */}
          <div style={{display:"flex",gap:3,padding:"3px",background:"#0f172a",borderRadius:9,border:"1px solid #1e293b",flexShrink:0}}>
            {operators.map(op=>(<button key={op.id} onClick={()=>setCurrentOpId(op.id)} style={{padding:"5px 16px",borderRadius:7,border:"none",fontFamily:"'Noto Sans SC',sans-serif",background:currentOpId===op.id?op.color:"transparent",color:currentOpId===op.id?"#fff":"#64748B",cursor:"pointer",fontSize:13,fontWeight:currentOpId===op.id?700:400,transition:"all .2s",whiteSpace:"nowrap"}}>{op.name}</button>))}
          </div>

          {/* Nav */}
          <div style={{display:"flex",gap:2,flex:1}}>
            {TABS.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"6px 16px",borderRadius:8,border:"none",background:tab===t.key?"#6366F1":"transparent",color:tab===t.key?"#fff":"#64748B",cursor:"pointer",fontSize:13,fontWeight:tab===t.key?700:400,fontFamily:"'Noto Sans SC',sans-serif",transition:"all .2s",whiteSpace:"nowrap"}}>{t.l}</button>))}
          </div>

          {/* Right controls */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {tab==="weekly"&&<WeekPicker value={selectedWeek} onChange={handleWeekSelect}/>}
            {tab==="monthly"&&<MonthPicker value={selectedMonth} onChange={setSelectedMonth}/>}
            <button onClick={()=>setShowImport(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif"}}>
              <Ic n="upload" s={13}/>导入
            </button>
            <button onClick={()=>setShowManage(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",background:pendingDeleteCount>0?"#7C3AED22":"#1e293b",border:`1px solid ${pendingDeleteCount>0?"#7C3AED":"#334155"}`,borderRadius:8,color:pendingDeleteCount>0?"#C4B5FD":"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif"}}>
              <Ic n="settings" s={13}/>管理{pendingDeleteCount>0&&<span style={{background:"#EF4444",color:"#fff",borderRadius:10,fontSize:10,padding:"0 5px",fontWeight:700}}>{pendingDeleteCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"18px 24px",maxWidth:1900,margin:"0 auto"}}>
        {tab==="dashboard"&&<Dashboard operators={operators} streamers={streamers.filter(s=>!s.deleted&&!s.deleteRequested)} allWeeks={allWeeks}/>}
        {tab==="weekly"&&<WeeklyView weekKey={selectedWeek?getWeekKey(currentOpId,selectedWeek):null} myStreamers={myStreamers}/>}
        {tab==="monthly"&&<MonthlyView operators={operators} streamers={streamers} allWeeks={allWeeks} currentOpId={currentOpId}/>}
        {tab==="trend"&&<TrendPlaceholder/>}
      </div>
    </div>
  );
}

function TrendPlaceholder() {
  return (<div style={{textAlign:"center",padding:"80px 0",color:"#334155"}}><div style={{fontSize:40,marginBottom:12}}>📈</div><div style={{fontSize:15,fontWeight:600,color:"#475569"}}>趋势分析</div><div style={{fontSize:13,marginTop:8,color:"#334155"}}>切换到「周复盘」积累几周数据后，趋势图将自动呈现</div></div>);
}
