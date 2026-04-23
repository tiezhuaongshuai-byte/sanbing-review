import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";

async function dbGet(key) {
  try { const { data } = await supabase.from("kv_store").select("value").eq("key", key).single(); return data ? JSON.parse(data.value) : null; }
  catch { return null; }
}
async function dbSet(key, val) {
  try { await supabase.from("kv_store").upsert({ key, value: JSON.stringify(val) }, { onConflict: "key" }); return true; }
  catch { return false; }
}

const ADMIN_PASSWORD = "sanbing2024";
const DEFAULT_OPERATORS = [
  { id:"op_songshuai",   name:"宋帅",   color:"#6366F1" },
  { id:"op_fubaikun",    name:"付百坤", color:"#10B981" },
  { id:"op_zhengkaiwen", name:"郑凯文", color:"#F59E0B" },
  { id:"op_chentai",     name:"陈泰",   color:"#EC4899" },
  { id:"op_mengshutong", name:"孟姝彤", color:"#14B8A6" },
  { id:"op_laihanchun",  name:"赖晗纯", color:"#8B5CF6" },
  { id:"op_jinrunhua",   name:"金润华", color:"#F97316" },
];
const DEFAULT_GROUPS = ["合作","公会","重点跟播"];
const GROUP_COLORS = {"合作":"#6366F1","公会":"#10B981","重点跟播":"#F59E0B"};
const RATING_OPTIONS = ["S","A+","A","B+","B","C+","C","D"];
const RATING_COLORS = {S:"#7C3AED","A+":"#2563EB",A:"#0891B2","B+":"#059669",B:"#65A30D","C+":"#D97706",C:"#EA580C",D:"#DC2626"};

// 157 streamers packed as CSV string - parsed and saved to DB on first run
const STREAMER_CSV = `1,三国冰河时代须尽欢,sanbingmq,7154,吴祖朋,付百坤,op_fubaikun
2,悠悠~三国冰河时代,59761072915,2069,彭瑜,付百坤,op_fubaikun
3,大米饭想当富婆,3380694825Y,9549,张婉婷,付百坤,op_fubaikun
4,三国冰河时代-尔尔江寻雾,19769559,3018,杨汉铭,付百坤,op_fubaikun
5,三国冰河-戏志才,88899930038,7420,周昭榕,付百坤,op_fubaikun
6,姜姜丶,98793612289,1072,周佳琪,付百坤,op_fubaikun
7,三国冰河时代最肝零氪豚豚,2171606548,2139,李斌,付百坤,op_fubaikun
8,三国冰河时代-鲁小二,124912543,6784,袁勇金,赖晗纯,op_laihanchun
9,三国冰河时代-车厘子🍒,view_0728,8291,于红洋,陈泰,op_chentai
10,超级小杰,201334631,3682,赵仁杰,陈泰,op_chentai
11,三国冰河时代.窝头,67358935,8046,史志林,陈泰,op_chentai
12,三国冰河时代-哇哈哈,66913438815,5418,顾佳伟,陈泰,op_chentai
13,小妖精,M981205.,6603,王丽敏,付百坤,op_fubaikun
14,三冰｜是天伊吖,TianYi666946,0266,张杰,付百坤,op_fubaikun
15,三国冰河时代729,98652456931,5940,向江琼,付百坤,op_fubaikun
16,奉孝,simayulong55,0557,周杜彪,付百坤,op_fubaikun
17,小奶龙啵啵,31459088643,9466,赵春祥,付百坤,op_fubaikun
18,官人来了,Wbb258852,7531,王鑫浩,付百坤,op_fubaikun
19,三国冰河时代刘德发,130134487,3016,钟鸿发,付百坤,op_fubaikun
20,三冰：入梦花海,52060695904,2887,杨玉凤,付百坤,op_fubaikun
21,626约定第一深情,zmy19950928,4928,曾茂源,付百坤,op_fubaikun
22,三国冰河时代-妹妹,24231524426,2887,徐亚宁,付百坤,op_fubaikun
23,四川吴彦祖.,90112527184,6608,朱圆辉,付百坤,op_fubaikun
24,慢点跑,134051624,3589,韩涛,付百坤,op_fubaikun
25,敢敢长了心❤️,1060537812,8558,周浩,付百坤,op_fubaikun
26,末世之魂,55810923336,0970,曾宝才,孟姝彤,op_mengshutong
27,清禾,1154480567,2542,张伟,郑凯文,op_zhengkaiwen
28,狂欢泡泡.,aaa..ss,1753,宋知青,孟姝彤,op_mengshutong
29,土豆骑士,54925406449,3302,王彭鹏,孟姝彤,op_mengshutong
30,Zoey,Zoey007007,0640,吴卓怡,付百坤,op_fubaikun
31,小冰伯（三国冰河时代）,574022932,5571,李昊霖,付百坤,op_fubaikun
32,三国冰河时代星星,65600732710,3039,洪仕新,付百坤,op_fubaikun
33,三冰-猛男,25874727651,1237,彭韬,付百坤,op_fubaikun
34,🌈林决,Cx2037,6619,王凯文,付百坤,op_fubaikun
35,咩咩,69581962960,5610,吕文静,付百坤,op_fubaikun
36,三国冰河时代梦游记,38305562956,5385,陈行,付百坤,op_fubaikun
37,闲游虾仁,iii66856,5645,吴俊辰,郑凯文,op_zhengkaiwen
38,landawang,1195879448,3341,曹星,付百坤,op_fubaikun
39,🌸晴天的🌻向日葵,20180127gg,7241,宋美芳,付百坤,op_fubaikun
40,无所畏惧,Y2321692395,0810,杨洋,付百坤,op_fubaikun
41,三国冰河时代-小龙,yszayzhbbhhlfs,9151,黄辉龙,付百坤,op_fubaikun
42,三国冰河时代-兔兔🫧,2189896252,1996,纪珊珊,郑凯文,op_zhengkaiwen
43,三国冰河时代-明明就（关必回）,30231200848,4373,邹润明,付百坤,op_fubaikun
44,你算哪块小饼干,1509945949,3365,林国清,付百坤,op_fubaikun
45,天籁新韵坊,GBL123gouge,2898,邱诗顺,付百坤,op_fubaikun
46,Wᐝ,179460650,6606,温慧芳,付百坤,op_fubaikun
47,三国冰河时代~包装盒,51298323,8167,柏宗辉,付百坤,op_fubaikun
48,豆沙包,66242597073,1845,杜峰煌,郑凯文,op_zhengkaiwen
49,GT,35523694106,4773,龚绍田,郑凯文,op_zhengkaiwen
50,小懒睡了,L00901121,0090,黄梦兰,郑凯文,op_zhengkaiwen
51,只吃香菜丶,97707676144,8427,易润超,付百坤,op_fubaikun
52,三国冰河时代-咕噜噜,40380793848,2388,史路路,付百坤,op_fubaikun
53,冰河时代-蛋蛋,79028547988,4393,林焊鑫,付百坤,op_fubaikun
54,三国冰河时代-爱马仕,68212721935,8159,马晓萌,郑凯文,op_zhengkaiwen
55,麦当当大王,maimaiovo27,8818,张语彤,付百坤,op_fubaikun
56,三国冰河时代——小财迷,86140224705,6642,蔡陆健,郑凯文,op_zhengkaiwen
57,4Uoik,74589263266,6114,徐浩东,郑凯文,op_zhengkaiwen
58,CC 剧韵轩,61623855743,2376,尹策策,付百坤,op_fubaikun
59,mitchell,jinyuyyq1028,4529,李金宇,孟姝彤,op_mengshutong
60,三国冰河时代-max,91443873441,7221,黄广源,郑凯文,op_zhengkaiwen
61,临江仙,22737496969,0519,胡小建,郑凯文,op_zhengkaiwen
62,尚颖儿,54824250295,7370,武二鹏,郑凯文,op_zhengkaiwen
63,雨滴,yudi52766,0386,王田田,郑凯文,op_zhengkaiwen
64,三冰规划家-豹子头零冲,54014844505,3856,何志涛,郑凯文,op_zhengkaiwen
65,星洁浅念,70778349106,7479,刘桂玲,郑凯文,op_zhengkaiwen
66,小川,42563997066,6127,程希,付百坤,op_fubaikun
67,三冰～大魔王,23882128245,5961,史康宁,付百坤,op_fubaikun
68,shallow.,ylh204528087,7657,杨林海,郑凯文,op_zhengkaiwen
69,ღ 慕慕▪︎天師府,992452234m,5949,许梦,郑凯文,op_zhengkaiwen
70,三国冰河时代-小龙女,95479209019,0315,陈年平,郑凯文,op_zhengkaiwen
71,画夕,38026629148,8182,迟艳玲,孟姝彤,op_mengshutong
72,三国冰河时代－叁木,43386527783,6396,任庆森,付百坤,op_fubaikun
73,Wyucc,53091868,2110,胡博,付百坤,op_fubaikun
74,徐富贵,dyoyx0neg2xa,7627,徐士宁,郑凯文,op_zhengkaiwen
75,陈平凡,576921257,5502,陈宇航,付百坤,op_fubaikun
76,kier,kk5219786,8477,席文硕,郑凯文,op_zhengkaiwen
77,殇年,39968069188,2191,李柯琴,付百坤,op_fubaikun
78,帧风说漫,137822735,7752,王鹏,付百坤,op_fubaikun
79,夙,27915685786,5170,李轩,郑凯文,op_zhengkaiwen
80,期待可能性,97518263457,1254,赵彦蕊,付百坤,op_fubaikun
81,三冰-龙三,948083399,7879,邓志勇,郑凯文,op_zhengkaiwen
82,三国冰河时代～泗水亭长,984493727,7020,王志强,郑凯文,op_zhengkaiwen
83,遗憾藏溺于晚风.,cenlin200566,0288,岑琳,郑凯文,op_zhengkaiwen
84,阿森,32841588916,5516,蔡汉森,郑凯文,op_zhengkaiwen
85,小板凳,yxswi,3613,邵尚尚,付百坤,op_fubaikun
86,糖果睡不醒,59231059107,1209,李雪,付百坤,op_fubaikun
87,莓莓莓招了,xiuxiu_2026,1766,庄子萱,付百坤,op_fubaikun
88,北辰星,189378733,3926,彭雪峰,付百坤,op_fubaikun
89,黑炭头,576181709,1856,敖银松,孟姝彤,op_mengshutong
90,祈言,1023485869,8924,邱宝玉,付百坤,op_fubaikun
91,凯哥很忙,97785185876,7857,万吉祥,付百坤,op_fubaikun
92,Z+è,e_quation,1369,刘文昌,付百坤,op_fubaikun
93,l.,Z1029kk,2632,曾伟康,付百坤,op_fubaikun
94,以梦为马,39105042870,2559,周宇辰,付百坤,op_fubaikun
95,三国冰河时代-萌新妹妹,69013819751,7569,王冰鑫,郑凯文,op_zhengkaiwen
96,三冰-麻辣小猪,834967368,7826,李影,郑凯文,op_zhengkaiwen
97,小风车,81963397842,7926,丁悦,付百坤,op_fubaikun
98,三冰~大帅,40180886324,9570,刘子桂,付百坤,op_fubaikun
99,深情专一的小美,853621752,4626,唐石兰,付百坤,op_fubaikun
100,三国冰河时代-灵灵灵（条家军爱播版）,64643251723,9977,涂睦涵,付百坤,op_fubaikun
101,三冰-云望舒,53707806796,1946,李哲明,付百坤,op_fubaikun
102,睡觉梨🍐,51546115,6748,刘海熳,付百坤,op_fubaikun
103,三冰一猛男,67005932855,0607,彭韬,付百坤,op_fubaikun
104,三国冰河时代-691记者,75018770433,6610,李文杰,付百坤,op_fubaikun
105,嘟噜咕咕叽,67678883,5772,杨雨欣,郑凯文,op_zhengkaiwen
106,三国冰河时代丶王一土,61624845111,2901,王豪豪,郑凯文,op_zhengkaiwen
107,盛宴,w355167876,7782,蓝文聪,郑凯文,op_zhengkaiwen
108,三国冰河-小雄,24486720767,8458,李超,郑凯文,op_zhengkaiwen
109,十尾,dy32mqb2vkoc,5377,徐艳,郑凯文,op_zhengkaiwen
110,三国冰河时代-陈平安,chen520616,9172,陈支堃,郑凯文,op_zhengkaiwen
111,辞曲,ciqu95287,4150,张国泉,郑凯文,op_zhengkaiwen
112,🌈上上签,51189605374,7617,张勇,付百坤,op_fubaikun
113,帅飞丈母娘（总被女人骗版）,30590587747,4486,王森,付百坤,op_fubaikun
114,唐八苦,xx789879xx,8344,吴佳昕,付百坤,op_fubaikun
115,零氪军师 吞天鬼骁,32287176540,8426,向华平,付百坤,op_fubaikun
116,1211暮暮吉祥,42228432107,9912,杜成相,付百坤,op_fubaikun
117,莉莉丝（三国冰河时代）,czm775201314,1829,邓琪,郑凯文,op_zhengkaiwen
118,汐崽,43891199763,9122,刘帅,郑凯文,op_zhengkaiwen
119,他们都叫我总裁,33616090517,6209,鲍志财,郑凯文,op_zhengkaiwen
120,三国冰河时代·老六,31380599450,9803,倪腾龙,金润华,op_jinrunhua
121,三冰最厉害的钓手,615372159,1151,黄俊杰,金润华,op_jinrunhua
122,沐小白qaq,24809215692,1285,李迪,郑凯文,op_zhengkaiwen
123,三国冰河时代：观云,58719596178,1602,刘泽琴,郑凯文,op_zhengkaiwen
124,三冰骄阳,21812552718,2889,魏杰,金润华,op_jinrunhua
125,沐白qaq,mubaic666,0095,吴潇龙,郑凯文,op_zhengkaiwen
126,三国冰河时代_瑞文,xing1265,9586,梁来兴,金润华,op_jinrunhua
127,冯冯,27679976377,2992,冯春富,金润华,op_jinrunhua
128,婲将军,79636325513,6213,赵美林,付百坤,op_fubaikun
129,🌈三国冰河时代-叶久芝,570603459,2255,张江旭,付百坤,op_fubaikun
130,三冰打工的王,QQsvip,9764,张晟,付百坤,op_fubaikun
131,龙少vlog,Longmaster030823,9297,罗燕龙,付百坤,op_fubaikun
132,三国冰河时代·老六,31380599450,9803,倪腾龙,付百坤,op_fubaikun
133,up,he438928440,3666,何慧,付百坤,op_fubaikun
134,蛋蛋,badao3093460013,0430,葛月红,付百坤,op_fubaikun
135,三国冰河时代-翠花,969698,5725,杨鑫灿,付百坤,op_fubaikun
136,锦鲤颜,Ly44420,李兴丹,李兴丹,付百坤,op_fubaikun
137,HugiozZ,695400844,1783,杨伟超,金润华,op_jinrunhua
138,三国冰河时代-许七安,42398628979,3343,黎子健,金润华,op_jinrunhua
139,三国冰河时代-卷卷,70503378177,3013,吴强,金润华,op_jinrunhua
140,三国冰河 - 白月光,95747608918,7235,陈富兴,金润华,op_jinrunhua
141,开心大笨猪,20615217076,2229,陈登峰,金润华,op_jinrunhua
142,ntonia,932343465,0427,沈海凤,金润华,op_jinrunhua
143,wwwht,JokerTao,9740,谢菊梅,金润华,op_jinrunhua
144,三国冰河时代典小韦,90140187763,0828,尤凤英,金润华,op_jinrunhua
145,耕耘,82670340,1977,刘亚南,金润华,op_jinrunhua
146,蔚星河,97002889214,7137,张浩灵,金润华,op_jinrunhua
147,韩默,24836656,3707,韩丽丽,金润华,op_jinrunhua
148,兜里就50,1525808733,1126,刘珍,金润华,op_jinrunhua
149,蜉蝣,370773088,9867,邵翟婴,金润华,op_jinrunhua
150,遇风难遇你,28609433312,2088,李哲浩,金润华,op_jinrunhua
151,Cylips,85095074631,2830,陈梓轩,金润华,op_jinrunhua
152,多吃饭,huggsy123,2918,邓英林,金润华,op_jinrunhua
153,乐观点,school64531,8834,高镇雄,金润华,op_jinrunhua
154,茗溪,83813508273,2656,胡月明,金润华,op_jinrunhua
155,x,49320107657,0008,肖杨,金润华,op_jinrunhua
156,寿司,29672024192,6511,何嘉威,金润华,op_jinrunhua
157,睡个好觉,1866732205,1278,谷士迪,金润华,op_jinrunhua`;

