window.onload = () => {
  alert('V1.2.9');
  if (getCookie('players') == '') {
    document.getElementById('addPlayer').textContent = 'Add Player (0)';
  } else {
    document.getElementById('addPlayer').textContent = `Add Player (${JSON.parse(getCookie('players')).length})`;
  }
  document.getElementById('landing').style.height = `${window.innerHeight}px`;
  document.getElementsByTagName('main')[0].style.height = `${window.innerHeight - 60}px`;
}

function loadAssets() {
  buildAssets(mainProperties);
  if (document.getElementsByName('expansions')[0].checked) {
    alert(0);
    buildAssets(planesAndTrains);
  }
  if (document.getElementsByName('expansions')[1].checked) {
    alert(1);
    buildAssets(space);
  }
  if (document.getElementsByName('expansions')[2].checked) {
    alert(2);
    buildAssets(america);
  }
}

function buildAssets(list) {
  for (let p of list) {
    let cont = buildElem('DIV','propCont',undefined,document.getElementsByClassName('page')[2]);
    let top = buildElem('DIV','propTop',undefined,cont);
    let group = buildElem('DIV','propGroup',undefined,top);
    group.style.backgroundColor = p.color;
    buildElem('DIV','propName',p.name,top);
  }
}

var players = [];
var gameSet = false;
var initBalance = 1e6;

function set() {
  gameSet = true;
  for (let e of document.getElementsByName('expansions')) {
    if (e.checked) {
      initBalance += Number(e.value);
    }
  }
  alert(initBalance);
  document.cookie = `init=${initBalance}`;
}

async function addPlayer() {
  if (!gameSet) {
    return;
  }
  document.getElementById('addPlayer').style.backgroundColor = 'steelblue';
  setTimeout(() => {
    document.getElementById('addPlayer').style.backgroundColor = 'rgb(234,234,234)';
  },500);
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = async event => {
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        card = JSON.parse(decoder.decode(record.data));
        alert(JSON.stringify(card));
        if (players.indexOf(card.id) != -1) {
          return;
        }
        players.push(card.id);
        document.cookie = `players=${JSON.stringify(players)}`;
        alert(getCookie('players'));
        document.getElementById('addPlayer').textContent = `Add Player (${JSON.parse(getCookie('players')).length})`;
      }
    }
  } else {
    alert('WTF');
  }
}

async function setBalance() {
  card.balance = initBalance;
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(card));
      alert(JSON.stringify(card));
      document.cookie = `${card.id}=${JSON.stringify(card)}`;
      card = null;
    } catch (error) {
      alert(error);
      card = null;
    }
  } else {
    alert('WTF');
  }
}

function startGame() {
  var start = prompt('Start Game?');
  if (start != null) {
    document.getElementById('landing').style.display = 'none';
    loadAssets();
  }
}

function clear() {
  document.cookie = 'players=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'init=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  if (getCookie('players') == '') {
    document.getElementById('addPlayer').textContent = 'Add Player (0)';
  } else {
    document.getElementById('addPlayer').textContent = `Add Player (${JSON.parse(getCookie('players')).length})`;
  }
}

async function scan() {
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.scan();
      ndef.onreading = event => {
        let decoder = new TextDecoder();
        for (let record of event.message.records) {
          log('Record type:' + record.recordType);
          log('Data:' + decoder.decode(record.data));
        }
      }
    } catch(error) {
      log(error);
    }
  } else {
    log('Web NFC is not supported.');
  }
}

async function writex() {
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write('What Web Can Do Today');
      log('NDEF message written!');
    } catch(error) {
      log(error);
    }
  } else {
    log('Web NFC is not supported.');
  }
}

function log(str) {
  let span = document.createElement('SPAN');
  span.textContent = str;
  span.style.color = 'white';
  document.body.append(span);
  document.body.append(document.createElement('BR'));
}

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length,c.length);
    }
  }
  return "";
}

function uniq(a) {
  var prims = {'boolean':{},'number':{},'string':{}}, objs = [];
  return a.filter(function(item) {
    var type = typeof item;
    if (type in prims) {
      return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
    } else {
      return objs.indexOf(item) >= 0 ? false : objs.push(item);
    }
  });
}

function page(num) {
  var pages = document.getElementsByClassName('page');
  for (let e of pages) {
    e.style.display = 'none';
  }
  pages[num].style.display = 'block';
}

function buildElem(tag,group,text,parent) {
  tag = tag.toLowerCase();
  var ns = false;
  if (tag == 'svg' || tag == 'path' || tag == 'title') {
    ns = true;
    var elem = document.createElementNS('http://www.w3.org/2000/svg',tag.toLowerCase());
    if (tag == 'svg' && text) {
      elem.setAttribute('viewBox',text);
    } else if (tag == 'path') {
      elem.setAttribute('d',text);
    } else {
      elem.textContent = text;
    }
  } else {
    var elem = document.createElement(tag);
  }
  if (group) {
    if (typeof group == 'string') {
      elem.classList.add(group);
    } else {
      for (let g of group) {
        elem.classList.add(g);
      }
    }
  }
  if (text != undefined && tag != 'img' && !ns) {
    elem.textContent = text;
  } else if (text && !ns) {
    elem.src = text;
  }
  if (parent) {
    parent.append(elem);
  }
  return elem;
}
