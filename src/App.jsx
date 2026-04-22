import { useState, useEffect, useCallback, useRef } from "react";

// ─── LOCAL STORAGE (替代 window.storage，本地+多人共享用 localStorage) ──
const LS = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } },
};

// ─── DEFAULT DATA ──────────────────────────────────────────────
const DEFAULT_OPERATORS = [
  { id: "op_songshuai", name: "宋帅",  color: "#6366F1" },
  { id: "op_fubaikun",  name: "付百坤", color: "#10B981" },
];
const DEFAULT_GROUPS = ["合作", "公会", "重点跟播"];
const GROUP_COLORS   = { "合作": "#6366F1", "公会": "#10B981", "重点跟播": "#F59E0B" };
const DEFAULT_STREAMERS = [
  { id:"s1",  name:"天才小梨",      tid:"weibaweiba1231", group:"合作",     opId:"op_songshuai" },
  { id:"s2",  name:"最强零氪",      tid:"dycf491036",     group:"合作",     opId:"op_songshuai" },
  { id:"s3",  name:"什刹海",        tid:"46380510043",    group:"合作",     opId:"op_fubaikun"  },
  { id:"s4",  name:"风",            tid:"too7060",        group:"合作",     opId:"op_fubaikun"  },
  { id:"s5",  name:"懒大王",        tid:"mmm_714",        group:"合作",     opId:"op_songshuai" },
  { id:"s6",  name:"蛋蛋",          tid:"79028547988",    group:"公会",     opId:"op_songshuai" },
  { id:"s7",  name:"咕噜噜",        tid:"40380793848",    group:"公会",     opId:"op_songshuai" },
  { id:"s8",  name:"须尽欢",        tid:"sanbingmq",      group:"公会",     opId:"op_fubaikun"  },
  { id:"s9",  name:"狂欢泡泡",      tid:"aaa..ss",        group:"公会",     opId:"op_fubaikun"  },
  { id:"s10", name:"小奶龙波波",    tid:"31459088643",    group:"公会",     opId:"op_songshuai" },
  { id:"s11", name:"车厘子",        tid:"view_0728",      group:"公会",     opId:"op_fubaikun"  },
  { id:"s12", name:"三冰龙三",      tid:"948083399",      group:"公会",     opId:"op_songshuai" },
  { id:"s13", name:"三冰猛男",      tid:"67005932855",    group:"公会",     opId:"op_fubaikun"  },
  { id:"s14", name:"闲游虾仁",      tid:"iii66856",       group:"公会",     opId:"op_songshuai" },
  { id:"s15", name:"国冰河时代ma",  tid:"91443873441",    group:"公会",     opId:"op_fubaikun"  },
  { id:"s16", name:"国冰河时代劝",  tid:"130134487",      group:"公会",     opId:"op_songshuai" },
  { id:"s17", name:"小板凳",        tid:"yxswi",          group:"公会",     opId:"op_fubaikun"  },
  { id:"s18", name:"三国冰河时",    tid:"574022932",      group:"公会",     opId:"op_songshuai" },
  { id:"s19", name:"4Uoik",         tid:"74589263266",    group:"公会",     opId:"op_fubaikun"  },
  { id:"s20", name:"Z+è",           tid:"e_quation",      group:"公会",     opId:"op_songshuai" },
  { id:"s21", name:"冰河时代最胖",  tid:"2171606548",     group:"公会",     opId:"op_fubaikun"  },
  { id:"s22", name:"小风车",        tid:"81963397842",    group:"公会",     opId:"op_songshuai" },
  { id:"s23", name:"国冰河时代爱马",tid:"68212721935",    group:"公会",     opId:"op_fubaikun"  },
  { id:"s24", name:"无所畏惧",      tid:"Y2321692395",    group:"重点跟播", opId:"op_songshuai" },
  { id:"s25", name:"三国冰河时星",  tid:"65600732710",    group:"重点跟播", opId:"op_fubaikun"  },
  { id:"s26", name:"唐八苦",        tid:"xx789879xx",     group:"重点跟播", opId:"op_songshuai" },
  { id:"s27", name:"莉丝逆战未来",  tid:"czm775201314",   group:"重点跟播", opId:"op_fubaikun"  },
  { id:"s28", name:"国冰河时代梦",  tid:"38305562956",    group:"重点跟播", opId:"op_songshuai" },
  { id:"s29", name:"北辰星",        tid:"189378733",      group:"重点跟播", opId:"op_fubaikun"  },
  { id:"s30", name:"三冰大帅",      tid:"40180886324",    group:"重点跟播", opId:"op_songshuai" },
  { id:"s31", name:"凤",            tid:"27915685786",    group:"重点跟播", opId:"op_fubaikun"  },
];

