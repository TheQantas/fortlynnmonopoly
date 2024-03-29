window.onload = () => {
  //alert('V1.6.14');
  document.getElementsByTagName('main')[0].style.height = `${window.innerHeight - 60}px`;
}

window.onresize = () => {
  document.getElementsByTagName('main')[0].style.height = `${window.innerHeight - 60}px`;
}

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
var rentProps = [];
var rentPrice = 0;

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
  buildStocks();
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
      var titles = ['Group:','Price:','Rent:'];
      var values = [p.group,rt(p.price),`${rt(p.mult)} times number owned`];
    }
    if (p.rent) {
      titles = titles.concat(['Rent:','1 House:','2 Houses:','3 Houses:','4 Houses:','Hotel:']);
      values = values.concat([rt(p.rent[0]),rt(p.rent[1]),rt(p.rent[2]),rt(p.rent[3]),rt(p.rent[4]),rt(p.rent[5])]);
    }
    for (let i = 0; i < titles.length; i++) {
      buildElem('DIV','propCell',titles[i],grid);
      let r = buildElem('DIV','propCell',values[i],grid);
      if (values[i].indexOf('times') != -1) {
        r.style.gridColumn = '2 / span 3';
      }
    }
  }
}

function buildStocks() {
  for (let p of stocks) {
    let cont = buildElem('DIV','propCont',undefined,document.getElementsByClassName('page')[2]);
    cont.id = `prop${p.abbr}`;
    let top = buildElem('DIV','propTop',undefined,cont);
    buildElem('IMG','propLogo',`assets/stocks/${p.img}.png`,top);
    buildElem('DIV','propName',p.name,top);
    let d = 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z';
    let more = buildElem('SVG','propMore','0 0 24 24',top);
    more.addEventListener('click',function() { this.parentElement.nextElementSibling.classList.toggle('show'); } );
    buildElem('PATH',undefined,d,more);
    let grid = buildElem('DIV','propGrid',undefined,cont);
    if (['PPS','QAR','TBOC','LGUM','LEO','TFL'].includes(p.abbr)) { //stock stuff
      var titles = ['Ticker:','Name:','Price:','Dividend:'];
      var values = [p.abbr,p.name,rt(p.price),rt(p.dividend)];
    } else { //prop stuff
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
  //alert(initBalance);
  document.getElementById('set').style.backgroundColor = 'rgb(64,64,64)';
}

async function scanCard() {
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    //alert('scanned');
    ndef.onreading = event => {
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        let card = JSON.parse(decoder.decode(record.data));
        //alert('cards');
        if (card.id == 'bank') {
          try {
            let key = prompt('Enter Code:');
            if (key == cipher(card.key)) {
              document.getElementsByClassName('tab')[4].style.display = 'flex';
              document.getElementsByClassName('tab')[5].style.display = 'flex';
              bank = true;
            } else {
              alert('Incorrect Code');
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
          if (['PPS','QAR','TBOC','LGUM','LEO','TFL'].includes(card.abbr)) {
            document.getElementById('scanId').textContent = `Ticker: ${card.abbr}`;
            document.getElementById('scanBalance').textContent = `Dividend: ${rt(getStockFromAbbr(card.abbr).dividend)}`;
          } else {
            document.getElementById('scanId').textContent = `Abbreviation: ${card.abbr}`;
            if (card.dvlpt != undefined) {
              document.getElementById('scanBalance').textContent = `Development: Level ${card.dvlpt}`;
            } else {
              document.getElementById('scanBalance').textContent = 'Development: N/A';
            }
          }
          document.getElementById(`prop${card.abbr}`).scrollIntoView();
          document.getElementById(`prop${card.abbr}`).children[1].classList.add('show');
        }
      }
      ndef.onreading = '';
    }
  } else {
    alert('NFC not supported');
  }
}

async function initCard() {
  //track = 'setup';
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      // if (track != 'setup') {
      //   return;
      // }
      let decoder = new TextDecoder();
      if (!gameSet) {
        return;
      }
      for (let record of event.message.records) {
        bankCard = JSON.parse(decoder.decode(record.data));
        bankCard.planes = document.getElementsByName('expansions')[0].checked;
        bankCard.space = document.getElementsByName('expansions')[1].checked;
        bankCard.america = document.getElementsByName('expansions')[2].checked;
        let d = new Date();
        bankCard.unix = d.getTime();
      }
      ndef.onreading = '';
    }
  } else {
    alert('WTF');
  }
}

