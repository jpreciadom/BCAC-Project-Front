(function(global) {

    // Variables
    var dc = {};

    // Images
    var images = [
        "images/Apartment1.jpg",
        "images/Apartment2.jpg",
        "images/Apartment3.jpg",
        "images/Apartment4.jpg",
        "images/Apartment5.jpg"
    ];

    // Web3 methods
    async function initWeb3() {
        if (global.ethereum) {
            dc.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.error("User denied account access");
            }
        } else if (global.web3) {
            dc.web3Provider = global.web3.currentProvider;
        } else {
            dc.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
        }
    }

    // HTML Methods
    function insertHTML(selector, html) {
        const tarjet = document.querySelector(selector);
        tarjet.innerHTML = html;
    }

    function insertProperty(html, propName, propValue) {
        var propToReplace = "{{ " + propName + " }}";
        html = html.replace(new RegExp(propToReplace, "g"), propValue);
        return html;
    }

    function buildHome (homeHTML) {
        insertHTML("#main-content", homeHTML);
    }

    function buildItem (itemHTML) {

        var html = ""
        const numRents = 12;

        for (var i = 1; i <= numRents; i++) {
            var current = itemHTML;
            const city = "Bogota, Colombia";
            const dir = "Calle 123 # 12 -34";
            const rentValue = "200";
            const image = images[i % 5];

            current = insertProperty(current, "id", i);
            current = insertProperty(current, "city", city);
            current = insertProperty(current, "dir", dir);
            current = insertProperty(current, "rentValue", rentValue);
            current = insertProperty(current, "image", image);

            html += current
        }

        insertHTML("#home-content", html);
    }

    function buildPostRent (postRentHTML) {
        insertHTML("#main-content", postRentHTML);
    }

    function buildRent (rentHTML) {
        const city = "Bogota, Colombia";
        const dir = "Calle 123 # 12 -34";
        const rentValue = "200";
        const image = images[dc.selectedId % 5];
        const rol = "owner";

        rentHTML = insertProperty(rentHTML, "city", city);
        rentHTML = insertProperty(rentHTML, "dir", dir);
        rentHTML = insertProperty(rentHTML, "rentValue", rentValue);
        rentHTML = insertProperty(rentHTML, "image", image);

        insertHTML("#main-content", rentHTML);

        if (rol === "owner") {
            buildAndShowHTML("snippets/rent-owner-buttons-snippet.html", buildRentButtons);
        } else if (rol === "renter") {
            buildAndShowHTML("snippets/rent-renter-buttons-snippet.html", buildRentButtons);
        } else if (rol === "nonOR") {
            buildAndShowHTML("snippets/rent-nonOR-buttons-snippet.html", buildRentButtons);
        }
    }

    function buildRentButtons(buttonsHTML) {
        insertHTML("#buttons", buttonsHTML);
    }

    function buildUpdateRent(updateRentHTML) {
        insertHTML("#main-content", updateRentHTML);

        const cityInput = document.querySelector("#city");
        const directionInput = document.querySelector("#direction");
        const valueInput = document.querySelector("#value");

        
        const city = "Bogota, Colombia";
        const dir = "Calle 123 # 12 -34";
        const rentValue = "200";

        cityInput.value = city;
        directionInput.value = dir;
        valueInput.value = rentValue;
    }

    function buildAndShowHTML (htmlURL, buildFunction) {
        $ajaxUtils.sendGetRequest(
            htmlURL,
            function () {
                var htmlToInsert = htmlURL;
                $ajaxUtils.sendGetRequest(
                    htmlToInsert,
                    buildFunction,
                    false,
                );
            },
            false
        );
    }

    dc.showHome = function () {
        dc.selectedId = undefined;
        buildAndShowHTML("snippets/home-snippet.html", buildHome);
        buildAndShowHTML("snippets/home-item-snippet.html", buildItem);
    }

    dc.showPostRent = function () {
        dc.selectedId = undefined;
        buildAndShowHTML("snippets/post-rent-snippet.html", buildPostRent);
    }

    dc.showRent = function (id) {
        dc.selectedId = id;
        buildAndShowHTML("snippets/rent-snippet.html", buildRent);
    }

    dc.showUpdateRent = function () {
        buildAndShowHTML("snippets/update-rent-snippet.html", buildUpdateRent);
    }

    // Owner Methods
    dc.postRent = function () {
        console.log("I am gonna post a rent");
    }

    dc.updateRent = function () {
        console.log("I am gonna update the rent info");
    }

    // Renter Methods
    dc.leaveRent = function () {
        console.log("I am gonna leave my rent");
    }

    dc.payRent = function () {
        console.log("I am paying my rent");
    }

    // NonOR Methods
    dc.takeRent = function () {
        console.log("I am gonna take the rent");
    }

    initWeb3();
    dc.showHome();

    global.$dc = dc;

})(window);