const RATING_OPTIONS = ["S","A+","A","B+","B","C+","C","D"];
const RATING_COLORS  = { S:"#7C3AED","A+":"#2563EB",A:"#0891B2","B+":"#059669",B:"#65A30D","C+":"#D97706",C:"#EA580C",D:"#DC2626" };

const DATA_FIELDS = [
  { key:"exposure", short:"曝光",         w:75, ph:"0" },
  { key:"uv",       short:"UV\n(场观)",   w:75, ph:"0" },
  { key:"acu",      short:"ACU\n均在线",  w:75, ph:"0" },
  { key:"peak",     short:"峰值\n在线",   w:75, ph:"0" },
  { key:"stay",     short:"停留\n时长(s)",w:75, ph:"0" },
  { key:"interact", short:"互动率\n%",    w:68, ph:"0" },
  { key:"fans",     short:"粉丝\n净增",   w:68, ph:"0" },
];
const CONTENT_FIELDS = [
  { key:"script",   label:"话术要点",  w:160, ph:"有效话术 / 需改进的..." },
  { key:"bgm",      label:"BGM&节奏",  w:140, ph:"本周用了什么 / 下周换..." },
  { key:"hotspot",  label:"热点追踪",  w:150, ph:"追了哪个热点 / 效果..." },
  { key:"activity", label:"活动执行",  w:150, ph:"活动节点 / 配合情况..." },
];
const CONCLUDE_FIELDS = [
  { key:"highlight",label:"本周亮点",   w:155, ph:"做对了什么..." },
  { key:"problem",  label:"待解决问题", w:155, ph:"最优先1条..." },
  { key:"nextplan", label:"下周方向",   w:145, ph:"重点要做的..." },
];

const EMPTY_REC = () => ({
  exposure:"",uv:"",acu:"",peak:"",stay:"",interact:"",fans:"",
  script:"",bgm:"",hotspot:"",activity:"",highlight:"",problem:"",nextplan:"",rating:""
});

const getWeekKey = (opId, w) => `wr_${opId}_${w.replace(/[\s.\-]/g,"_")}`;
const getIdxKey  = () => `__weeks_idx__`;

