window.onload = () => {
  alert('V2.0.4');
  document.getElementsByTagName('main')[0].style.height = `${window.innerHeight - 60}px`;
}

window.onresize = () => {
  document.getElementsByTagName('main')[0].style.height = `${window.innerHeight - 60}px`;
}

var players = [];
var gameSet = false;
var initBalance = 1e6;
var bankCard;
var propsLoaded = false;
var propReset;
var bank = false;
var transCard;
var inProgress = false;
var dvlptProp;
var dvlptPrice;
var dvlptCard;
var launched = false;
var track;
//var writing = false;

function loadAssets(arr) {
  buildAssets(mainProperties);
  if (arr[0]) {
    buildAssets(planesAndTrains);
  }
  if (arr[1]) {
    buildAssets(space);
  }
  if (arr[2]) {
    buildAssets(america);
  }
}

function buildAssets(list) {
  for (let p of list) {
    let cont = buildElem('DIV','propCont',undefined,document.getElementsByClassName('page')[2]);
    cont.id = `prop${p.abbr}`;
    let top = buildElem('DIV','propTop',undefined,cont);
    let group = buildElem('DIV','propGroup',undefined,top);
    group.style.backgroundColor = p.color;
    buildElem('DIV','propName',p.name,top);
    let d = 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z';
    let more = buildElem('SVG','propMore','0 0 24 24',top);
    more.addEventListener('click',function() { this.parentElement.nextElementSibling.classList.toggle('show'); } );
    buildElem('PATH',undefined,d,more);
    let grid = buildElem('DIV','propGrid',undefined,cont);
    if (p.house && p.hotel) {
      var titles = ['Group:','Price:','House:','Hotel:'];
      var values = [p.group,rt(p.price),rt(p.house),rt(p.hotel)];
    } else {
      var titles = ['Group:','Price:'];
      var values = [p.group,rt(p.price)];
    }
    if (p.rent) {
      titles = titles.concat(['Rent:','1 House:','2 Houses:','3 Houses:','4 Houses:','Hotel:']);
      values = values.concat([rt(p.rent[0]),rt(p.rent[1]),rt(p.rent[2]),rt(p.rent[3]),rt(p.rent[4]),rt(p.rent[5])]);
    }
    for (let i = 0; i < titles.length; i++) {
      buildElem('DIV','propCell',titles[i],grid);
      buildElem('DIV','propCell',values[i],grid);
    }
  }
}

function set() {
  gameSet = true;
  for (let e of document.getElementsByName('expansions')) {
    if (e.checked) {
      initBalance += Number(e.value);
    }
  }
  alert(initBalance);
  document.getElementById('set').style.backgroundColor = 'rgb(64,64,64)';
}

async function scanCard() {
  if (launched) {
    return;
  }
  launched = true;
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      // if (writing) {
      //   return;
      // }
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        let card = JSON.parse(decoder.decode(record.data));
        alert(track);
        if (track == 'setup') {
          return initCard(card);
        } else if (track == 'reset') {
          return initProp(card);
        } else if (track == 1 || track == -1) {
          return startYes(card);
        } else if (track == 'dvlpt') {
          return loadProp(card);
        } else if (track == 'dvlpt2') {
          return grabCard(card);
        }
        if (card.id == 'bank') {
          try {
            let key = prompt('Enter Code:');
            if (key == cipher(card.key)) {
              document.getElementsByClassName('tab')[4].style.display = 'flex';
              document.getElementsByClassName('tab')[5].style.display = 'flex';
              bank = true;
            } else {
              alert('Incorrect Code: ' + cipher(card.key));
            }
          } catch (error) {
            alert(error);
          }
        } else if (card.id) {
          document.getElementById('scanId').textContent = capFirst(card.id);
          document.getElementById('scanBalance').textContent = `$${numberWithCommas(card.balance)}`;
          if (!propsLoaded) {
            propsLoaded = true;
            loadAssets([card.planes,card.space,card.america]);
          }
        } else if (card.abbr) {
          page(2);
          document.getElementById('scanId').textContent = `Abbreviation: ${card.abbr}`;
          document.getElementById('scanBalance').textContent = `Development: Level ${card.dvlpt}`;
          document.getElementById(`prop${card.abbr}`).scrollIntoView();
          document.getElementById(`prop${card.abbr}`).children[1].classList.add('show');
        }
      }
    }
  } else {
    alert('WTF');
  }
}

function initCard(card) {
  alert('init card');
  bankCard = card;
  bankCard.planes = document.getElementsByName('expansions')[0].checked;
  bankCard.space = document.getElementsByName('expansions')[1].checked;
  bankCard.america = document.getElementsByName('expansions')[2].checked;
  let d = new Date();
  bankCard.unix = d.getTime();
}

async function finalizeCard() {
  //writing = true;
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(bankCard));
      bankCard = null;
      track = undefined;
      //writing = false;
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

function initProp(card) {
  alert('init prop');
  propReset = card;
  propReset.dvlpt = 0;
}

async function finalizeProp() {
  //writing = true;
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(propReset));
      propReset = null;
      track = undefined;
      //writing = false;
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