async function finalizeCard() {
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(bankCard));
      bankCard = null;
      //track = undefined;
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

async function initProp() {
  //track = 'reset';
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      // if (track != 'reset') {
      //   return;
      // }
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        propReset = JSON.parse(decoder.decode(record.data));
        propReset.dvlpt = 0;
      }
      ndef.onreading = '';
    }
  } else {
    alert('WTF');
  }
}

async function finalizeProp() {
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(propReset));
      propReset = null;
      //track = undefined;
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

function startTrans() {
  var amount = Number(document.getElementById('transAmount').value);
  if (amount < 1e3 || amount > 1e7) {
    return;
  }
  document.getElementById('amountInput').style.display = 'none';
  document.getElementById('message').style.display = 'block';
  document.getElementById('message').textContent = 'Hand phone to other person';
  document.getElementById('confirmAmount').textContent = rt(amount / 1000);
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

async function yes(sign) {
  document.getElementById('confirm').style.display = 'none';
  document.getElementById('message').textContent = 'Scan Card';
  document.getElementById('message').style.display = 'block';
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      if (inProgress) {
        return;
      }
      inProgress = true;
      //alert(sign);
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        transCard = JSON.parse(decoder.decode(record.data));
        transCard.balance = Number(transCard.balance);
        if (transCard.balance < Number(document.getElementById('transAmount').value) && sign == -1) {
          document.getElementById('message').textContent = 'Insufficient Funds';
          document.getElementById('transAmount').value = '';
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
        transCard.balance += sign * Number(document.getElementById('transAmount').value);
        transCard.balance = String(transCard.balance);
        document.getElementById('message').textContent = 'Wait to Scan Again';
        setTimeout(function() {finishYes(sign); },1000);
      }
      ndef.onreading = '';
    }
  } else {
    alert('WTF');
  }
}

async function finishYes(sign) {
  //alert('finish ' + sign);
  inProgress = false;
  document.getElementById('message').textContent = 'Scan Again';
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    if (inProgress) {
      return;
    }
    inProgress = true;
    try {
      await ndef.write(JSON.stringify(transCard));
      transCard = null;
      inProgress = false;
      //alert('Call back');
      if (rentProps.length > 0) {
        rentProps.length = 0;
        rentPrice = 0;
        document.getElementById('listRent').innerHTML = '';
        document.getElementById('listRent2').innerHTML = '';
        document.getElementById('confirmRent').style.display = 'none';
        document.getElementById('rentCont').style.display = 'none';
        document.getElementById('rentBtn').style.display = 'flex';
      }
      if (sign == -1) {
        //alert('hand back');
        document.getElementById('message').textContent = 'Hand Phone Back';
        setTimeout(function() { yes(1); },3000);
      } else {
        document.getElementById('message').textContent = 'Transaction Done';
        document.getElementById('transAmount').value = '';
        setTimeout(() => {
          document.getElementById('message').style.display = 'none';
          document.getElementById('amountInput').style.display = 'flex';
        },1000);
      }
    } catch (error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

async function loadProp() {
  if (dvlptProp) {
    return;
  }
  //track = 'dvlpt';
  //alert('Load prop');
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      // if (track != 'dvlpt') {
      //   return;
      // }
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        dvlptProp = JSON.parse(decoder.decode(record.data));
        if (dvlptProp.dvlpt < 5) {
          if (dvlptProp.dvlpt == 4) {
            dvlptPrice = getPropFromAbbr(dvlptProp.abbr).hotel * 1000;
          } else {
            dvlptPrice = getPropFromAbbr(dvlptProp.abbr).house * 1000;
          }
        } else {
          dvlptPrice = 0;
        }
        //alert('X ' + dvlptProp.abbr);
        //alert('X ' + dvlptPrice);
      }
      ndef.onreading = '';
    }
  } else {
    alert('WTF');
  }
}

async function loadStock() {
  if (dvlptProp) {
    return;
  }
  //track = 'dvlpt';
  //alert('Load prop');
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      // if (track != 'dvlpt') {
      //   return;
      // }
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        dvlptProp = JSON.parse(decoder.decode(record.data));
        dvlptPrice = -getStockFromAbbr(dvlptProp.abbr).dividend;
        //alert('X ' + dvlptProp.abbr);
        //alert('X ' + dvlptPrice);
      }
      ndef.onreading = '';
    }
  } else {
    alert('WTF');
  }
}

