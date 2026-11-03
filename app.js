$(function () {
  const rooms = [
    { id: 'balcony', name: 'Balcony', floor: 2, accent: '#78a9c8', guests: [
      guest('Aigerim','green','20:45',true,['cup','crumbs']), guest('Aliya','yellow','21:15',false,['phone','cup']), guest('Madina','green','22:10',false,['phone','bag','crumbs']), guest('Ivan','black','20:10',true,['cup'])
    ]},
    { id: 'hall', name: 'Hall', floor: 2, accent: '#d4a34c', guests: [
      guest('Arman','yellow','20:35',false,['bag','glasses']), guest('Sophia','purple','21:20',true,['phone']), guest('Dias','green','19:45',true,['phone']), guest('Bekzat','black','20:55',false,['bag','cup','crumbs']), guest('Aruzhan','blue','21:50',true,['phone']), guest('Saule','green','21:25',false,['glasses'])
    ]},
    { id: 'kitchen', name: 'Kitchen', floor: 1, accent: '#d47a65', guests: [
      guest('Nurlan','red','19:40',true,['phone','cup']), guest('Emma','black','20:15',false,['bag']), guest('Timur','green','21:05',true,['phone','bag','crumbs']), guest('Sergey','yellow','20:50',false,[]), guest('Yerlan','red','21:40',true,['glasses','phone']), guest('Kamila','green','20:05',false,['cup'])
    ]},
    { id: 'living-room', name: 'Living room', floor: 1, accent: '#70a47d', guests: [
      guest('Daniel','blue','19:55',true,['glasses']), guest('Zarina','green','21:10',false,['bag','phone','crumbs']), guest('Natasha','yellow','20:30',true,[]), guest('Askar','black','21:00',true,['phone']), guest('Inkar','purple','20:20',false,['bag'])
    ]}
  ];
  const icon = { phone:'📱', glasses:'👓', bag:'👜', cup:'☕', crumbs:'🍰' };
  function guest(name,color,time,aitu,items){ return {name,color,time,aitu,items,roomId:''}; }
  rooms.forEach(room => room.guests.forEach(g => g.roomId=room.id));
  const initialOrder = new Map(rooms.map(r => [r.id, r.guests.map(g=>g.name)]));
  const baseParty = rooms.map(r=>({id:r.id,guests:r.guests.map(g=>({...g,items:[...g.items]}))}));

  function renderHouse() {
    const $house = $('#house').empty();
    [2,1].forEach(floor => rooms.filter(r=>r.floor===floor).forEach(room => {
      const $room = $('<section>').addClass('room').attr({'data-room':room.id,'data-floor':room.floor}).css('--room-accent',room.accent);
      const $top = $('<div class="room-top">').append($('<div>').append($('<h3>').text(room.name),$('<small>').text(`Floor ${room.floor} · ${room.guests.length} guests`)));
      $top.append($('<button type="button" class="sort-button">').text('Sort by time').attr('aria-label',`Sort ${room.name} by time`));
      const $list = $('<div class="guest-list">').attr('data-list',room.id);
      room.guests.forEach(g => $list.append(makeCard(g)));
      $room.append($top,$list); $house.append($room);
    }));
  }
  function makeCard(g) {
    const $card = $('<button type="button" class="guest">').attr({
      'data-name':g.name,'data-color':g.color,'data-time':g.time,'data-aitu':String(g.aitu),'data-items':g.items.join(','),'data-room':g.roomId,
      'aria-label':`${g.name}, arrived ${g.time}${g.aitu?', AITU student':''}`
    }).addClass(`color-${g.color}${g.aitu?' aitu':''}`).css('--guest-color',`var(--${g.color})`);
    const $avatar = $('<img class="avatar" alt="">').attr('src',`https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(g.name)}`).on('error',function(){$(this).replaceWith($('<span class="avatar avatar-fallback">').text(g.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2)));});
    const $avatarWrap = $('<span class="avatar-wrap">').append($avatar);
    if(g.aitu) $avatarWrap.append('<span class="student-mark" aria-label="AITU student">✦</span>');
    $card.append($avatarWrap,$('<span class="guest-name">').text(g.name),$('<span class="guest-time">').text(`◷ ${g.time}`),$('<span class="guest-items">').text(g.items.map(x=>icon[x]).join(' ')));
    return $card;
  }
  const cases = [
    {q:'Who is in the hall?', kind:'guests', chain:()=>$('.guest').filter(function(){return $(this).closest('.room').is('[data-room="hall"]');})},
    {q:'Who is dressed in yellow or purple?',kind:'guests',chain:()=>$('.guest.color-yellow, .guest.color-purple')},
    {q:'Which AITU students are upstairs?',kind:'guests',chain:()=>$('.room[data-floor="2"] .guest.aitu')},
    {q:'Who has glasses or a bag?',kind:'guests',chain:()=>$('.guest').filter(function(){const a=($(this).attr('data-items')||'').split(',');return a.includes('glasses')||a.includes('bag');})},
    {q:'Who came with nothing at all?',kind:'guests',chain:()=>$('.guest[data-items=""]')},
    {q:'Who has a phone but no bag?',kind:'guests',chain:()=>$('.guest').filter(function(){const a=($(this).attr('data-items')||'').split(',');return a.includes('phone')&&!a.includes('bag');})},
    {q:'Who arrived from 20:30 to 21:00, inclusive?',kind:'guests',chain:()=>$('.guest').filter(function(){const t=$(this).attr('data-time');return t>='20:30'&&t<='21:00';})},
    {q:'Who arrived after 21:00 and is not an AITU student?',kind:'guests',chain:()=>$('.guest').filter(function(){return $(this).attr('data-time')>'21:00'&&$(this).attr('data-aitu')==='false';})},
    {q:'Who stands right next to Askar?',kind:'guests',chain:()=>$('.guest[data-name="Askar"]').prev().add($('.guest[data-name="Askar"]').next())},
    {q:'Who stands last in each room?',kind:'guests',chain:()=>$('.guest-list .guest:last-child')},
    {q:'Who stands third in each room?',kind:'guests',chain:()=>$('.guest-list .guest:nth-child(3)')},
    {q:'Who stands after Timur in his room?',kind:'guests',chain:()=>$('.guest[data-name="Timur"]').nextAll('.guest')},
    {q:'Who stands right before someone in black?',kind:'guests',chain:()=>$('.guest.color-black').prev('.guest')},
    {q:'In which room is Aruzhan?',kind:'rooms',chain:()=>$('.guest[data-name="Aruzhan"]').closest('.room')},
    {q:'Which rooms have fewer than 6 guests?',kind:'rooms',chain:()=>$('.room').filter(function(){return $(this).find('.guest').length<6;})},
    {q:'Which rooms have a cup but nobody wears glasses?',kind:'rooms',chain:()=>$('.room').filter(function(){const $r=$(this);return $r.find('.guest').filter(function(){return ($(this).attr('data-items')||'').split(',').includes('cup');}).length>0&&$r.find('.guest').filter(function(){return ($(this).attr('data-items')||'').split(',').includes('glasses');}).length===0;})},
    {q:'Who came first to each room?',kind:'guests',chain:()=>$('.guest').filter(function(){const $card=$(this),$list=$card.closest('.guest-list'), times=$list.find('.guest').map(function(){return $(this).attr('data-time');}).get();return $card.attr('data-time')===times.sort()[0];})},
    {q:'Miras joins Askar and Inkar at 21:20.',kind:'mutation',chain:()=>$('.guest[data-name="Miras"]')},
    {q:'Natasha says goodbye and goes home.',kind:'mutation',chain:()=>$('.guest[data-name="Natasha"]')},
    {q:'Who matches the cake thief clues?',kind:'guests',chain:()=>$('.guest').filter(function(){const $g=$(this),items=($g.attr('data-items')||'').split(','),$room=$g.closest('.room');const beside=$g.prev('.guest').add($g.next('.guest'));return $room.attr('data-floor')==='1'&&$g.attr('data-time')>'21:00'&&$g.attr('data-time')<'21:30'&&items.includes('crumbs')&&!items.includes('cup')&&beside.filter('.aitu').length>0;})}
  ];
  cases.forEach((c,i)=>$('#case-list').append($('<button type="button" class="case-button">').attr('data-case',i+1).append($('<b>').text(i+1),document.createTextNode(c.q))));
  renderHouse();

  function clearSpotlight(){ $('.guest').stop(true,true).fadeTo(180,1).removeClass('spotlit');$('.room').removeClass('spotlit-room'); }
  function reportCase(n,$found){
    const c=cases[n-1];$('.case-button').removeClass('active');$(`.case-button[data-case="${n}"]`).addClass('active');clearSpotlight();
    let label='';
    if(c.kind==='rooms'){
      const ids=$found.map(function(){return $(this).attr('data-room');}).get();$('.room').each(function(){if(ids.includes($(this).attr('data-room')))$(this).addClass('spotlit-room');else $(this).find('.guest').stop(true,true).fadeTo(300,.2);});
      label=$found.map(function(){return $(this).find('h3').text();}).get().join(', ')||'No rooms';
    }else{
      const $cards=$found.filter('.guest');$('.guest').not($cards).stop(true,true).fadeTo(300,.2);$cards.addClass('spotlit').each(function(){const $g=$(this);$g.stop(true,true).animate({top:'-10px'},130).animate({top:'0px'},180);});
      label=$cards.map(function(){return $(this).attr('data-name');}).get().join(', ')||'No guests';
      if(c.kind==='mutation')label=n===18?'Miras joined the living room between Askar and Inkar.':'Natasha left the party.';
    }
    $('#case-result').empty().append($('<strong>').text(n===20&&$found.length>1?'Two guests match the clues:':`Case ${n} · ${$found.length} ${c.kind==='rooms'?'room':'guest'}${$found.length===1?'':'s'}`),$('<small>').text(label));
    $('#status').text(n===20&&$found.length>1?'The clues identify two possible guests.':`Case ${n} complete.`);
  }
  function rebuild(){ $('#guest-popover').hide().attr('aria-hidden','true');renderHouse(); }
  $('#case-list').on('click','.case-button',function(){
    const n=Number($(this).attr('data-case'));rebuild();
    if(n===18){rooms.forEach(r=>r.guests=r.guests.filter(g=>g.name!=='Miras'));const room=rooms.find(r=>r.id==='living-room'),m=guest('Miras','blue','21:20',true,['phone']);m.roomId=room.id;const i=room.guests.findIndex(g=>g.name==='Inkar');room.guests.splice(i,0,m);const $card=makeCard(m).hide();$(`[data-list="${room.id}"] .guest[data-name="Inkar"]`).before($card);$card.fadeIn(550);}
    if(n===19){const $natasha=$('.guest[data-name="Natasha"]');$natasha.stop(true,true).fadeOut(400,function(){rooms.forEach(r=>r.guests=r.guests.filter(g=>g.name!=='Natasha'));$(this).remove();});}
    const $found=cases[n-1].chain();reportCase(n,$found);
  });
  $('#clear-spotlight').on('click',function(){clearSpotlight();$('.case-button').removeClass('active');$('#case-result').text('Spotlight cleared. Every guest is visible again.');$('#status').text('Choose a case or select a guest.');});
  $('#reset-party').on('click',function(){baseParty.forEach(base=>{const r=rooms.find(x=>x.id===base.id);r.guests=base.guests.map(g=>({...g,items:[...g.items],roomId:r.id}));});renderHouse();clearSpotlight();$('.case-button').removeClass('active');$('#case-result').text('The original party is back.');$('#status').text('Choose a case or select a guest.');});

  let openedGuest=null;
  function closePopover(){const $p=$('#guest-popover'),closing=openedGuest;if(!$p.is(':visible'))return;$p.stop(true,true).animate({opacity:0, width:'150px'},120,function(){if(openedGuest===closing){$p.hide().attr('aria-hidden','true').empty().css({opacity:1,width:''});openedGuest=null;}});}
  $('#house').on('click','.guest',function(e){e.stopPropagation();const g=rooms.flatMap(r=>r.guests).find(x=>x.name===$(this).attr('data-name'));if(!g)return;if(openedGuest===$(this).attr('data-name')){closePopover();return;}closePopover();openedGuest=g.name;
    const $p=$('#guest-popover').stop(true,true).empty().css({left:Math.min(e.clientX+12,window.innerWidth-265),top:Math.min(e.clientY+10,window.innerHeight-260),width:150,opacity:0}).show().attr('aria-hidden','false');
    $p.append($('<h3>').text(g.name),$('<p>').text(`Came at ${g.time}`),$('<p>').text(g.aitu?'AITU student':'Not an AITU student'),$('<p>').text(g.items.length?`Has ${g.items.map(x=>({phone:'a phone',glasses:'glasses',bag:'a bag',cup:'a cup',crumbs:'cake crumbs'}[x])).join(' and ')}`:'Has nothing with them'));
    const $actions=$('<div class="move-actions">');rooms.filter(r=>r.id!==g.roomId).forEach(r=>$actions.append($('<button type="button" class="move-guest">').attr('data-destination',r.id).text(`Move to ${r.name}`)));$p.append($actions).stop(true,true).animate({opacity:1,width:'245px'},220);
  });
  $(document).on('keydown',e=>{if(e.key==='Escape')closePopover();});
  $(document).on('click',e=>{if(!$(e.target).closest('#guest-popover').length)closePopover();});
  function animateReorder($list){const before=new Map();$list.find('.guest').each(function(){before.set(this,$(this).offset());});$list.children('.guest').each(function(){ $(this).stop(true,true); });$list.children('.guest').each(function(){const old=before.get(this);if(!old)return;const now=$(this).offset();$(this).css({position:'relative',left:old.left-now.left,top:old.top-now.top}).animate({left:0,top:0},420,function(){$(this).css({position:'',left:'',top:''});});});}
  $('#house').on('click','.sort-button',function(){const $list=$(this).closest('.room').find('.guest-list'),id=$list.attr('data-list'),r=rooms.find(x=>x.id===id);$(this).stop(true,true);const sorted=$(this).attr('data-sorted')!=='true';if(sorted)r.guests.sort((a,b)=>a.time.localeCompare(b.time));else r.guests.sort((a,b)=>initialOrder.get(id).indexOf(a.name)-initialOrder.get(id).indexOf(b.name));$(this).attr('data-sorted',String(sorted));const oldOffsets=new Map();$list.find('.guest').each(function(){oldOffsets.set($(this).attr('data-name'),$(this).offset());});const $cards=$list.children('.guest').detach();r.guests.forEach(g=>$list.append($cards.filter(`[data-name="${g.name}"]`)));$list.children('.guest').each(function(){const old=oldOffsets.get($(this).attr('data-name')),now=$(this).offset();if(old)$(this).css({position:'relative',left:old.left-now.left,top:old.top-now.top}).stop(true,true).animate({left:0,top:0},420,function(){$(this).css({position:'',left:'',top:''});});});});
  $('#guest-popover').on('click','.move-guest',function(e){e.stopPropagation();const name=openedGuest,dest=$(this).attr('data-destination'),g=rooms.flatMap(r=>r.guests).find(x=>x.name===name),old=rooms.find(r=>r.id===g.roomId),next=rooms.find(r=>r.id===dest);const $card=$(`.guest[data-name="${name}"]`),start=$card.offset(),$clone=$card.clone().addClass('flying').css({position:'fixed',left:start.left,top:start.top,width:$card.outerWidth(),margin:0,zIndex:30}).appendTo('body');const $slot=$('<span class="empty-slot">').insertAfter($card);$card.stop(true,true).fadeOut(180,function(){$(this).remove();$slot.animate({width:0},260,function(){$(this).remove();});});old.guests=old.guests.filter(x=>x!==g);g.roomId=next.id;next.guests.push(g);const $targetList=$(`[data-list="${next.id}"]`),$new=makeCard(g).css({opacity:0});$targetList.append($new);const destOffset=$new.offset();$new.css('opacity',1);$clone.stop(true,true).animate({left:destOffset.left,top:destOffset.top,width:$new.outerWidth()},500,function(){$(this).remove();});$new.hide().fadeIn(300);$(`.room[data-room="${old.id}"] .room-top small`).text(`Floor ${old.floor} · ${old.guests.length} guests`);$(`.room[data-room="${next.id}"] .room-top small`).text(`Floor ${next.floor} · ${next.guests.length} guests`);closePopover();$('#status').text(`${name} moved to the ${next.name}.`);});
});