function startTrans() {
  var amount = Math.round(Number(document.getElementById('transAmount').value) / 1e3) * 1e3;
  if (amount < 1e3 || amount > 1e7) {
    return;
  }
  document.getElementById('amountInput').style.display = 'none';
  document.getElementById('message').style.display = 'block';
  document.getElementById('message').textContent = 'Hand phone to other person';
  document.getElementById('confirmAmount').textContent = rt(amount / 1e3);
  setTimeout(() => {
    document.getElementById('message').style.display = 'none';
    document.getElementById('confirm').style.display = 'block';
  },3000);
}

function no() {
  document.getElementById('confirm').style.display = 'none';
  document.getElementById('message').textContent = 'Hand phone back';
  document.getElementById('message').style.display = 'block';
  setTimeout(() => {
    document.getElementById('message').style.display = 'none';
    document.getElementById('amountInput').style.display = 'flex';
  },3000);
}

function yes() {
  document.getElementById('confirm').style.display = 'none';
  document.getElementById('message').textContent = 'Scan Card';
  document.getElementById('message').style.display = 'block';
}

function startYes(card) {
  alert('start yes');
  transCard = card;
  transCard.balance = Number(transCard.balance);
  if (transCard.balance < Number(document.getElementById('transAmount').value) && track == -1) {
    document.getElementById('message').textContent = 'Insufficient Funds';
    setTimeout(() => {
      document.getElementById('message').style.display = 'none';
      document.getElementById('amountInput').style.display = 'flex';
    },5000);
    return;
  }
  if (transCard.id == 'bank' && !bank) {
    document.getElementById('message').style.display = 'none';
    document.getElementById('amountInput').style.display = 'flex';
    return;
  }
  transCard.balance += track * Number(document.getElementById('transAmount').value);
  transCard.balance = String(transCard.balance);
  document.getElementById('message').textContent = 'Wait to Scan Again';
  setTimeout(finishYes,1000);
}

async function finishYes() {
  //writing = true;
  inProgress = false;
  document.getElementById('message').textContent = 'Scan Again';
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    if (inProgress) {
      return;
    }
    inProgress = true;
    await ndef.write(JSON.stringify(transCard));
    //writing = false;
    transCard = null;
    inProgress = false;
    if (track == -1) {
      document.getElementById('message').textContent = 'Hand Phone Back';
      setTimeout(function() { track = 1; },3000);
    } else {
      document.getElementById('message').textContent = 'Transaction Done';
      setTimeout(() => {
        document.getElementById('message').style.display = 'none';
        document.getElementById('amountInput').style.display = 'flex';
      },1000);
    }
  } else {
    alert('WTF');
  }
}

function loadProp(card) {
  alert('load prop');
  dvlptProp = card;
  if (dvlptProp.dvlpt < 5) {
    if (dvlptProp.dvlpt == 4) {
      dvlptPrice = getPropFromAbbr(dvlptProp.abbr).hotel * 1000;
    } else {
      dvlptPrice = getPropFromAbbr(dvlptProp.abbr).house * 1000;
    }
  } else {
    dvlptPrice = 0;
  }
  track = 'dvlpt2';
  alert('X ' + dvlptProp.abbr);
  alert('X ' + dvlptPrice);
}

function grabCard(card) {
  alert('grab card');
  dvlptCard = card;
  dvlptCard.balance = Number(dvlptCard.balance);
  if (dvlptCard.balance > dvlptPrice && dvlptPrice > 0) {
    dvlptCard.balance -= dvlptPrice;
    dvlptProp.dvlpt++;
  }
  dvlptCard.balance = String(dvlptCard.balance);
}

async function takeCard() {
  //writing = true;
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(dvlptCard));
      dvlptCard = null;
      dvlptPrice = null;
      //writing = false;
      track = 'dvlpt';
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

async function devlProp() {
  //writing = true;
  alert('devl prop');
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(dvlptProp));
      //writing = false;
      dvlptProp = null;
      track = undefined;
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

//resources

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

function rt(num) {
  if (num < 1000) {
    return `$${num}K`;
  }
  return `$${num/1000}M`;
}

function capFirst(str) {
  return str.substring(0,1).toUpperCase() + str.substring(1,str.length);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
}

function hexToDec(s) {
  var i, j, digits = [0], carry;
  for (i = 0; i < s.length; i ++) {
    carry = parseInt(s.charAt(i), 16);
    for (j = 0; j < digits.length; j ++) {
      digits[j] = digits[j] * 16 + carry;
      carry = digits[j] / 10 | 0;
      digits[j] %= 10;
    }
    while (carry > 0) {
      digits.push(carry % 10);
      carry = carry / 10 | 0;
    }
  }
  return Number(digits.reverse().join(''));
}

function cipher(key) {
  var d = new Date();
  var t = Math.round(d.getTime() / (2 * 1e4));
  var s = String(hexToDec(SHA256(t + key)) % 1e6);
  while (s.length < 6) {
    s = `0${s}`;
  }
  return s;
}

function getPropFromAbbr(abbr) {
  for (let p of allProps) {
    if (p.abbr == abbr) {
      return p;
    }
  }
}