function parseStreamersCSV(csv) {
  return csv.trim().split("\n").map((line, i) => {
    const p = line.split(",");
    return { id:`s_init_${i+1}`, name:p[1]||"", tid:p[2]||"", phone:p[3]||"", realname:p[4]||"", operator:p[5]||"", opId:p[6]||"op_fubaikun", group:"公会", deleted:false, signDate:"", firstLiveDate:"" };
  }).filter(s => s.name);
}

const DATA_FIELDS = [
  {key:"liveDuration",short:"开播时长\n(小时)",w:78,ph:"0"},
  {key:"exposure",short:"曝光",w:70,ph:"0"},
  {key:"uv",short:"UV\n(场观)",w:70,ph:"0"},
  {key:"acu",short:"ACU\n(总÷人数)",w:74,ph:"0"},
  {key:"peak",short:"峰值\n在线",w:70,ph:"0"},
  {key:"stay",short:"停留\n时长(s)",w:70,ph:"0"},
  {key:"interact",short:"互动率\n%",w:63,ph:"0"},
  {key:"fans",short:"粉丝\n净增",w:63,ph:"0"},
];
const CONTENT_FIELDS = [
  {key:"script",label:"话术要点",w:148,ph:"有效话术/需改进..."},
  {key:"bgm",label:"BGM节奏",w:128,ph:"本周/下周换..."},
  {key:"hotspot",label:"热点追踪",w:138,ph:"追了哪个/效果..."},
  {key:"activity",label:"活动执行",w:138,ph:"节点/配合情况..."},
];
const CONCLUDE_FIELDS = [
  {key:"highlight",label:"本周亮点",w:142,ph:"做对了什么..."},
  {key:"problem",label:"待解决问题",w:142,ph:"最优先1条..."},
  {key:"nextplan",label:"下周方向",w:132,ph:"重点要做的..."},
];
const EMPTY_REC = ()=>({liveDuration:"",exposure:"",uv:"",acu:"",peak:"",stay:"",interact:"",fans:"",script:"",bgm:"",hotspot:"",activity:"",highlight:"",problem:"",nextplan:"",rating:""});
const getWeekKey  = (opId,w)=>`wr_${opId}_${w.replace(/[\s.\-]/g,"_")}`;
const getMonthKey = (opId,m)=>`mr_${opId}_${m.replace(/[\s年月]/g,"_")}`;
const isLiveEnough = v => parseFloat(v||0) >= 1;

const PATHS={
  calendar:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  plus:"M12 4v16m8-8H4",x:"M6 18L18 6M6 6l12 12",check:"M5 13l4 4L19 7",
  save:"M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
  settings:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  upload:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  download:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  shield:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};
