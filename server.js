const http=require('http'),fs=require('fs'),path=require('path'),WebSocket=require('ws');
const server=http.createServer((req,res)=>{let file=path.join(__dirname,req.url==='/'?'index.html':decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(__dirname)){res.writeHead(403).end();return}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end('Not found');return}res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});res.end(data)})});
const wss=new WebSocket.Server({server});const rooms=new Map();const code=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const BOT_NAME='Computer',BOT_DELAY=1400,BOT_ACCURACY=.55,DAMAGE=34;
function send(ws,data){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data))}function broadcast(room,data){for(const p of room.players)send(p.ws,data)}
function snapshot(room){return{turn:room.turn,hp:room.hp,positions:room.positions,players:room.players.map(p=>p.name),count:room.players.length}}
function pushState(room){broadcast(room,{type:'state',state:snapshot(room)})}
function newRoom(solo){return{id:'',players:[],turn:0,hp:[100,100],positions:[-20,20],busy:false,solo:!!solo,over:false,botTimer:null}}
function clearBotTimer(room){if(room.botTimer){clearTimeout(room.botTimer);room.botTimer=null}}
// The computer opponent plays a parabola from its position towards yours. It aims true 55% of the time.
function scheduleBot(room){if(!room.solo||room.botTimer||room.over||room.hp[0]<=0||room.hp[1]<=0)return;room.botTimer=setTimeout(()=>{room.botTimer=null;fireBot(room)},BOT_DELAY)}
function fireBot(room){const bot=room.players[1];if(!bot||!bot.bot||room.over||room.turn!==1||room.players.length<2)return;room.busy=true;
 const from=room.positions[1],target=room.positions[0],hit=Math.random()<BOT_ACCURACY,peak=6+Math.random()*4;
 const miss=Math.min(1,Math.max(-1,Math.random()<.5?-1:1))*(2.5+Math.random()*6);
 const landX=hit?target:Math.max(-24,Math.min(24,target+miss));
 const mid=(from+landX)/2,half=Math.abs(from-landX)/2||1,path=[];
 for(let i=0;i<=160;i++){const x=from+(landX-from)*i/160,t=(x-mid)/half;path.push({x:+x.toFixed(3),y:+(peak*(1-t*t)).toFixed(3)})}
 if(hit)room.hp[0]=Math.max(0,room.hp[0]-DAMAGE);
 room.turn=0;room.busy=false;const winner=room.hp[0]<=0?1:null;if(winner!==null)room.over=true;
 broadcast(room,{type:'shot',from:1,x:landX,y:0,path,hit,state:snapshot(room),winner})}
wss.on('connection',ws=>{ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}if(m.type==='join'){
 const name=String(m.name||'Player').slice(0,18)||'Player';let room,id=(m.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 if(m.solo){do{id=code()}while(rooms.has(id));room=newRoom(true);room.id=id;rooms.set(id,room);
  room.players.push({ws,name,index:0});room.players.push({ws:null,name:BOT_NAME,index:1,bot:true})}
 else{room=rooms.get(id);
  if(!room||room.solo||room.players.length>=2){if(m.code){send(ws,{type:'error',message:'Room not found or already full.'});return}do{id=code()}while(rooms.has(id));room=newRoom(false);room.id=id;rooms.set(id,room)}
  room.players.push({ws,name,index:room.players.length})}
 const player=room.players.find(p=>p.ws===ws);ws.room=room;ws.player=player;
 send(ws,{type:'joined',room:room.id,index:player.index,solo:room.solo,state:snapshot(room)});pushState(room);return}
 const room=ws.room,p=ws.player;if(!room||!p)return;if(m.type==='fire'){
 if(room.over){send(ws,{type:'error',message:'The match is over. Press New match to play again.'});return}
 if(room.players.length<2){send(ws,{type:'error',message:'Waiting for your friend to join.'});return}
 if(room.turn!==p.index||room.busy){send(ws,{type:'error',message:'Wait for your turn.'});return}
 room.busy=true;const x=Number(m.x),y=Number(m.y),target=room.positions[1-p.index];if(!Number.isFinite(x)||!Number.isFinite(y)){room.busy=false;return}
 const shotPath=Array.isArray(m.path)?m.path.slice(0,400).filter(q=>q&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&Math.abs(q.x)<=25&&Math.abs(q.y)<=15):[];
 const hit=Math.abs(x-target)<1.5&&Math.abs(y)<1.7;if(hit)room.hp[1-p.index]=Math.max(0,room.hp[1-p.index]-DAMAGE);
 room.turn=1-p.index;room.busy=false;const winner=room.hp[1-p.index]<=0?p.index:null;if(winner!==null)room.over=true;
 broadcast(room,{type:'shot',from:p.index,x,y,path:shotPath,hit,state:snapshot(room),winner});
 if(room.solo&&winner===null&&room.turn===1)scheduleBot(room)}});
 ws.on('close',()=>{const r=ws.room;if(!r)return;clearBotTimer(r);r.players=r.players.filter(p=>p.ws!==ws);if(!r.players.some(p=>!p.bot)){rooms.delete(r.id);return}pushState(r)})});
const port=Number(process.env.PORT)||4173;server.listen(port,'0.0.0.0',()=>console.log(`Arc & Angle running on ${port}`));
