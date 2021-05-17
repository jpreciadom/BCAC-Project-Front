(function(global) {

    // Variables
    var dc = {
        selectedId: undefined,
        web3Provider: undefined,
        contracts: {}
    };

    // Images
    var images = [
        "images/Apartment1.jpg",
        "images/Apartment2.jpg",
        "images/Apartment3.jpg",
        "images/Apartment4.jpg",
        "images/Apartment5.jpg"
    ];

    // Web3 methods
    async function initWeb3 () {
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

        initContract();
    }

    async function initContract () {
        $ajaxUtils.sendGetRequest(
            "artifacts/UniversityHousing.json",
            function (json) {
                var UniversityHousingArtifact = json;
                dc.contracts.UniversityHousing = TruffleContract(UniversityHousingArtifact);

                dc.contracts.UniversityHousing.setProvider(dc.web3Provider);
                dc.showHome();
            },
            true
        );
    }

    // HTML Methods
    function insertHTML (selector, html) {
        const tarjet = document.querySelector(selector);
        tarjet.innerHTML = html;
    }

    function insertProperty (html, propName, propValue) {
        var propToReplace = "{{ " + propName + " }}";
        html = html.replace(new RegExp(propToReplace, "g"), propValue);
        return html;
    }

    function buildHome (homeHTML) {
        insertHTML("#main-content", homeHTML);
        
        buildAndShowHTML("snippets/home-item-snippet.html", buildItem);
    }

    function buildItem (itemHTML) {

        var universityHousingInstance;

        dc.contracts.UniversityHousing.deployed().then( async function (instance) {
            universityHousingInstance = instance;

            return universityHousingInstance.rentCount.call();
        }).then( async function (rentCount) {
            var html = ""
            const numRents = rentCount.c[0];

            for (var i = 1; i <= numRents; i++) {
                const rent = await universityHousingInstance.rents.call(i);
                var current = itemHTML;

                const city = rent[3];
                const dir = rent[4];
                const rentValue = rent[5];
                const image = images[i % 5];

                current = insertProperty(current, "id", i);
                current = insertProperty(current, "city", city);
                current = insertProperty(current, "dir", dir);
                current = insertProperty(current, "rentValue", rentValue);
                current = insertProperty(current, "image", image);

                html += current
            }

            insertHTML("#home-content", html);
        }).catch( (error) => {
            console.log(error.message);
        });
    }

    function buildPostRent (postRentHTML) {
        insertHTML("#main-content", postRentHTML);
    }

    function buildRent (rentHTML) {

        var universityHousingInstance;

        dc.contracts.UniversityHousing.deployed().then( (instance) => {
            universityHousingInstance = instance;
            
            return universityHousingInstance.rents.call(dc.selectedId);
        }).then( (rent) => {
            const owner = rent[1];
            const renter = rent[2];
            const city = rent[3];
            const dir = rent[4];
            const rentValue = rent[5];
            const image = images[dc.selectedId % 5];

            rentHTML = insertProperty(rentHTML, "city", city);
            rentHTML = insertProperty(rentHTML, "dir", dir);
            rentHTML = insertProperty(rentHTML, "rentValue", rentValue);
            rentHTML = insertProperty(rentHTML, "image", image);

            insertHTML("#main-content", rentHTML);
    
            if (dc.web3Provider.selectedAddress === owner) {
                buildAndShowHTML("snippets/rent-owner-buttons-snippet.html", buildRentButtons);
            } else if (dc.web3Provider.selectedAddress === renter) {
                buildAndShowHTML("snippets/rent-renter-buttons-snippet.html", buildRentButtons);
            } else {
                buildAndShowHTML("snippets/rent-nonOR-buttons-snippet.html", buildRentButtons);
            }

        }).catch( (error) => {
            console.log(error);
        });
    }

    function buildRentButtons(buttonsHTML) {
        insertHTML("#buttons", buttonsHTML);
    }

    function buildUpdateRent(updateRentHTML) {
        insertHTML("#main-content", updateRentHTML);

        const cityInput = document.querySelector("#city");
        const addressInput = document.querySelector("#address");
        const valueInput = document.querySelector("#value");

        var universityHousingInstance;

        dc.contracts.UniversityHousing.deployed().then( (instance) => {
            universityHousingInstance = instance;

            return universityHousingInstance.rents.call(dc.selectedId);
        }).then( (rent) => {
            const city = rent[3];
                const dir = rent[4];
                const rentValue = rent[5];

            cityInput.value = city;
            addressInput.value = dir;
            valueInput.value = rentValue;
        }).catch( (error) => {
            insertHTML("#errors", "Upss... Ha ocurrido un error intentando cargar los datos del arriendo.");
            console.log(error);
        });
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
    dc.updateRent = function () {
        const city = document.querySelector("#city").value;
        const rentAddress = document.querySelector("#address").value;
        const value = document.querySelector("#value").value;

        if (city && rentAddress && value) {
            if (/^[0-9]*$/.test(value)) {
                insertHTML("#errors", "");

                var universityHousingInstance;

                dc.contracts.UniversityHousing.deployed().then( (instance) => {
                    universityHousingInstance = instance;
                    
                    return universityHousingInstance.updateRent(
                        dc.selectedId,
                        city,
                        rentAddress,
                        value,
                        { from: dc.web3Provider.selectedAddress }
                    );
                }).then( () => {
                    dc.showHome();
                }).catch( (error) => {
                    insertHTML("#errors", "Upssss... Ha ocurrido un error enviando la transaccion");
                });
                
            } else {
                insertHTML("#errors", "El campo de valor debe ser numérico");
            }
        } else {
            insertHTML("#errors", "Debe diligenciar todos los campos");
        }
    }

    // Renter Methods
    dc.leaveRent = function () {
        console.log("I am gonna leave my rent");
    }

    dc.payRent = function () {
        console.log("I am paying my rent");
    }

    // NonOR Methods
    dc.postRent = function () {
        const city = document.querySelector("#city").value;
        const rentAddress = document.querySelector("#address").value;
        const value = document.querySelector("#value").value;

        if (city && rentAddress && value) {
            if (/^[0-9]*$/.test(value)) {
                insertHTML("#errors", "");

                var universityHousingInstance;

                dc.contracts.UniversityHousing.deployed().then( (instance) => {
                    universityHousingInstance = instance;
                    
                    return universityHousingInstance.postRent(city, rentAddress, value, { from: dc.web3Provider.selectedAddress });
                }).then( () => {
                    dc.showHome();
                }).catch( (error) => {
                    insertHTML("#errors", "Upssss... Ha ocurrido un error enviando la transaccion");
                });
                
            } else {
                insertHTML("#errors", "El campo de valor debe ser numérico");
            }
        } else {
            insertHTML("#errors", "Debe diligenciar todos los campos");
        }
    }

    dc.takeRent = function () {
        console.log("I am gonna take the rent");
    }

    initWeb3();

    global.$dc = dc;

})(window);