const Ic=({n,s=16})=>(<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{PATHS[n].split(" M").map((seg,i)=><path key={i} d={i===0?seg:"M"+seg}/>)}</svg>);

function WeekPicker({value,onChange}){
  const[open,setOpen]=useState(false);const ref=useRef();const now=new Date();const[ym,setYm]=useState(`${now.getFullYear()}-${now.getMonth()+1}`);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const[y,m]=ym.split("-").map(Number);
  const weeks=(()=>{const arr=[];let cur=new Date(y,m-1,1);while(cur.getDay()!==1)cur.setDate(cur.getDate()-1);const last=new Date(y,m,0);while(cur<=last){const end=new Date(cur);end.setDate(end.getDate()+6);const f=d=>`${d.getMonth()+1}.${String(d.getDate()).padStart(2,"0")}`;arr.push(`${f(cur)} - ${f(end)}`);cur.setDate(cur.getDate()+7);}return arr;})();
  const shift=n=>{const d=new Date(y,m-1+n,1);setYm(`${d.getFullYear()}-${d.getMonth()+1}`);};
  return(<div ref={ref} style={{position:"relative"}}><button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",background:value?"#1e293b":"#334155",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",whiteSpace:"nowrap"}}><Ic n="calendar" s={13}/>{value||"选择周期"}</button>{open&&(<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:300,background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:14,minWidth:230,boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><button onClick={()=>shift(-1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>‹</button><span style={{color:"#f1f5f9",fontWeight:700,fontSize:13}}>{y}年{m}月</span><button onClick={()=>shift(1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>›</button></div><div style={{display:"flex",flexDirection:"column",gap:3}}>{weeks.map(w=>(<button key={w} onClick={()=>{onChange(w);setOpen(false);}} style={{padding:"7px 11px",background:value===w?"#6366F1":"#0f172a",border:"1px solid "+(value===w?"#6366F1":"#334155"),borderRadius:6,color:"#f1f5f9",cursor:"pointer",textAlign:"left",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>{w}</button>))}</div></div>)}</div>);
}

function MonthPicker({value,onChange}){
  const[open,setOpen]=useState(false);const ref=useRef();const now=new Date();const[year,setYear]=useState(now.getFullYear());
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const months=Array.from({length:12},(_,i)=>`${year}年${i+1}月`);
  return(<div ref={ref} style={{position:"relative"}}><button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",background:value?"#1e293b":"#334155",border:"1px solid #475569",borderRadius:8,color:"#f1f5f9",cursor:"pointer",fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",whiteSpace:"nowrap"}}><Ic n="calendar" s={13}/>{value||"选择月份"}</button>{open&&(<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:300,background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:14,minWidth:180,boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><button onClick={()=>setYear(y=>y-1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>‹</button><span style={{color:"#f1f5f9",fontWeight:700,fontSize:13}}>{year}年</span><button onClick={()=>setYear(y=>y+1)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:22,lineHeight:1,padding:"0 4px"}}>›</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>{months.map(mo=>(<button key={mo} onClick={()=>{onChange(mo);setOpen(false);}} style={{padding:"6px 4px",background:value===mo?"#6366F1":"#0f172a",border:"1px solid "+(value===mo?"#6366F1":"#334155"),borderRadius:6,color:"#f1f5f9",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>{mo.split("年")[1]}</button>))}</div></div>)}</div>);
}

function AdminLoginModal({onSuccess,onClose}){
  const[pw,setPw]=useState("");const[err,setErr]=useState(false);
  const check=()=>{if(pw===ADMIN_PASSWORD){onSuccess();}else{setErr(true);setTimeout(()=>setErr(false),1500);}};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:16,padding:32,width:320,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>🔐</div><div style={{color:"#f1f5f9",fontWeight:800,fontSize:16,marginBottom:6}}>管理员验证</div><div style={{color:"#64748B",fontSize:13,marginBottom:20}}>输入管理员密码进入审批模式</div><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="输入密码" style={{width:"100%",background:err?"#2D1515":"#1e293b",border:"1px solid "+(err?"#EF4444":"#334155"),borderRadius:8,color:"#f1f5f9",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box",marginBottom:8}}/>{err&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8}}>密码错误</div>}<button onClick={check} style={{width:"100%",padding:"10px",background:"#6366F1",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Noto Sans SC',sans-serif"}}>确认</button></div></div>);
}

function ImportModal({operators,currentOpId,onImport,onClose}){
  const[mode,setMode]=useState("info");const[rows,setRows]=useState([]);const[opId,setOpId]=useState(currentOpId||operators[0]?.id||"");const[msg,setMsg]=useState("");
  const downloadTemplate=()=>{const headers=["主播昵称","抖音ID","手机尾号","实名姓名","分组(合作/公会/重点跟播)","签约日期(YYYY-MM-DD)","首播日期(YYYY-MM-DD)","开播时长(小时)","曝光","UV(场观)","ACU","峰值在线","停留时长(s)","互动率%","粉丝净增","话术要点","BGM节奏","热点追踪","活动执行","本周亮点","待解决问题","下周方向","评级(S/A+/A/B+/B/C+/C/D)"];const ex=["示例主播","example123","1234","张三","公会","2024-01-01","2024-01-15","3.5","10000","5000","200","500","45","5.2","100","开场话术好用","节奏快","追了XX热点","活动配合好","互动率高","话术需改进","加强开场钩子","A"];const csv=[headers,ex].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="三冰复盘导入模板.csv";a.click();URL.revokeObjectURL(url);};
  const parseCSV=text=>{const lines=text.trim().split("\n");const headers=lines[0].split(",").map(h=>h.replace(/"/g,"").trim());return lines.slice(1).map(line=>{const vals=[];let cur="";let inQ=false;for(let ch of line){if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){vals.push(cur.trim());cur="";}else{cur+=ch;}}vals.push(cur.trim());const obj={};headers.forEach((h,i)=>{obj[h]=vals[i]||"";});return obj;}).filter(r=>r["主播昵称"]);};
  const handleFile=async e=>{const file=e.target.files[0];if(!file)return;const text=await file.text();try{const parsed=parseCSV(text);const mapped=parsed.map((r,i)=>({id:"import_"+Date.now()+"_"+i,name:r["主播昵称"]||"",tid:r["抖音ID"]||"",phone:r["手机尾号"]||"",realname:r["实名姓名"]||"",operator:operators.find(o=>o.id===opId)?.name||"",opId,group:r["分组(合作/公会/重点跟播)"]||"公会",deleted:false,signDate:r["签约日期(YYYY-MM-DD)"]||"",firstLiveDate:r["首播日期(YYYY-MM-DD)"]||"",_weekData:{liveDuration:r["开播时长(小时)"]||"",exposure:r["曝光"]||"",uv:r["UV(场观)"]||"",acu:r["ACU"]||"",peak:r["峰值在线"]||"",stay:r["停留时长(s)"]||"",interact:r["互动率%"]||"",fans:r["粉丝净增"]||"",script:r["话术要点"]||"",bgm:r["BGM节奏"]||"",hotspot:r["热点追踪"]||"",activity:r["活动执行"]||"",highlight:r["本周亮点"]||"",problem:r["待解决问题"]||"",nextplan:r["下周方向"]||"",rating:r["评级(S/A+/A/B+/B/C+/C/D)"]||""}}));setRows(mapped);setMode("preview");setMsg(`解析成功，共 ${mapped.length} 条`);}catch{setMsg("解析失败，请确认文件格式");}};
  const btn=(bg,ex={})=>({padding:"8px 18px",background:bg,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif",display:"flex",alignItems:"center",gap:6,...ex});
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,width:"min(680px,94vw)",maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden"}}><div style={{padding:"18px 22px",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><span style={{color:"#f1f5f9",fontWeight:800,fontSize:15}}>📥 批量导入主播数据</span><button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer"}}><Ic n="x" s={19}/></button></div><div style={{overflowY:"auto",padding:22,flex:1}}>{mode!=="preview"&&(<><div style={{marginBottom:16}}><div style={{color:"#94a3b8",fontSize:13,marginBottom:8}}>归属运营</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{operators.map(op=>(<button key={op.id} onClick={()=>setOpId(op.id)} style={{...btn(opId===op.id?op.color:"#1e293b"),border:"1px solid "+(opId===op.id?op.color:"#334155")}}>{op.name}</button>))}</div></div><div style={{background:"#080f1e",borderRadius:12,padding:18,marginBottom:14,border:"1px solid #1e293b"}}><div style={{color:"#6366F1",fontWeight:700,fontSize:13,marginBottom:6}}>第一步：下载模板</div><button onClick={downloadTemplate} style={btn("#334155")}><Ic n="download" s={14}/>下载 CSV 模板</button></div><div style={{background:"#080f1e",borderRadius:12,padding:18,border:"1px solid #1e293b"}}><div style={{color:"#10B981",fontWeight:700,fontSize:13,marginBottom:6}}>第二步：上传填好的文件</div><label style={{...btn("#10B981"),display:"inline-flex",cursor:"pointer"}}><Ic n="upload" s={14}/>选择文件上传<input type="file" accept=".csv" onChange={handleFile} style={{display:"none"}}/></label>{msg&&<div style={{color:msg.includes("失败")?"#EF4444":"#10B981",fontSize:13,marginTop:10}}>{msg}</div>}</div></>)}{mode==="preview"&&(<><div style={{color:"#10B981",fontSize:13,marginBottom:12,fontWeight:700}}>{msg}</div><div style={{overflowX:"auto",borderRadius:10,border:"1px solid #1e293b",marginBottom:14}}><table style={{borderCollapse:"collapse",width:"100%",minWidth:500}}><thead><tr>{["昵称","抖音ID","签约","首播","开播h","UV","评级"].map(h=>(<th key={h} style={{padding:"8px 10px",background:"#1e293b",color:"#64748B",fontSize:11,fontWeight:700,textAlign:"left",borderBottom:"1px solid #334155"}}>{h}</th>))}</tr></thead><tbody>{rows.map((r,i)=>(<tr key={i}>{[r.name,r.tid,r.signDate,r.firstLiveDate,r._weekData.liveDuration,r._weekData.uv,r._weekData.rating].map((v,vi)=>(<td key={vi} style={{padding:"7px 10px",background:i%2===0?"#080f1e":"#0a1628",color:"#e2e8f0",fontSize:12,border:"1px solid #0d1929"}}>{v||"-"}</td>))}</tr>))}</tbody></table></div></>)}</div><div style={{padding:"14px 22px",borderTop:"1px solid #1e293b",display:"flex",justifyContent:"space-between",gap:8,flexShrink:0}}>{mode==="preview"?(<><button onClick={()=>{setMode("info");setRows([]);setMsg("");}} style={btn("#334155")}>重新上传</button><button onClick={()=>{onImport(rows,opId);onClose();}} style={btn("#6366F1")}><Ic n="check" s={14}/>确认导入 {rows.length} 条</button></>):(<><div/><button onClick={onClose} style={btn("#334155")}>取消</button></>)}</div></div></div>);
}

function ManageModal({operators,streamers,isAdmin,onClose,onSave}){
  const[ops,setOps]=useState(JSON.parse(JSON.stringify(operators)));const[strs,setStrs]=useState(JSON.parse(JSON.stringify(streamers)));const[tab,setTab]=useState("ops");
  const[newOp,setNewOp]=useState({name:"",color:"#6366F1"});const[newStr,setNewStr]=useState({name:"",tid:"",phone:"",realname:"",group:DEFAULT_GROUPS[0],opId:operators[0]?.id||"",signDate:"",firstLiveDate:""});
  const PALETTE=["#6366F1","#10B981","#F59E0B","#EC4899","#14B8A6","#F97316","#8B5CF6","#EF4444","#0EA5E9","#84CC16"];
  const inp=(ex={})=>({background:"#1e293b",border:"1px solid #334155",borderRadius:7,color:"#f1f5f9",padding:"7px 11px",fontSize:13,outline:"none",fontFamily:"'Noto Sans SC',sans-serif",...ex});
  const btn=(bg,ex={})=>({padding:"8px 16px",background:bg,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif",display:"flex",alignItems:"center",gap:6,...ex});
  const addOp=()=>{if(!newOp.name.trim())return;setOps(p=>[...p,{id:"op_"+Date.now(),name:newOp.name.trim(),color:newOp.color}]);setNewOp({name:"",color:"#6366F1"});};
  const delOp=id=>{setOps(p=>p.filter(o=>o.id!==id));setStrs(p=>p.map(s=>s.opId===id?{...s,opId:""}:s));};
  const addStr=()=>{if(!newStr.name.trim())return;setStrs(p=>[...p,{id:"s_"+Date.now(),...newStr,name:newStr.name.trim(),tid:newStr.tid.trim(),deleted:false}]);setNewStr(p=>({...p,name:"",tid:"",phone:"",realname:"",signDate:"",firstLiveDate:""}));};
  const requestDelete=id=>setStrs(p=>p.map(s=>s.id===id?{...s,deleteRequested:true}:s));
  const approveDelete=id=>setStrs(p=>p.filter(s=>s.id!==id));
  const rejectDelete=id=>setStrs(p=>p.map(s=>s.id===id?{...s,deleteRequested:false}:s));
  const updStr=(id,f,v)=>setStrs(p=>p.map(s=>s.id===id?{...s,[f]:v}:s));
  const pendingDeletes=strs.filter(s=>s.deleteRequested);
  const tabs=[["ops","👤 运营"],["strs","🎮 主播"],isAdmin&&pendingDeletes.length>0&&["del","🗑️ 删除审批("+pendingDeletes.length+")"]].filter(Boolean);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,width:"min(980px,96vw)",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}><div style={{padding:"18px 22px",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#f1f5f9",fontWeight:800,fontSize:15}}>⚙️ 管理运营 & 主播</span>{isAdmin&&<span style={{background:"#7C3AED",color:"#fff",fontSize:11,padding:"2px 8px",borderRadius:10,fontWeight:700}}>管理员模式</span>}</div><button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer"}}><Ic n="x" s={19}/></button></div><div style={{display:"flex",padding:"0 22px",borderBottom:"1px solid #1e293b",flexShrink:0}}>{tabs.map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{padding:"11px 18px",background:"none",border:"none",borderBottom:"2px solid "+tab===k?"#6366F1":"transparent",color:tab===k?"#6366F1":"#64748B",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif"}}>{l}</button>))}</div><div style={{overflowY:"auto",padding:22,flex:1}}>
    {tab==="ops"&&(<div><div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><input value={newOp.name} onChange={e=>setNewOp(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addOp()} placeholder="运营姓名" style={{...inp(),flex:"1 1 100px"}}/><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{PALETTE.map(c=>(<button key={c} onClick={()=>setNewOp(p=>({...p,color:c}))} style={{width:22,height:22,borderRadius:5,background:c,cursor:"pointer",border:"2px solid "+newOp.color===c?"#fff":"transparent"}}/>))}</div><button onClick={addOp} style={btn("#6366F1")}><Ic n="plus" s={13}/>添加运营</button></div><div style={{display:"flex",flexDirection:"column",gap:8}}>{ops.map(op=>(<div key={op.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 15px",background:"#1e293b",borderRadius:10,border:"1px solid "+op.color+"44"}}><div style={{width:11,height:11,borderRadius:3,background:op.color,flexShrink:0}}/><span style={{color:"#f1f5f9",fontWeight:700,flex:1,fontSize:14}}>{op.name}</span><span style={{color:"#475569",fontSize:12}}>{strs.filter(s=>s.opId===op.id).length} 个主播</span>{isAdmin&&<button onClick={()=>delOp(op.id)} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer"}}><Ic n="trash" s={14}/></button>}</div>))}</div></div>)}
    {tab==="strs"&&(<div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:16,padding:16,background:"#080f1e",borderRadius:10,border:"1px solid #1e293b"}}><input value={newStr.name} onChange={e=>setNewStr(p=>({...p,name:e.target.value}))} placeholder="主播昵称*" style={inp()}/><input value={newStr.tid} onChange={e=>setNewStr(p=>({...p,tid:e.target.value}))} placeholder="抖音ID*" style={inp()}/><input value={newStr.phone} onChange={e=>setNewStr(p=>({...p,phone:e.target.value}))} placeholder="手机尾号" style={inp()}/><input value={newStr.realname} onChange={e=>setNewStr(p=>({...p,realname:e.target.value}))} placeholder="实名姓名" style={inp()}/><select value={newStr.group} onChange={e=>setNewStr(p=>({...p,group:e.target.value}))} style={inp()}>{DEFAULT_GROUPS.map(g=><option key={g}>{g}</option>)}</select><select value={newStr.opId} onChange={e=>setNewStr(p=>({...p,opId:e.target.value}))} style={inp()}><option value="">未分配</option>{ops.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{color:"#64748B",fontSize:11}}>签约日期</label><input type="date" value={newStr.signDate} onChange={e=>setNewStr(p=>({...p,signDate:e.target.value}))} style={inp()}/></div><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{color:"#64748B",fontSize:11}}>首播日期</label><input type="date" value={newStr.firstLiveDate} onChange={e=>setNewStr(p=>({...p,firstLiveDate:e.target.value}))} style={inp()}/></div><button onClick={addStr} style={{...btn("#6366F1"),alignSelf:"flex-end"}}><Ic n="plus" s={13}/>添加主播</button></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:820}}><thead><tr>{["昵称","抖音ID","手机","实名","分组","归属运营","签约日期","首播日期","操作"].map(h=>(<th key={h} style={{padding:"8px 10px",background:"#1e293b",color:"#64748B",fontSize:11,fontWeight:700,textAlign:"left",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{strs.filter(s=>!s.deleteRequested).map((s,i)=>{const op=ops.find(o=>o.id===s.opId);const bg=i%2===0?"#0a1628":"#080f1e";const td={padding:"7px 10px",background:bg,borderBottom:"1px solid #0d1929",fontSize:12};return(<tr key={s.id}><td style={{...td,color:"#f1f5f9",fontWeight:700}}>{s.name}</td><td style={{...td,color:"#64748B"}}>{s.tid}</td><td style={{...td,color:"#64748B"}}>{s.phone}</td><td style={{...td,color:"#64748B"}}>{s.realname}</td><td style={td}><select value={s.group} onChange={e=>updStr(s.id,"group",e.target.value)} style={{...inp({padding:"3px 7px",fontSize:11})}}>{DEFAULT_GROUPS.map(g=><option key={g}>{g}</option>)}</select></td><td style={td}><select value={s.opId} onChange={e=>updStr(s.id,"opId",e.target.value)} style={{...inp({padding:"3px 7px",fontSize:11,borderColor:op?.color||"#334155"})}}><option value="">未分配</option>{ops.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></td><td style={td}><input type="date" value={s.signDate||""} onChange={e=>updStr(s.id,"signDate",e.target.value)} style={{...inp({padding:"3px 7px",fontSize:11,width:118})}}/></td><td style={td}><input type="date" value={s.firstLiveDate||""} onChange={e=>updStr(s.id,"firstLiveDate",e.target.value)} style={{...inp({padding:"3px 7px",fontSize:11,width:118})}}/></td><td style={td}>{isAdmin?(<button onClick={()=>approveDelete(s.id)} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer"}}><Ic n="trash" s={13}/></button>):(<button onClick={()=>requestDelete(s.id)} style={{background:"none",border:"1px solid #475569",borderRadius:5,color:"#94a3b8",cursor:"pointer",fontSize:11,padding:"2px 8px",fontFamily:"'Noto Sans SC',sans-serif"}}>申请删除</button>)}</td></tr>);})}</tbody></table></div></div>)}
    {tab==="del"&&isAdmin&&(<div><div style={{color:"#94a3b8",fontSize:13,marginBottom:14}}>以下主播已申请删除：</div>{pendingDeletes.length===0?(<div style={{color:"#334155",fontSize:14,textAlign:"center",padding:"40px 0"}}>暂无待审批</div>):pendingDeletes.map(s=>{const op=ops.find(o=>o.id===s.opId);return(<div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"#1e293b",borderRadius:10,marginBottom:8,border:"1px solid #EF444433"}}><div style={{flex:1}}><div style={{color:"#f1f5f9",fontWeight:700,fontSize:14}}>{s.name}</div><div style={{color:"#64748B",fontSize:12}}>{s.tid} · {op?.name||"未分配"}</div></div><button onClick={()=>rejectDelete(s.id)} style={{padding:"6px 14px",background:"#334155",border:"none",borderRadius:7,color:"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>拒绝</button><button onClick={()=>approveDelete(s.id)} style={{padding:"6px 14px",background:"#EF4444",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif"}}>批准删除</button></div>);})}</div>)}
  </div><div style={{padding:"14px 22px",borderTop:"1px solid #1e293b",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0}}><button onClick={onClose} style={btn("#334155")}>取消</button><button onClick={()=>onSave(ops,strs)} style={btn("#6366F1")}><Ic n="save" s={13}/>保存设置</button></div></div></div>);
}

const TH=(bg,color="#94a3b8",ex={})=>({padding:"7px 6px",border:"1px solid #1e293b",fontSize:10,fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif",background:bg,color,whiteSpace:"pre-line",lineHeight:1.3,verticalAlign:"middle",textAlign:"center",...ex});
const TD=(bg,ex={})=>({border:"1px solid #0d1929",background:bg,verticalAlign:"middle",fontFamily:"'Noto Sans SC',sans-serif",padding:"4px 6px",...ex});

function Dashboard({operators,streamers,allWeeks}){
  const[loading,setLoading]=useState(true);const[weekData,setWeekData]=useState({});const[viewOp,setViewOp]=useState("all");
  const now=new Date();const getWL=date=>{const d=new Date(date);while(d.getDay()!==1)d.setDate(d.getDate()-1);const end=new Date(d);end.setDate(end.getDate()+6);const f=x=>`${x.getMonth()+1}.${String(x.getDate()).padStart(2,"0")}`;return `${f(d)} - ${f(end)}`;};
  const TW=getWL(now);const lwd=new Date(now);lwd.setDate(now.getDate()-7);const LW=getWL(lwd);
  useEffect(()=>{const weeks=[TW,LW];const keys=[];operators.forEach(op=>weeks.forEach(w=>keys.push({opId:op.id,w,key:getWeekKey(op.id,w)})));Promise.all(keys.map(({key,opId,w})=>dbGet(key).then(d=>[`${opId}__${w}`,d]))).then(res=>{const obj={};res.forEach(([k,d])=>{obj[k]=d;});setWeekData(obj);setLoading(false);});},[allWeeks.length]);
  const active=streamers.filter(s=>!s.deleted&&!s.deleteRequested);const filt=viewOp==="all"?active:active.filter(s=>s.opId===viewOp);const fops=viewOp==="all"?operators:operators.filter(o=>o.id===viewOp);
  const uvT=(w,arr)=>arr.reduce((sum,s)=>sum+(parseFloat(weekData[s.opId+"__"+w]?.records?.[s.id]?.uv)||0),0);
  const lcT=(w,arr)=>arr.filter(s=>isLiveEnough(weekData[s.opId+"__"+w]?.records?.[s.id]?.liveDuration)).length;
  const lhT=(w,arr)=>arr.reduce((sum,s)=>sum+(parseFloat(weekData[s.opId+"__"+w]?.records?.[s.id]?.liveDuration)||0),0);
  const tUV=uvT(TW,filt);const lUV=uvT(LW,filt);const uvD=tUV-lUV;const uvP=lUV?(uvD/lUV*100).toFixed(1):null;
  const tLive=lcT(TW,filt);const lLive=lcT(LW,filt);const livD=tLive-lLive;
  const tH=lhT(TW,filt);const lH=lhT(LW,filt);const hD=tH-lH;
  const aUV=uvT(TW,active);const aLive=lcT(TW,active);
  const KPI=({field,label,color})=>{const ga=(w,arr)=>{const vs=arr.flatMap(s=>[parseFloat(weekData[s.opId+"__"+w]?.records?.[s.id]?.[field])||0]).filter(v=>v>0);return vs.length?Math.round(vs.reduce((a,b)=>a+b)/vs.length):null;};const tA=ga(TW,filt);const lA=ga(LW,filt);const d=tA!==null&&lA!==null?tA-lA:null;const p=d!==null&&lA?((d/lA)*100).toFixed(1):null;return(<div style={{background:"#0f172a",borderRadius:10,padding:13,border:"1px solid "+color+"33",flex:"1 1 110px",minWidth:100}}><div style={{color,fontSize:10,fontWeight:700,marginBottom:7}}>{label}</div><div style={{color:"#f1f5f9",fontSize:19,fontWeight:900,marginBottom:4}}>{tA!==null?tA.toLocaleString():"--"}</div>{d!==null?(<div style={{display:"flex",alignItems:"center",gap:3}}><span style={{color:d>=0?"#10B981":"#EF4444",fontSize:10,fontWeight:700}}>{d>=0?"▲":"▼"}{Math.abs(d).toLocaleString()}</span>{p&&<span style={{color:"#475569",fontSize:10}}>({d>=0?"+":""}{p}%)</span>}</div>):<div style={{color:"#334155",fontSize:10}}>上周无数据</div>}</div>);};
  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}><span style={{color:"#64748B",fontSize:13}}>查看维度：</span><button onClick={()=>setViewOp("all")} style={{padding:"5px 12px",borderRadius:18,border:"1px solid "+(viewOp==="all"?"#6366F1":"#334155"),background:viewOp==="all"?"#6366F1":"#1e293b",color:viewOp==="all"?"#fff":"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>全部</button>{operators.map(op=>(<button key={op.id} onClick={()=>setViewOp(op.id)} style={{padding:"5px 12px",borderRadius:18,border:"1px solid "+(viewOp===op.id?op.color:"#334155"),background:viewOp===op.id?op.color:"#1e293b",color:viewOp===op.id?"#fff":"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}>{op.name}</button>))}</div>
    {loading?(<div style={{textAlign:"center",padding:"60px 0",color:"#475569"}}><div style={{fontSize:32,marginBottom:10}}>⏳</div><div>加载中...</div></div>):(<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div style={{background:"#0f172a",borderRadius:14,padding:18,border:"1px solid #6366F133"}}><div style={{color:"#6366F1",fontSize:12,fontWeight:700,marginBottom:4}}>📊 UV 合计（场观总和）</div><div style={{color:"#94a3b8",fontSize:11,marginBottom:10}}>{TW}</div><div style={{display:"flex",gap:18,flexWrap:"wrap"}}><div><div style={{color:"#475569",fontSize:11,marginBottom:3}}>{viewOp==="all"?"全团队":"本运营"}</div><div style={{color:"#f1f5f9",fontSize:24,fontWeight:900}}>{tUV>0?tUV.toLocaleString():"--"}</div>{uvD!==0&&lUV>0&&<div style={{color:uvD>=0?"#10B981":"#EF4444",fontSize:12,fontWeight:700}}>{uvD>=0?"▲":"▼"}{Math.abs(uvD).toLocaleString()} {uvP&&"("+(uvD>=0?"+":"")+uvP+"%)"}</div>}</div>{viewOp!=="all"&&<div><div style={{color:"#475569",fontSize:11,marginBottom:3}}>全团队</div><div style={{color:"#64748B",fontSize:20,fontWeight:700}}>{aUV>0?aUV.toLocaleString():"--"}</div></div>}</div></div>
        <div style={{background:"#0f172a",borderRadius:14,padding:18,border:"1px solid #10B98133"}}><div style={{color:"#10B981",fontSize:12,fontWeight:700,marginBottom:4}}>🎙️ 开播统计（≥1小时）</div><div style={{color:"#94a3b8",fontSize:11,marginBottom:10}}>{TW}</div><div style={{display:"flex",gap:18,flexWrap:"wrap"}}><div><div style={{color:"#475569",fontSize:11,marginBottom:3}}>开播人数</div><div style={{color:"#f1f5f9",fontSize:22,fontWeight:900}}>{tLive}<span style={{fontSize:13,color:"#64748B"}}> / {filt.length}</span></div>{livD!==0&&<div style={{color:livD>=0?"#10B981":"#EF4444",fontSize:12,fontWeight:700}}>{livD>=0?"▲":"▼"}{Math.abs(livD)} 人 vs上周</div>}</div><div><div style={{color:"#475569",fontSize:11,marginBottom:3}}>总开播时长</div><div style={{color:"#f1f5f9",fontSize:20,fontWeight:700}}>{tH>0?tH.toFixed(1):"--"}<span style={{fontSize:12,color:"#64748B"}}> h</span></div>{hD!==0&&lH>0&&<div style={{color:hD>=0?"#10B981":"#EF4444",fontSize:12,fontWeight:700}}>{hD>=0?"▲":"▼"}{Math.abs(hD).toFixed(1)}h vs上周</div>}</div>{viewOp!=="all"&&<div><div style={{color:"#475569",fontSize:11,marginBottom:3}}>全团队</div><div style={{color:"#64748B",fontSize:18,fontWeight:700}}>{aLive} 人</div></div>}</div></div>
      </div>
      <div style={{background:"#0f172a",borderRadius:14,padding:16,marginBottom:14,border:"1px solid #1e293b"}}><div style={{color:"#f1f5f9",fontWeight:800,fontSize:13,marginBottom:4}}>📊 本周数据概览（场均）</div><div style={{color:"#475569",fontSize:11,marginBottom:11}}>{TW} vs 上周 {LW}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><KPI field="exposure" label="曝光（场均）" color="#A855F7"/><KPI field="uv" label="UV（场观）" color="#6366F1"/><KPI field="acu" label="ACU" color="#10B981"/><KPI field="peak" label="峰值在线" color="#F59E0B"/><KPI field="stay" label="停留(s)" color="#14B8A6"/><KPI field="interact" label="互动率%" color="#EC4899"/><KPI field="fans" label="粉丝净增" color="#84CC16"/></div></div>
      <div style={{background:"#0f172a",borderRadius:14,padding:16,marginBottom:14,border:"1px solid #1e293b"}}><div style={{color:"#f1f5f9",fontWeight:800,fontSize:13,marginBottom:4}}>🏆 本周主播 UV 排行 TOP 15</div><div style={{color:"#475569",fontSize:11,marginBottom:11}}>{TW}</div>{(()=>{const wUV=filt.map(s=>{const op=operators.find(o=>o.id===s.opId);const d=weekData[s.opId+"__"+TW];const uv=parseFloat(d?.records?.[s.id]?.uv)||0;const ld=weekData[s.opId+"__"+LW];const luv=parseFloat(ld?.records?.[s.id]?.uv)||0;return{...s,uv,luv,opColor:op?.color||"#6366F1",live:isLiveEnough(d?.records?.[s.id]?.liveDuration)};}).sort((a,b)=>b.uv-a.uv).slice(0,15);const mx=wUV[0]?.uv||1;return wUV.map((s,i)=>{const d2=s.luv?s.uv-s.luv:null;return(<div key={s.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}><div style={{width:20,color:i<3?"#F59E0B":"#475569",fontWeight:800,fontSize:12,textAlign:"center",flexShrink:0}}>{i+1}</div><div style={{width:90,color:"#f1f5f9",fontSize:12,fontWeight:700,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>{s.live&&<span style={{background:"#10B98122",color:"#10B981",fontSize:9,padding:"1px 5px",borderRadius:4,fontWeight:700,flexShrink:0}}>开播✓</span>}<div style={{flex:1,background:"#1e293b",borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:(s.uv?Math.round((s.uv/mx)*100):0)+"%",height:"100%",background:s.opColor,borderRadius:4}}/></div><div style={{width:58,color:"#6366F1",fontWeight:700,fontSize:12,textAlign:"right",flexShrink:0}}>{s.uv?s.uv.toLocaleString():"--"}</div>{d2!==null&&<div style={{width:50,color:d2>=0?"#10B981":"#EF4444",fontSize:11,textAlign:"right",flexShrink:0}}>{d2>=0?"▲":"▼"}{Math.abs(d2).toLocaleString()}</div>}</div>);});})()}</div>
      <div style={{background:"#0f172a",borderRadius:14,padding:16,border:"1px solid #1e293b"}}><div style={{color:"#f1f5f9",fontWeight:800,fontSize:13,marginBottom:12}}>📈 本周评级分布</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{RATING_OPTIONS.map(r=>{const cnt=filt.filter(s=>{const d=weekData[s.opId+"__"+TW];return d?.records?.[s.id]?.rating===r;}).length;return(<div key={r} style={{background:RATING_COLORS[r]+"22",border:"1px solid "+RATING_COLORS[r]+"44",borderRadius:10,padding:"9px 12px",textAlign:"center",minWidth:48}}><div style={{color:RATING_COLORS[r],fontWeight:900,fontSize:15}}>{r}</div><div style={{color:"#94a3b8",fontSize:17,fontWeight:700}}>{cnt}</div><div style={{color:"#475569",fontSize:10}}>人</div></div>);})}<div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"9px 12px",textAlign:"center",minWidth:48}}><div style={{color:"#64748B",fontWeight:900,fontSize:15}}>-</div><div style={{color:"#94a3b8",fontSize:17,fontWeight:700}}>{filt.filter(s=>{const d=weekData[s.opId+"__"+TW];return !d?.records?.[s.id]?.rating;}).length}</div><div style={{color:"#475569",fontSize:10}}>未填</div></div></div></div>
    </>)}
  </div>);
}

function WeeklyView({weekKey,myStreamers}){
  const[data,setData]=useState({});const[teamNote,setTeamNote]=useState({good:"",issue:""});const[saving,setSaving]=useState(false);const[saved,setSaved]=useState(false);const[loading,setLoading]=useState(false);
  useEffect(()=>{if(!weekKey)return;setLoading(true);setData({});setTeamNote({good:"",issue:""});dbGet(weekKey).then(d=>{if(d){setData(d.records||{});setTeamNote(d.teamNote||{good:"",issue:""});}setLoading(false);});},[weekKey]);
  const upd=(sid,f,v)=>setData(p=>({...p,[sid]:{...(p[sid]||EMPTY_REC()),[f]:v}}));
  const save2=async()=>{if(!weekKey)return;setSaving(true);await dbSet(weekKey,{records:data,teamNote,savedAt:new Date().toISOString()});setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2200);};
  const active=myStreamers.filter(s=>!s.deleted&&!s.deleteRequested);
  const grouped=DEFAULT_GROUPS.map(g=>({group:g,members:active.filter(s=>s.group===g)})).filter(g=>g.members.length>0);
  const tUV=active.reduce((sum,s)=>sum+(parseFloat(data[s.id]?.uv)||0),0);
  const lCnt=active.filter(s=>isLiveEnough(data[s.id]?.liveDuration)).length;
  const tH=active.reduce((sum,s)=>sum+(parseFloat(data[s.id]?.liveDuration)||0),0);
  const CD="#3B82F6",CC="#10B981",CR="#8B5CF6";
  if(!weekKey)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:380,color:"#334155"}}><div style={{textAlign:"center"}}><div style={{fontSize:46,marginBottom:12}}>📅</div><div style={{fontSize:17,fontWeight:700,color:"#475569",marginBottom:6}}>请先选择复盘周期</div></div></div>);
  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#475569"}}><div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>⏳</div><div>加载中...</div></div></div>);
  if(active.length===0)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:280,color:"#334155"}}><div style={{textAlign:"center"}}><div style={{fontSize:38,marginBottom:10}}>🎮</div><div style={{fontSize:14,fontWeight:700,color:"#475569"}}>当前运营暂无归属主播</div></div></div>);
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>{[{key:"good",l:"🔥 本周最值得全团队复用的内容动作",c:"#10B981"},{key:"issue",l:"⚠️ 本周需集中解决的共性问题",c:"#F59E0B"}].map(({key,l,c})=>(<div key={key} style={{background:"#0f172a",borderRadius:10,padding:13,border:"1px solid "+c+"33"}}><div style={{color:c,fontSize:11,fontWeight:700,marginBottom:6}}>{l}</div><textarea value={teamNote[key]} onChange={e=>setTeamNote(p=>({...p,[key]:e.target.value}))} placeholder="填写关键结论..." rows={2} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:12,resize:"none",outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/></div>))}</div>
    <div style={{display:"flex",gap:12,marginBottom:12,background:"#0f172a",borderRadius:10,padding:"11px 16px",border:"1px solid #1e293b",flexWrap:"wrap",alignItems:"center"}}>
      <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{color:"#64748B",fontSize:12}}>UV合计：</span><span style={{color:"#6366F1",fontWeight:800,fontSize:16}}>{tUV>0?tUV.toLocaleString():"--"}</span></div>
      <div style={{width:1,height:18,background:"#1e293b"}}/>
      <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{color:"#64748B",fontSize:12}}>开播（≥1h）：</span><span style={{color:"#10B981",fontWeight:800,fontSize:16}}>{lCnt}<span style={{color:"#334155",fontSize:12}}> / {active.length}</span></span></div>
      <div style={{width:1,height:18,background:"#1e293b"}}/>
      <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{color:"#64748B",fontSize:12}}>总时长：</span><span style={{color:"#F59E0B",fontWeight:800,fontSize:16}}>{tH>0?tH.toFixed(1):"--"}<span style={{color:"#334155",fontSize:12}}> h</span></span></div>
      <div style={{flex:1}}/>
      <button onClick={save2} disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 18px",background:saved?"#10B981":"#6366F1",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}><Ic n={saved?"check":"save"} s={13}/>{saving?"保存中...":saved?"已保存！":"保存本周复盘"}</button>
    </div>
    <div style={{overflowX:"auto",borderRadius:11,border:"1px solid #1e293b"}}>
      <table style={{borderCollapse:"collapse",minWidth:1820,width:"100%"}}>
        <thead>
          <tr><th style={TH("#060e1c","#475569",{width:28})}>#</th><th style={TH("#060e1c","#94a3b8",{width:90})}>昵称</th><th style={TH("#060e1c","#64748B",{width:98})}>抖音ID</th><th colSpan={DATA_FIELDS.length} style={TH(CD+"22",CD,{borderLeft:`2px solid ${CD}`})}>📊 核心数据</th><th colSpan={CONTENT_FIELDS.length} style={TH(CC+"22",CC,{borderLeft:`2px solid ${CC}`})}>🎙️ 内容复盘</th><th colSpan={CONCLUDE_FIELDS.length} style={TH(CR+"22",CR,{borderLeft:`2px solid ${CR}`})}>🔍 结论 & 计划</th><th style={TH("#ef444422","#ef4444",{minWidth:58})}>评级</th></tr>
          <tr><th colSpan={3} style={TH("#040c18")}></th>{DATA_FIELDS.map((f,i)=>(<th key={f.key} style={TH(CD+"0d","#93C5FD",{borderLeft:i===0?`2px solid ${CD}44`:undefined,minWidth:f.w})}>{f.short}</th>))}{CONTENT_FIELDS.map((f,i)=>(<th key={f.key} style={TH(CC+"0d","#6EE7B7",{borderLeft:i===0?`2px solid ${CC}44`:undefined,minWidth:f.w})}>{f.label}</th>))}{CONCLUDE_FIELDS.map((f,i)=>(<th key={f.key} style={TH(CR+"0d","#C4B5FD",{borderLeft:i===0?`2px solid ${CR}44`:undefined,minWidth:f.w})}>{f.label}</th>))}<th style={TH("#ef44440d","#FCA5A5")}></th></tr>
        </thead>
        <tbody>
          {grouped.map(({group,members})=>{const gc=GROUP_COLORS[group]||"#6366F1";return members.map((s,mi)=>{const rec=data[s.id]||EMPTY_REC();const bg=mi%2===0?"#080f1e":"#0a1628";const cell=(ex={})=>TD(bg,ex);const live=isLiveEnough(rec.liveDuration);const ta=(field,ph,isText=false)=>(<textarea value={rec[field]} onChange={e=>upd(s.id,field,e.target.value)} placeholder={ph} rows={isText?2:1} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:11,resize:"none",outline:"none",lineHeight:1.4,fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/>);return(<tr key={s.id}>{mi===0&&(<td rowSpan={members.length} style={{background:gc,color:"#fff",fontWeight:800,fontSize:11,textAlign:"center",writingMode:"vertical-rl",padding:"10px 5px",border:"1px solid #1e293b",letterSpacing:2}}>{group}</td>)}<td style={cell({fontWeight:700,color:"#f1f5f9",fontSize:11,whiteSpace:"nowrap"})}>{mi+1}. {s.name}</td><td style={cell({color:"#475569",fontSize:10})}>{s.tid}</td>{DATA_FIELDS.map((f,i)=>(<td key={f.key} style={cell({borderLeft:i===0?`2px solid ${CD}44`:undefined})}><div>{ta(f.key,f.ph)}{f.key==="liveDuration"&&live&&<div style={{color:"#10B981",fontSize:9,fontWeight:700}}>✓开播</div>}</div></td>))}{CONTENT_FIELDS.map((f,i)=>(<td key={f.key} style={cell({borderLeft:i===0?`2px solid ${CC}44`:undefined,verticalAlign:"top",padding:"5px 7px"})}>{ta(f.key,f.ph,true)}</td>))}{CONCLUDE_FIELDS.map((f,i)=>(<td key={f.key} style={cell({borderLeft:i===0?`2px solid ${CR}44`:undefined,verticalAlign:"top",padding:"5px 7px"})}>{ta(f.key,f.ph,true)}</td>))}<td style={cell({padding:"5px 4px"})}><select value={rec.rating} onChange={e=>upd(s.id,"rating",e.target.value)} style={{width:"100%",background:rec.rating?RATING_COLORS[rec.rating]:"#1e293b",border:"1px solid #334155",borderRadius:6,color:"#fff",padding:"3px 4px",fontSize:11,cursor:"pointer",fontWeight:700,fontFamily:"'Noto Sans SC',sans-serif"}}><option value="">-</option>{RATING_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></td></tr>);});})}
        </tbody>
      </table>
    </div>
  </div>);
}

function MonthlyView({operators,streamers,allWeeks,currentOpId}){
  const myS=streamers.filter(s=>s.opId===currentOpId&&!s.deleted&&!s.deleteRequested);const curOp=operators.find(o=>o.id===currentOpId);
  const now=new Date();const[month,setMonth]=useState(`${now.getFullYear()}年${now.getMonth()+1}月`);const[wData,setWData]=useState({});const[mRec,setMRec]=useState({summary:{best:"",help:"",method:"",next:""},teamNote:{good:"",issue:""}});const[saving,setSaving]=useState(false);const[saved,setSaved]=useState(false);
  const match=month.match(/(\d+)年(\d+)月/);const[,my,mm]=(match||[]).map(Number).concat([0,0]);
  const mWeeks=allWeeks.filter(w=>{const mo=parseInt((w.split(" - ")[0]||"").split(".")[0]);return mo===mm;});
  useEffect(()=>{if(!mWeeks.length||!curOp)return;Promise.all(mWeeks.map(w=>dbGet(getWeekKey(currentOpId,w)).then(d=>[w,d]))).then(res=>{const obj={};res.forEach(([w,d])=>{obj[w]=d;});setWData(obj);});dbGet(getMonthKey(currentOpId,month)).then(d=>{if(d)setMRec(d);});},[month,allWeeks.length,currentOpId]);
  const saveM=async()=>{setSaving(true);await dbSet(getMonthKey(currentOpId,month),{...mRec,savedAt:new Date().toISOString()});setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2200);};
  const avg=(recs,f)=>{const vs=recs.map(r=>parseFloat(r[f])||0).filter(v=>v>0);return vs.length?Math.round(vs.reduce((a,b)=>a+b)/vs.length):"-";};
  const sum=(recs,f)=>recs.map(r=>parseFloat(r[f])||0).reduce((a,b)=>a+b,0);
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}><MonthPicker value={month} onChange={setMonth}/><span style={{color:"#334155",fontSize:12}}>共 {mWeeks.length} 个周期</span><button onClick={saveM} disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",background:saved?"#10B981":"#6366F1",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Noto Sans SC',sans-serif",marginLeft:"auto"}}><Ic n={saved?"check":"save"} s={13}/>{saving?"保存中...":saved?"已保存！":"保存月报"}</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>{[{key:"good",l:"本月最值得复用的内容动作",c:"#10B981"},{key:"issue",l:"本月需集中解决的共性问题",c:"#F59E0B"}].map(({key,l,c})=>(<div key={key} style={{background:"#0f172a",borderRadius:10,padding:13,border:"1px solid "+c+"33"}}><div style={{color:c,fontSize:11,fontWeight:700,marginBottom:6}}>{l}</div><textarea value={mRec.teamNote?.[key]||""} onChange={e=>setMRec(p=>({...p,teamNote:{...p.teamNote,[key]:e.target.value}}))} placeholder="填写关键结论..." rows={2} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:12,resize:"none",outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/></div>))}</div>
    <div style={{background:"#0f172a",borderRadius:12,padding:18,marginBottom:14,border:"1px solid #1e293b"}}><div style={{color:"#6366F1",fontWeight:700,fontSize:13,marginBottom:12}}>本月各周索引</div>{mWeeks.length===0?<div style={{color:"#334155",fontSize:13}}>本月暂无数据</div>:mWeeks.map(w=>{const d=wData[w];return(<div key={w} style={{display:"grid",gridTemplateColumns:"160px 1fr 1fr",gap:10,padding:"10px 0",borderBottom:"1px solid #1e293b",alignItems:"start"}}><div style={{color:"#6366F1",fontWeight:700,fontSize:12}}>{w}</div><div><div style={{color:"#10B981",fontSize:11,marginBottom:3}}>本周亮点</div><div style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{d?.teamNote?.good||"暂未填写"}</div></div><div><div style={{color:"#F59E0B",fontSize:11,marginBottom:3}}>共性问题</div><div style={{color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{d?.teamNote?.issue||"暂未填写"}</div></div></div>);})}</div>
    {mWeeks.length>0&&(<div style={{marginBottom:14,overflowX:"auto",borderRadius:11,border:"1px solid #1e293b"}}><table style={{borderCollapse:"collapse",minWidth:650,width:"100%"}}><thead><tr><th style={TH("#0a1628","#64748B",{textAlign:"left",padding:"9px 11px",whiteSpace:"nowrap"})}>主播</th>{mWeeks.map(w=>(<th key={w} colSpan={4} style={TH("#3B82F611","#93C5FD")}>{w}</th>))}<th colSpan={3} style={TH("#6366F122","#C4B5FD")}>月均/合计</th></tr><tr><th style={TH("#060e1c","#334155",{textAlign:"left",padding:"5px 11px"})}></th>{mWeeks.map(w=>["UV","ACU","粉增","开播h"].map(l=>(<th key={w+l} style={TH("#3B82F606","#475569",{fontSize:10})}>{l}</th>)))}{["月均UV","月均ACU","总粉增"].map(l=>(<th key={l} style={TH("#6366F108","#6366F1",{fontSize:10})}>{l}</th>))}</tr></thead><tbody>{myS.map((s,i)=>{const bg=i%2===0?"#080f1e":"#0a1628";const recs=mWeeks.map(w=>wData[w]?.records?.[s.id]||EMPTY_REC());return(<tr key={s.id}><td style={{padding:"8px 11px",background:bg,color:"#f1f5f9",fontWeight:700,fontSize:12,border:"1px solid #0d1929",whiteSpace:"nowrap"}}>{s.name}</td>{mWeeks.map(w=>{const r=wData[w]?.records?.[s.id]||EMPTY_REC();return[r.uv,r.acu,r.fans,r.liveDuration].map((v,vi)=>(<td key={w+vi} style={{padding:"8px 7px",background:bg,color:v?"#93C5FD":"#1e293b",fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{v||"-"}</td>));})}<td style={{padding:"8px 7px",background:bg,color:"#C4B5FD",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{avg(recs,"uv")}</td><td style={{padding:"8px 7px",background:bg,color:"#C4B5FD",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{avg(recs,"acu")}</td><td style={{padding:"8px 7px",background:bg,color:"#6EE7B7",fontWeight:700,fontSize:12,border:"1px solid #0d1929",textAlign:"center"}}>{sum(recs,"fans")>0?`+${sum(recs,"fans")}`:"-"}</td></tr>);})}</tbody></table></div>)}
    <div style={{background:"#0f172a",borderRadius:12,padding:18,border:"1px solid #1e293b"}}><div style={{color:"#f1f5f9",fontWeight:700,fontSize:13,marginBottom:12}}>月度定性总结</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[{k:"best",l:"本月表现最佳主播（前3）",c:"#10B981"},{k:"help",l:"本月需重点帮扶主播",c:"#EF4444"},{k:"method",l:"本月内容方法论沉淀",c:"#8B5CF6"},{k:"next",l:"下月核心运营方向",c:"#F59E0B"}].map(({k,l,c})=>(<div key={k} style={{border:"1px solid "+c+"33",borderRadius:10,padding:13}}><div style={{color:c,fontSize:12,fontWeight:700,marginBottom:7}}>{l}</div><textarea value={mRec.summary?.[k]||""} onChange={e=>setMRec(p=>({...p,summary:{...p.summary,[k]:e.target.value}}))} placeholder="填写..." rows={4} style={{width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:12,resize:"none",outline:"none",fontFamily:"'Noto Sans SC',sans-serif",boxSizing:"border-box"}}/></div>))}</div></div>
  </div>);
}

export default function App(){
  const[operators,setOperators]=useState(DEFAULT_OPERATORS);const[streamers,setStreamers]=useState([]);const[currentOpId,setCurrentOpId]=useState(DEFAULT_OPERATORS[0].id);
  const[tab,setTab]=useState("dashboard");const[selectedWeek,setSelectedWeek]=useState("");const[selectedMonth,setSelectedMonth]=useState(()=>{const d=new Date();return `${d.getFullYear()}年${d.getMonth()+1}月`;});
  const[allWeeks,setAllWeeks]=useState([]);const[showManage,setShowManage]=useState(false);const[showImport,setShowImport]=useState(false);const[showAdminLogin,setShowAdminLogin]=useState(false);const[isAdmin,setIsAdmin]=useState(false);const[booting,setBooting]=useState(true);
  const logoTimer=useRef(null);
  const onLogoDown=()=>{logoTimer.current=setTimeout(()=>{if(!isAdmin)setShowAdminLogin(true);else setIsAdmin(false);},1500);};
  const onLogoUp=()=>{if(logoTimer.current)clearTimeout(logoTimer.current);};
  useEffect(()=>{
    Promise.all([dbGet("__operators__"),dbGet("__streamers__"),dbGet("__weeks_idx__")]).then(async([ops,strs,idx])=>{
      if(ops)setOperators(ops);
      if(strs){setStreamers(strs);}
      else{
        // First run: parse and save the 157 streamers
        const initStrs=parseStreamersCSV(STREAMER_CSV);
        await dbSet("__streamers__",initStrs);
        setStreamers(initStrs);
      }
      if(idx?.list)setAllWeeks(idx.list);
      setBooting(false);
    });
  },[]);
  const myStreamers=streamers.filter(s=>s.opId===currentOpId);
  const handleWeekSelect=useCallback(async w=>{setSelectedWeek(w);if(!allWeeks.includes(w)){const next=[...allWeeks,w].sort((a,b)=>{const p=s=>{const[mo,dy]=(s.split(" - ")[0]||"").split(".");return parseInt(mo)*100+parseInt(dy);};return p(b)-p(a);});setAllWeeks(next);await dbSet("__weeks_idx__",{list:next});}},[allWeeks]);
  const handleSaveManage=async(ops,strs)=>{setOperators(ops);setStreamers(strs);await dbSet("__operators__",ops);await dbSet("__streamers__",strs);setShowManage(false);if(!ops.find(o=>o.id===currentOpId))setCurrentOpId(ops[0]?.id||"");};
  const handleImport=async(rows,opId)=>{const newStrs=[...streamers];const weekKey=selectedWeek?getWeekKey(opId,selectedWeek):null;let wRec=weekKey?await dbGet(weekKey)||{records:{},teamNote:{good:"",issue:""}}:{records:{},teamNote:{good:"",issue:""}};rows.forEach(r=>{const ex=newStrs.find(s=>s.tid===r.tid||s.name===r.name);if(!ex)newStrs.push({id:r.id,name:r.name,tid:r.tid,phone:r.phone,realname:r.realname,group:r.group,opId,operator:operators.find(o=>o.id===opId)?.name||"",deleted:false,signDate:r.signDate||"",firstLiveDate:r.firstLiveDate||""});const sid=ex?.id||r.id;if(weekKey)wRec.records[sid]=r._weekData;});setStreamers(newStrs);await dbSet("__streamers__",newStrs);if(weekKey)await dbSet(weekKey,wRec);};
  const pdc=streamers.filter(s=>s.deleteRequested).length;
  const TABS=[{key:"dashboard",l:"📊 数据面板"},{key:"weekly",l:"📋 周复盘"},{key:"monthly",l:"📅 月复盘"},{key:"trend",l:"📈 趋势"}];
  if(booting)return(<div style={{minHeight:"100vh",background:"#020817",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:"#475569"}}><div style={{fontSize:40,marginBottom:16}}>⏳</div><div style={{fontSize:16,fontFamily:"'Noto Sans SC',sans-serif"}}>连接数据库中...</div></div></div>);
  return(<div style={{minHeight:"100vh",background:"#020817",fontFamily:"'Noto Sans SC',sans-serif",color:"#f1f5f9"}}>
    {showAdminLogin&&<AdminLoginModal onSuccess={()=>{setIsAdmin(true);setShowAdminLogin(false);}} onClose={()=>setShowAdminLogin(false)}/>}
    {showManage&&<ManageModal operators={operators} streamers={streamers} isAdmin={isAdmin} onClose={()=>setShowManage(false)} onSave={handleSaveManage}/>}
    {showImport&&<ImportModal operators={operators} currentOpId={currentOpId} onImport={handleImport} onClose={()=>setShowImport(false)}/>}
    <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)",borderBottom:"1px solid #1e293b",padding:"0 20px",position:"sticky",top:0,zIndex:50,boxShadow:"0 4px 24px rgba(0,0,0,0.45)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,height:54,flexWrap:"wrap"}}>
        <div onMouseDown={onLogoDown} onMouseUp={onLogoUp} onMouseLeave={onLogoUp} onTouchStart={onLogoDown} onTouchEnd={onLogoUp} style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,cursor:"pointer",userSelect:"none"}}>
          <div style={{width:30,height:30,borderRadius:8,background:isAdmin?"linear-gradient(135deg,#7C3AED,#4F46E5)":"linear-gradient(135deg,#6366F1,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff"}}>{isAdmin?<Ic n="shield" s={14}/>:"冰"}</div>
          <div><div style={{fontSize:12,fontWeight:900,color:"#f1f5f9",letterSpacing:.5}}>三冰主播团队</div><div style={{fontSize:9,color:isAdmin?"#A78BFA":"#475569",letterSpacing:1.5}}>{isAdmin?"管理员模式":"直播复盘系统"}</div></div>
        </div>
        <div style={{display:"flex",gap:2,padding:"3px",background:"#0f172a",borderRadius:9,border:"1px solid #1e293b",flexShrink:0,overflowX:"auto",maxWidth:"38vw"}}>
          {operators.map(op=>(<button key={op.id} onClick={()=>setCurrentOpId(op.id)} style={{padding:"4px 11px",borderRadius:7,border:"none",fontFamily:"'Noto Sans SC',sans-serif",background:currentOpId===op.id?op.color:"transparent",color:currentOpId===op.id?"#fff":"#64748B",cursor:"pointer",fontSize:12,fontWeight:currentOpId===op.id?700:400,whiteSpace:"nowrap"}}>{op.name}</button>))}
        </div>
        <div style={{display:"flex",gap:2,flex:1}}>
          {TABS.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"5px 12px",borderRadius:8,border:"none",background:tab===t.key?"#6366F1":"transparent",color:tab===t.key?"#fff":"#64748B",cursor:"pointer",fontSize:12,fontWeight:tab===t.key?700:400,fontFamily:"'Noto Sans SC',sans-serif",whiteSpace:"nowrap"}}>{t.l}</button>))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          {tab==="weekly"&&<WeekPicker value={selectedWeek} onChange={handleWeekSelect}/>}
          {tab==="monthly"&&<MonthPicker value={selectedMonth} onChange={setSelectedMonth}/>}
          <button onClick={()=>setShowImport(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}><Ic n="upload" s={12}/>导入</button>
          <button onClick={()=>setShowManage(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",background:pdc>0?"#7C3AED22":"#1e293b",border:"1px solid "+(pdc>0?"#7C3AED":"#334155"),borderRadius:8,color:pdc>0?"#C4B5FD":"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"'Noto Sans SC',sans-serif"}}><Ic n="settings" s={12}/>管理{pdc>0&&<span style={{background:"#EF4444",color:"#fff",borderRadius:10,fontSize:10,padding:"0 5px",fontWeight:700}}>{pdc}</span>}</button>
        </div>
      </div>
    </div>
    <div style={{padding:"16px 20px",maxWidth:1900,margin:"0 auto"}}>
      {tab==="dashboard"&&<Dashboard operators={operators} streamers={streamers.filter(s=>!s.deleted&&!s.deleteRequested)} allWeeks={allWeeks}/>}
      {tab==="weekly"&&<WeeklyView weekKey={selectedWeek?getWeekKey(currentOpId,selectedWeek):null} myStreamers={myStreamers}/>}
      {tab==="monthly"&&<MonthlyView operators={operators} streamers={streamers} allWeeks={allWeeks} currentOpId={currentOpId}/>}
      {tab==="trend"&&<div style={{textAlign:"center",padding:"80px 0",color:"#334155"}}><div style={{fontSize:40,marginBottom:12}}>📈</div><div style={{fontSize:15,fontWeight:600,color:"#475569"}}>趋势分析</div><div style={{fontSize:13,marginTop:8}}>积累几周数据后自动呈现</div></div>}
    </div>
  </div>);
}