// ─── ICONS ────────────────────────────────────────────────────
const PATHS = {
  calendar:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  plus:"M12 4v16m8-8H4", x:"M6 18L18 6M6 6l12 12", check:"M5 13l4 4L19 7",
  save:"M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
  settings:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  trend:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  report:"M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};
const Ic = ({ n, s=16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {PATHS[n].split(" M").map((seg,i)=><path key={i} d={i===0?seg:"M"+seg}/>)}
  </svg>
);

// ─── WEEK PICKER ──────────────────────────────────────────────
function WeekPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const now = new Date();
  const [ym, setYm] = useState(`${now.getFullYear()}-${now.getMonth()+1}`);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const [y,m] = ym.split("-").map(Number);
  const weeks = (() => {
    const arr = []; let cur = new Date(y,m-1,1);
    while (cur.getDay()!==1) cur.setDate(cur.getDate()-1);
    const last = new Date(y,m,0);
    while (cur<=last) {
      const end = new Date(cur); end.setDate(end.getDate()+6);
      const f = d=>`${d.getMonth()+1}.${String(d.getDate()).padStart(2,"0")}`;
      arr.push(`${f(cur)} - ${f(end)}`);
      cur.setDate(cur.getDate()+7);
    }
    return arr;
  })();
  const shift = n => { const d=new Date(y,m-1+n,1); setYm(`${d.getFullYear()}-${d.getMonth()+1}`); };
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",background:value?"#1e293b":"#334155",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",whiteSpace:"nowrap"}}>
        <Ic n="calendar" s={13}/>{value||"选择周期"}
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:300,background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:14,minWidth:230,boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <button onClick={()=>shift(-1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>‹</button>
            <span style={{color:"#f1f5f9",fontWeight:700,fontSize:13}}>{y}年{m}月</span>
            <button onClick={()=>shift(1)}  style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>›</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {weeks.map(w=>(
              <button key={w} onClick={()=>{onChange(w);setOpen(false);}} style={{padding:"7px 11px",background:value===w?"#6366F1":"#0f172a",border:`1px solid ${value===w?"#6366F1":"#334155"}`,borderRadius:6,color:"#f1f5f9",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif",transition:"all .12s"}}>{w}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MANAGE MODAL ─────────────────────────────────────────────
function ManageModal({ operators, streamers, onClose, onSave }) {
  const [ops,setOps]   = useState(JSON.parse(JSON.stringify(operators)));
  const [strs,setStrs] = useState(JSON.parse(JSON.stringify(streamers)));
  const [tab,setTab]   = useState("ops");
  const [newOp,setNewOp]   = useState({name:"",color:"#6366F1"});
  const [newStr,setNewStr] = useState({name:"",tid:"",group:DEFAULT_GROUPS[0],opId:operators[0]?.id||""});
  const PALETTE=["#6366F1","#10B981","#F59E0B","#EC4899","#14B8A6","#F97316","#8B5CF6","#EF4444","#0EA5E9","#84CC16"];
  const inp=(ex={})=>({background:"#1e293b",border:"1px solid #334155",borderRadius:7,color:"#f1f5f9",padding:"7px 11px",fontSize:13,outline:"none",fontFamily:"'Noto Sans SC',sans-serif",...ex});
  const btn=(bg,ex={})=>({padding:"8px 16px",background:bg,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif",display:"flex",alignItems:"center",gap:6,...ex});
  const addOp=()=>{if(!newOp.name.trim())return;const id="op_"+Date.now();setOps(p=>[...p,{id,name:newOp.name.trim(),color:newOp.color}]);setNewOp({name:"",color:"#6366F1"});};
  const delOp=id=>{setOps(p=>p.filter(o=>o.id!==id));setStrs(p=>p.map(s=>s.opId===id?{...s,opId:""}:s));};
  const addStr=()=>{if(!newStr.name.trim())return;const id="s_"+Date.now();setStrs(p=>[...p,{id,...newStr,name:newStr.name.trim(),tid:newStr.tid.trim()}]);setNewStr(p=>({...p,name:"",tid:""}));};
  const delStr=id=>setStrs(p=>p.filter(s=>s.id!==id));
  const updStr=(id,f,v)=>setStrs(p=>p.map(s=>s.id===id?{...s,[f]:v}:s));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,width:"min(880px,94vw)",maxHeight:"87vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <span style={{color:"#f1f5f9",fontWeight:800,fontSize:15}}>⚙️ 管理运营 & 主播</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer"}}><Ic n="x" s={19}/></button>
        </div>
        <div style={{display:"flex",padding:"0 22px",borderBottom:"1px solid #1e293b",flexShrink:0}}>
          {[["ops","👤 运营管理"],["strs","🎮 主播管理"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:"11px 18px",background:"none",border:"none",borderBottom:`2px solid ${tab===k?"#6366F1":"transparent"}`,color:tab===k?"#6366F1":"#64748B",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif"}}>{l}</button>
          ))}
        </div>
        <div style={{overflowY:"auto",padding:22,flex:1}}>
          {tab==="ops"&&(
            <div>
              <div style={{display:"flex",gap:8,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
                <input value={newOp.name} onChange={e=>setNewOp(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addOp()} placeholder="运营姓名" style={{...inp(),flex:"1 1 120px"}}/>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{PALETTE.map(c=>(<button key={c} onClick={()=>setNewOp(p=>({...p,color:c}))} style={{width:22,height:22,borderRadius:5,background:c,cursor:"pointer",border:`2px solid ${newOp.color===c?"#fff":"transparent"}`}}/>))}</div>
                <button onClick={addOp} style={btn("#6366F1")}><Ic n="plus" s={13}/>添加运营</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {ops.map(op=>(
                  <div key={op.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 15px",background:"#1e293b",borderRadius:10,border:`1px solid ${op.color}44`}}>
                    <div style={{width:11,height:11,borderRadius:3,background:op.color,flexShrink:0}}/>
                    <span style={{color:"#f1f5f9",fontWeight:700,flex:1,fontSize:14}}>{op.name}</span>
                    <span style={{color:"#475569",fontSize:12}}>{strs.filter(s=>s.opId===op.id).length} 个主播</span>
                    <button onClick={()=>delOp(op.id)} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer"}}><Ic n="trash" s={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="strs"&&(
            <div>
              <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
                <input value={newStr.name} onChange={e=>setNewStr(p=>({...p,name:e.target.value}))} placeholder="主播昵称" style={{...inp(),width:110}}/>
                <input value={newStr.tid}  onChange={e=>setNewStr(p=>({...p,tid:e.target.value}))}  placeholder="抖音ID"   style={{...inp(),width:140}}/>
                <select value={newStr.group} onChange={e=>setNewStr(p=>({...p,group:e.target.value}))} style={inp()}>{DEFAULT_GROUPS.map(g=><option key={g}>{g}</option>)}</select>
                <select value={newStr.opId}  onChange={e=>setNewStr(p=>({...p,opId:e.target.value}))}  style={inp()}><option value="">未分配</option>{ops.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
                <button onClick={addStr} style={btn("#6366F1")}><Ic n="plus" s={13}/>添加主播</button>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
                  <thead><tr>{["昵称","抖音ID","分组","归属运营",""].map(h=>(<th key={h} style={{padding:"8px 11px",background:"#1e293b",color:"#64748B",fontSize:11,fontWeight:700,textAlign:"left",borderBottom:"1px solid #334155"}}>{h}</th>))}</tr></thead>
                  <tbody>
                    {strs.map((s,i)=>{
                      const op=ops.find(o=>o.id===s.opId);
                      const bg=i%2===0?"#0a1628":"#080f1e";
                      const td={padding:"8px 11px",background:bg,borderBottom:"1px solid #0d1929"};
                      return (
                        <tr key={s.id}>
                          <td style={{...td,color:"#f1f5f9",fontWeight:700,fontSize:12}}>{s.name}</td>
                          <td style={{...td,color:"#64748B",fontSize:11}}>{s.tid}</td>
                          <td style={td}><select value={s.group} onChange={e=>updStr(s.id,"group",e.target.value)} style={{...inp({padding:"4px 8px",fontSize:12})}}>{DEFAULT_GROUPS.map(g=><option key={g}>{g}</option>)}</select></td>
                          <td style={td}><select value={s.opId}  onChange={e=>updStr(s.id,"opId",e.target.value)}  style={{...inp({padding:"4px 8px",fontSize:12,borderColor:op?.color||"#334155"})}}><option value="">未分配</option>{ops.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></td>
                          <td style={td}><button onClick={()=>delStr(s.id)} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer"}}><Ic n="trash" s={13}/></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

// ─── WEEKLY VIEW ──────────────────────────────────────────────
function WeeklyView({ weekKey, myStreamers }) {
  const [data,setData]         = useState({});
  const [teamNote,setTeamNote] = useState({good:"",issue:""});
  const [saving,setSaving]     = useState(false);
  const [saved,setSaved]       = useState(false);

  useEffect(()=>{
    if(!weekKey) return;
    setData({}); setTeamNote({good:"",issue:""});
    const d = LS.get(weekKey);
    if(d){ setData(d.records||{}); setTeamNote(d.teamNote||{good:"",issue:""}); }
  },[weekKey]);

  const upd=(sid,f,v)=>setData(p=>({...p,[sid]:{...(p[sid]||EMPTY_REC()),[f]:v}}));
  const handleSave=()=>{
    if(!weekKey) return;
    setSaving(true);
    LS.set(weekKey,{records:data,teamNote,savedAt:new Date().toISOString()});
    setTimeout(()=>{ setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2200); },300);
  };

  const grouped=DEFAULT_GROUPS.map(g=>({group:g,members:myStreamers.filter(s=>s.group===g)})).filter(g=>g.members.length>0);
  const CD="#3B82F6",CC="#10B981",CR="#8B5CF6";

  if(!weekKey) return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:380,color:"#334155"}}><div style={{textAlign:"center"}}><div style={{fontSize:46,marginBottom:12}}>📅</div><div style={{fontSize:17,fontWeight:700,color:"#475569",marginBottom:6}}>请先选择复盘周期</div><div style={{fontSize:13}}>在顶部日历中选择本周日期范围</div></div></div>);
  if(myStreamers.length===0) return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:280,color:"#334155"}}><div style={{textAlign:"center"}}><div style={{fontSize:38,marginBottom:10}}>🎮</div><div style={{fontSize:14,fontWeight:700,color:"#475569",marginBottom:4}}>当前运营暂无归属主播</div><div style={{fontSize:12}}>在右上角「管理」中为该运营分配主播</div></div></div>);

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
              <th colSpan={DATA_FIELDS.length}    style={TH(CD+"22",CD,{borderLeft:`2px solid ${CD}`})}>📊 核心数据</th>
              <th colSpan={CONTENT_FIELDS.length} style={TH(CC+"22",CC,{borderLeft:`2px solid ${CC}`})}>🎙️ 内容复盘</th>
              <th colSpan={CONCLUDE_FIELDS.length}style={TH(CR+"22",CR,{borderLeft:`2px solid ${CR}`})}>🔍 结论 & 计划</th>
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
                const rec=data[s.id]||EMPTY_REC();
                const bg=mi%2===0?"#080f1e":"#0a1628";
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

// ─── MONTHLY REPORT ───────────────────────────────────────────
function MonthlyReport({ currentOp, streamers, allWeeks }) {
  const myStreamers=streamers.filter(s=>s.opId===currentOp?.id);
  const [month,setMonth]=useState(()=>{const d=new Date();return `${d.getFullYear()}年${d.getMonth()+1}月`;});
  const [weekData,setWeekData]=useState({});
  const [summary,setSummary]=useState({best:"",help:"",method:"",next:""});
  const match=month.match(/(\d+)年(\d+)月/);
  const [,y,m]=(match||[]).map(Number).concat([0,0]);
  const monthWeeks=allWeeks.filter(w=>{const mo=parseInt((w.split(" - ")[0]||"").split(".")[0]);return mo===m;});
  useEffect(()=>{
    if(!monthWeeks.length||!currentOp) return;
    const obj={};
    monthWeeks.forEach(w=>{const d=LS.get(getWeekKey(currentOp.id,w));obj[w]=d;});
    setWeekData(obj);
  },[month,allWeeks.length,currentOp?.id]);
  const MONTHS=Array.from({length:12},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-i);return `${d.getFullYear()}年${d.getMonth()+1}月`;});
  const avg=(recs,field)=>{const vs=recs.map(r=>parseFloat(r[field])||0).filter(v=>v>0);return vs.length?Math.round(vs.reduce((a,b)=>a+b)/vs.length):"-";};
  const sum=(recs,field)=>recs.map(r=>parseFloat(r[field])||0).reduce((a,b)=>a+b,0);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <span style={{color:"#94a3b8",fontSize:13}}>月份：</span>
        <select value={month} onChange={e=>setMonth(e.target.value)} style={{background:"#1e293b",border:"1px solid #334155",color:"#f1f5f9",padding:"7px 13px",borderRadius:8,fontSize:13,fontFamily:"'Noto Sans SC',sans-serif"}}>{MONTHS.map(mo=><option key={mo}>{mo}</option>)}</select>
        <span style={{color:"#334155",fontSize:12}}>共 {monthWeeks.length} 个周期</span>
      </div>
      <div style={{background:"#0f172a",borderRadius:12,padding:18,marginBottom:14,border:"1px solid #1e293b"}}>
        <div style={{color:"#6366F1",fontWeight:700,fontSize:13,marginBottom:12}}>📋 本月各周索引</div>
        {monthWeeks.length===0?<div style={{color:"#334155",fontSize:13}}>本月暂无数据，请先完成周复盘</div>:monthWeeks.map(w=>{
          const d=weekData[w];
          return (<div key={w} style={{display:"grid",gridTemplateColumns:"165px 1fr 1fr",gap:10,padding:"10px 0",borderBottom:"1px solid #1e293b",alignItems:"start"}}>
            <div style={{color:"#6366F1",fontWeight:700,fontSize:12}}>{w}</div>
            <div><div style={{color:"#10B981",fontSize:11,marginBottom:3}}>本周亮点</div><div style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{d?.teamNote?.good||"暂未填写"}</div></div>
            <div><div style={{color:"#F59E0B",fontSize:11,marginBottom:3}}>共性问题</div><div style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{d?.teamNote?.issue||"暂未填写"}</div></div>
          </div>);
        })}
      </div>
      {monthWeeks.length>0&&(
        <div style={{marginBottom:14,overflowX:"auto",borderRadius:11,border:"1px solid #1e293b"}}>
          <table style={{borderCollapse:"collapse",minWidth:650,width:"100%"}}>
            <thead>
              <tr><th style={TH("#0a1628","#64748B",{textAlign:"left",padding:"9px 11px",whiteSpace:"nowrap"})}>主播</th>{monthWeeks.map(w=>(<th key={w} colSpan={3} style={TH("#3B82F611","#93C5FD")}>{w}</th>))}<th colSpan={3} style={TH("#6366F122","#C4B5FD")}>月均/合计</th></tr>
              <tr><th style={TH("#060e1c","#334155",{textAlign:"left",padding:"5px 11px"})}></th>{monthWeeks.map(w=>["UV","ACU","粉增"].map(l=>(<th key={w+l} style={TH("#3B82F606","#475569",{fontSize:10})}>{l}</th>)))}{["月均UV","月均ACU","总粉增"].map(l=>(<th key={l} style={TH("#6366F108","#6366F1",{fontSize:10})}>{l}</th>))}</tr>
            </thead>
            <tbody>
              {myStreamers.map((s,i)=>{
                const bg=i%2===0?"#080f1e":"#0a1628";
                const recs=monthWeeks.map(w=>weekData[w]?.records?.[s.id]||EMPTY_REC());
                return (<tr key={s.id}>
                  <td style={{padding:"8px 11px",background:bg,color:"#f1f5f9",fontWeight:700,fontSize:12,border:"1px solid #0d1929",whiteSpace:"nowrap"}}>{s.name}</td>
                  {monthWeeks.map(w=>{const r=weekData[w]?.records?.[s.id]||EMPTY_REC();return [r.uv,r.acu,r.fans].map((v,vi)=>(<td key={w+vi} style={{padding:"8px 7px",background:bg,color:v?"#93C5FD":"#1e293b",fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{v||"-"}</td>));})}
                  <td style={{padding:"8px 7px",background:bg,color:"#C4B5FD",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{avg(recs,"uv")}</td>
                  <td style={{padding:"8px 7px",background:bg,color:"#C4B5FD",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{avg(recs,"acu")}</td>
                  <td style={{padding:"8px 7px",background:bg,color:"#6EE7B7",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{sum(recs,"fans")>0?`+${sum(recs,"fans")}`:"-"}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{background:"#0f172a",borderRadius:12,padding:18,border:"1px solid #1e293b"}}>
        <div style={{color:"#f1f5f9",fontWeight:700,fontSize:13,marginBottom:12}}>🔍 月度定性总结</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{k:"best",l:"🏆 本月表现最佳主播（前3）",c:"#10B981"},{k:"help",l:"⚠️ 本月需重点帮扶主播",c:"#EF4444"},{k:"method",l:"💡 本月内容方法论沉淀",c:"#8B5CF6"},{k:"next",l:"📋 下月核心运营方向",c:"#F59E0B"}].map(({k,l,c})=>(
            <div key={k} style={{border:`1px solid ${c}33`,borderRadius:10,padding:13}}>
              <div style={{color:c,fontSize:12,fontWeight:700,marginBottom:7}}>{l}</div>
              <textarea value={summary[k]} onChange={e=>setSummary(p=>({...p,[k]:e.target.value}))} placeholder="填写..." rows={4} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:12,resize:"none",outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TREND VIEW ───────────────────────────────────────────────
function TrendView({ currentOp, streamers, allWeeks }) {
  const myStreamers=streamers.filter(s=>s.opId===currentOp?.id);
  const [sel,setSel]=useState(null);
  const [tdata,setTdata]=useState({});
  const recent=[...allWeeks].slice(0,8).reverse();
  useEffect(()=>{
    if(!recent.length||!currentOp) return;
    const obj={};
    recent.forEach(w=>{const d=LS.get(getWeekKey(currentOp.id,w));obj[w]=d;});
    setTdata(obj);
  },[allWeeks.length,currentOp?.id]);
  const s=sel?myStreamers.find(x=>x.id===sel):null;
  const gv=(w,f)=>{const r=tdata[w]?.records?.[sel];if(!r)return null;const v=parseFloat(r[f]);return isNaN(v)?null:v;};
  const Spark=({field,color,label})=>{
    const vals=recent.map(w=>gv(w,field));
    const nn=vals.filter(v=>v!==null);
    if(nn.length<2) return <div style={{color:"#334155",fontSize:12,padding:"16px 0"}}>数据不足（≥2周）</div>;
    const mx=Math.max(...nn),mn=Math.min(...nn),rng=mx-mn||1;
    const W=210,H=54;
    const pts=vals.map((v,i)=>v!==null?{x:(i/(vals.length-1))*W,y:H-((v-mn)/rng)*(H-10)-5}:null).filter(Boolean);
    const pd=pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const last=nn[nn.length-1],prev=nn[nn.length-2],d=last-prev;
    return (
      <div style={{background:"#080f1e",borderRadius:10,padding:14,border:`1px solid ${color}22`}}>
        <div style={{color,fontSize:11,fontWeight:700,marginBottom:8}}>{label}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:9}}>
          <span style={{fontSize:21,fontWeight:900,color}}>{last.toLocaleString()}</span>
          <span style={{fontSize:12,color:d>=0?"#10B981":"#EF4444",fontWeight:700}}>{d>=0?"▲":"▼"}{Math.abs(d).toLocaleString()}</span>
        </div>
        <svg width={W} height={H} style={{overflow:"visible"}}>
          <defs><linearGradient id={`g${field}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.22}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
          <path d={`${pd} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`} fill={`url(#g${field})`}/>
          <path d={pd} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={2.8} fill={color}/>)}
        </svg>
      </div>
    );
  };
  const grouped=DEFAULT_GROUPS.map(g=>({group:g,members:myStreamers.filter(s=>s.group===g)})).filter(g=>g.members.length>0);
  return (
    <div>
      <div style={{marginBottom:18}}>
        <div style={{color:"#94a3b8",fontSize:13,marginBottom:10}}>选择主播查看近8周趋势</div>
        {grouped.map(({group,members})=>{const gc=GROUP_COLORS[group]||"#6366F1";return(
          <div key={group} style={{marginBottom:12}}>
            <div style={{color:gc,fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:1}}>{group}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {members.map(m=>(<button key={m.id} onClick={()=>setSel(m.id===sel?null:m.id)} style={{padding:"5px 12px",borderRadius:18,cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif",transition:"all .15s",background:sel===m.id?gc:"#1e293b",border:`1px solid ${sel===m.id?gc:"#334155"}`,color:sel===m.id?"#fff":"#94a3b8"}}>{m.name}</button>))}
            </div>
          </div>
        );})}
      </div>
      {s&&(
        <div style={{background:"#0f172a",borderRadius:12,padding:22,border:`1px solid ${GROUP_COLORS[s.group]||"#6366F1"}44`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{background:GROUP_COLORS[s.group],color:"#fff",padding:"3px 11px",borderRadius:18,fontSize:12,fontWeight:700}}>{s.group}</div>
            <div style={{color:"#f1f5f9",fontWeight:800,fontSize:16}}>{s.name}</div>
            <div style={{color:"#475569",fontSize:12}}>{s.tid}</div>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
            {recent.map((w,i)=>(<div key={w} style={{background:"#1e293b",borderRadius:5,padding:"3px 9px",whiteSpace:"nowrap",color:i===recent.length-1?"#6366F1":"#475569",fontSize:11,fontWeight:i===recent.length-1?700:400,border:`1px solid ${i===recent.length-1?"#6366F1":"transparent"}`}}>{w}</div>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
            <Spark field="exposure" color="#A855F7" label="曝光"/>
            <Spark field="uv"       color="#6366F1" label="UV（场观）"/>
            <Spark field="acu"      color="#10B981" label="ACU"/>
            <Spark field="fans"     color="#EC4899" label="粉丝净增"/>
          </div>
          <div>
            <div style={{color:"#94a3b8",fontSize:13,fontWeight:700,marginBottom:10}}>近期复盘记录</div>
            {recent.slice(-4).reverse().map(w=>{const r=tdata[w]?.records?.[sel];if(!r||(!(r.highlight||r.problem||r.nextplan)))return null;return(
              <div key={w} style={{background:"#080f1e",borderRadius:8,padding:11,marginBottom:7,border:"1px solid #1e293b"}}>
                <div style={{color:"#6366F1",fontSize:12,fontWeight:700,marginBottom:7}}>{w}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[{l:"亮点",v:r.highlight,c:"#10B981"},{l:"问题",v:r.problem,c:"#F59E0B"},{l:"下周方向",v:r.nextplan,c:"#8B5CF6"}].map(({l,v,c})=>v&&(<div key={l}><div style={{color:c,fontSize:11,marginBottom:3}}>{l}</div><div style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{v}</div></div>))}
                </div>
              </div>
            );}).filter(Boolean)}
          </div>
        </div>
      )}
      {!sel&&(<div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}><div style={{fontSize:38,marginBottom:10}}>📈</div><div style={{fontSize:14,fontWeight:600}}>选择主播查看成长趋势</div></div>)}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
export default function App() {
  const [operators,setOperators]       = useState(()=>LS.get("__operators__")||DEFAULT_OPERATORS);
  const [streamers,setStreamers]       = useState(()=>LS.get("__streamers__")||DEFAULT_STREAMERS);
  const [currentOpId,setCurrentOpId]  = useState(()=>(LS.get("__operators__")||DEFAULT_OPERATORS)[0].id);
  const [tab,setTab]                   = useState("weekly");
  const [selectedWeek,setSelectedWeek]= useState("");
  const [allWeeks,setAllWeeks]         = useState(()=>LS.get(getIdxKey())?.list||[]);
  const [showManage,setShowManage]     = useState(false);

  const currentOp=operators.find(o=>o.id===currentOpId)||operators[0];
  const myStreamers=streamers.filter(s=>s.opId===currentOpId);

  const handleWeekSelect=useCallback(w=>{
    setSelectedWeek(w);
    if(!allWeeks.includes(w)){
      const next=[...allWeeks,w].sort((a,b)=>{const p=s=>{const[mo,dy]=(s.split(" - ")[0]||"").split(".");return parseInt(mo)*100+parseInt(dy);};return p(b)-p(a);});
      setAllWeeks(next);
      LS.set(getIdxKey(),{list:next});
    }
  },[allWeeks]);

  const handleSaveManage=(ops,strs)=>{
    setOperators(ops); setStreamers(strs);
    LS.set("__operators__",ops); LS.set("__streamers__",strs);
    setShowManage(false);
    if(!ops.find(o=>o.id===currentOpId)) setCurrentOpId(ops[0]?.id||"");
  };

  const TABS=[{key:"weekly",l:"📋 本周复盘"},{key:"monthly",l:"📊 月度汇报"},{key:"trend",l:"📈 数据趋势"}];

  return (
    <div style={{minHeight:"100vh",background:"#020817",fontFamily:"'Noto Sans SC',sans-serif",color:"#f1f5f9"}}>
      {showManage&&<ManageModal operators={operators} streamers={streamers} onClose={()=>setShowManage(false)} onSave={handleSaveManage}/>}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)",borderBottom:"1px solid #1e293b",padding:"0 24px",position:"sticky",top:0,zIndex:50,boxShadow:"0 4px 24px rgba(0,0,0,0.45)"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,height:58,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#6366F1,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:"#fff"}}>冰</div>
            <div><div style={{fontSize:13,fontWeight:900,color:"#f1f5f9",letterSpacing:.5}}>三冰主播团队</div><div style={{fontSize:10,color:"#475569",letterSpacing:1.5}}>直播复盘系统</div></div>
          </div>
          <div style={{display:"flex",gap:3,padding:"3px",background:"#0f172a",borderRadius:9,border:"1px solid #1e293b",flexShrink:0}}>
            {operators.map(op=>(<button key={op.id} onClick={()=>setCurrentOpId(op.id)} style={{padding:"5px 16px",borderRadius:7,border:"none",fontFamily:"'Noto Sans SC',sans-serif",background:currentOpId===op.id?op.color:"transparent",color:currentOpId===op.id?"#fff":"#64748B",cursor:"pointer",fontSize:13,fontWeight:currentOpId===op.id?700:400,transition:"all .2s",whiteSpace:"nowrap"}}>{op.name}</button>))}
          </div>
          <div style={{display:"flex",gap:2,flex:1}}>
            {TABS.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"6px 16px",borderRadius:8,border:"none",background:tab===t.key?"#6366F1":"transparent",color:tab===t.key?"#fff":"#64748B",cursor:"pointer",fontSize:13,fontWeight:tab===t.key?700:400,fontFamily:"'Noto Sans SC',sans-serif",transition:"all .2s",whiteSpace:"nowrap"}}>{t.l}</button>))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {tab==="weekly"&&<WeekPicker value={selectedWeek} onChange={handleWeekSelect}/>}
            <button onClick={()=>setShowManage(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif"}}><Ic n="settings" s={13}/>管理</button>
          </div>
        </div>
      </div>
      <div style={{padding:"18px 24px",maxWidth:1900,margin:"0 auto"}}>
        {tab==="weekly"&&<WeeklyView weekKey={selectedWeek?getWeekKey(currentOpId,selectedWeek):null} myStreamers={myStreamers}/>}
        {tab==="monthly"&&<MonthlyReport currentOp={currentOp} streamers={streamers} allWeeks={allWeeks}/>}
        {tab==="trend"&&<TrendView currentOp={currentOp} streamers={streamers} allWeeks={allWeeks}/>}
      </div>
    </div>
  );
}
