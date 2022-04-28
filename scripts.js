/*!
* Start Bootstrap - Creative v7.0.5 (https://startbootstrap.com/theme/creative)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
*/
//
// Scripts
// 

let atomic = 100000000;
let baseReward = 6.625;
let dynamicIncrement = 0.125;
let myRank = 1;
let myVotes = 1;
let shareMultiplier = 0.9;
let firstCalcDone = false;

  
var buildTable = function buildTable(data) {
    var table = document.createElement("table")
    table.classList.add("table");
    table.classList.add("table-dark");
    table.classList.add("table-striped");
    var tr = document.createElement("tr");
    var keys = Object.keys(data[0]);
    var headers = ['ADDRESS', 'PENDING PAYMENT', 'TOTAL PAID'];

    for (var i=0; i<headers.length; i++) {
        var key = headers[i];
        var colHeader = document.createElement("th");
        colHeader.appendChild(document.createTextNode(key));
        tr.appendChild(colHeader);
    }
    table.appendChild(tr);

    data.forEach(function (rowData) {
        tr = document.createElement("tr");
        for (var i=0; i<keys.length; i++) {
            var key = keys[i];
            var colData = document.createElement("td");
            if (typeof rowData[key] == "number") {
                colData.style.textAlign = "right";
                colData.appendChild(document.createTextNode(rowData[key].toLocaleString(undefined, {maximumFractionDigits: 2})));
            }
            else {
                colData.classList.add("address");
                var a = document.createElement('a');
                a.target = "_blank";
                var linkText = document.createTextNode(rowData[key]);
                a.appendChild(linkText);
                a.title = rowData[key];
                a.href = `https://explore.solar/wallets/${rowData[key]}`;
                colData.appendChild(a);
            }
            tr.appendChild(colData);
        }
        table.appendChild(tr);
    });
    return table;
};

const getRewards = () => {
    const myRequest = new Request('/api/rewards');
    
    fetch(myRequest)
        .then((response) => {
            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${ response.status }`);
            }
            
            return response.json()
        })
        .then((response) => {
            // console.log('response', response);
            document.getElementById('rewardstable').innerHTML = '';
            document.getElementById('rewardstable').append(buildTable(response));

        }
    );
}

const getDelegate = () => {
    const myRequest = new Request('/api/status');

    
    document.getElementById('flipdown').innerHTML = '';
    
    fetch(myRequest)
        .then((response) => {
            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${ response.status }`);
            }
            
            return response.json()
        })
        
        .then((response) => {
            let blocks = response.data.blocks.produced;
            let blocksUntilPay = 204 - (blocks % 204);
            // https://www.cssscript.com/retro-flipping-countdown/
            let flipdown = new FlipDown(Math.round(new Date().getTime()/1000) + (blocksUntilPay * 424));
            flipdown.start();

            myRank = response.data.rank;
            myVotes = response.data.votes / atomic;
            if (!firstCalcDone) updateCustomTable(null, 1000);

            let rank = document.getElementById('rank');
            let forging = document.getElementById('forging');
            let votes = document.getElementById('votes');
            let burn = document.getElementById('burn');

            rank.innerHTML = response.data.rank;
            forging.innerHTML = response.data.rank <= 53 ? '✓' : '⛔';
            votes.innerHTML = (response.data.votes / atomic).toLocaleString(undefined, {maximumFractionDigits: 2});
            burn.innerHTML = (response.data.forged.burnedFees / atomic).toLocaleString(undefined, {maximumFractionDigits: 2});
        }
    );
}

const updateCustomTable = (e, custom) => {    
    if (myRank > 53) return;

    let amount = e ? JSON.parse(e.target.value || 0) : custom;
    if (!amount) amount = 1000;
    
    let votersBlockReward = shareMultiplier * (baseReward + (myRank * dynamicIncrement))
    let blockReward = (amount / (myVotes + amount)) * votersBlockReward;
    let dayReward = blockReward * 204;


    document.getElementById('day').innerHTML = dayReward.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('week').innerHTML = (dayReward * 7).toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('month').innerHTML = (dayReward * 30).toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('year').innerHTML = (dayReward * 365).toLocaleString(undefined, {maximumFractionDigits: 2});

    firstCalcDone = true;
}
  
  
window.addEventListener('DOMContentLoaded', event => {


    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    const input = document.getElementById('customAmountInput');
    input.addEventListener('input', updateCustomTable);

    //setTimeout( () => {updateCustomTable(null, 1000)}, 2000);
    getRewards();
    getDelegate();
    setInterval(getRewards, 10000);
    setInterval(getDelegate, 1000 * 424);

    





});