async function grabCard() {
  //alert('grab card');
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      //alert('card grabbed');
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        dvlptCard = JSON.parse(decoder.decode(record.data));
        //alert(JSON.stringify(dvlptCard));
        dvlptCard.balance = Number(dvlptCard.balance);
        if (dvlptCard.balance > dvlptPrice && dvlptPrice > 0) {
          dvlptCard.balance -= dvlptPrice;
          dvlptProp.dvlpt++;
        }
        dvlptCard.balance = String(dvlptCard.balance);
      }
      ndef.onreading = '';
    }
  } else {
    alert('WTF');
  }
}

async function takeCard() {
  //alert('take card');
  //alert(JSON.stringify(dvlptCard));
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    //alert(JSON.stringify(dvlptCard));
    try {
      await ndef.write(JSON.stringify(dvlptCard));
      dvlptCard = null;
      dvlptPrice = null;
      //track = 'dvlpt';
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

async function devlProp() {
  //alert('devl prop');
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    try {
      await ndef.write(JSON.stringify(dvlptProp));
      dvlptProp = null;
      //track = undefined;
    } catch(error) {
      alert(error);
    }
  } else {
    alert('WTF');
  }
}

function goToRentScreen() {
  document.getElementById('rentBtn').style.display = 'none';
  document.getElementById('rentCont').style.display = 'flex';
}

async function addProp() {
  //alert('Add prop');
  if ('NDEFReader' in window) {
    let ndef = new NDEFReader();
    await ndef.scan();
    ndef.onreading = event => {
      let decoder = new TextDecoder();
      for (let record of event.message.records) {
        try {
          let card = JSON.parse(decoder.decode(record.data));
          if (rentProps.length == 0) {
            document.getElementById('listRent').innerHTML = '';
            document.getElementById('listRent2').innerHTML = '';
          }
          let p = getPropFromAbbr(card.abbr);
          if (!p) {
            return;
          }
          if (rentProps.length > 0) {
            if (p.color != rentProps[0].color) {
              //alert('returning 500');
              return;
            }
          }
          for (let r of rentProps) {
            if (card.abbr == r.abbr) {
              //alert('returning 506');
              return;
            }
          }
          rentProps.push(p);
          document.getElementById('scanRent').textContent = 'Press Here to Scan Additional Properties in Color Group';
          document.getElementById('chargeRent').style.display = 'block';
          let ids = ['listRent','listRent2'];
          let val;
          for (let id of ids) {
            let top = buildElem('DIV','propTop',undefined,document.getElementById(id));
            let group = buildElem('DIV','propGroup',undefined,top);
            group.style.backgroundColor = p.color;
            buildElem('DIV','propName',p.name,top);
            if (p.mult) {
              buildElem('DIV','propRent',rt(p.mult),top);
              val = p.mult;
            } else if (rentProps.length == 1) {
              buildElem('DIV','propRent',rt(p.rent[card.dvlpt]),top);
              val = p.rent[card.dvlpt];
            } else if (card.dvlpt == 0) {
              buildElem('DIV','propRent',rt(Math.round(p.rent[0] * 1.5)),top);
              val = Math.round(p.rent[0] * 1.5);
            } else {
              buildElem('DIV','propRent','$0',top);
              val = 0;
            }
          }
          rentPrice += val;
        } catch (error) {
          alert(error);
        }
      }
      ndef.onreading = '';
    }
  } else {
    alert('WTF');
  }
}

function advRent() {
  document.getElementById('addRent').style.display = 'none';
  document.getElementById('confirmRent').style.display = 'block';
}

function rentYes() {
  //alert(rentPrice);
  document.getElementById('amountInput').style.display = 'none';
  document.getElementById('message').textContent = 'Scan Card';
  document.getElementById('message').style.display = 'block';
  document.getElementById('transAmount').value = rentPrice * 1000;
  page(1);
  yes(-1);
}

function rentNo() {
  document.getElementById('confirmRent').style.display = 'none';
  document.getElementById('addRent').style.display = 'block';
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

function getStockFromAbbr(abbr) {
  for (let p of stocks) {
    if (p.abbr == abbr) {
      return p;
    }
  }
}
