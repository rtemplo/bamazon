var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "MySQL",
    database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    init();
    showMenuOptions();
});

var departmentArray = [];
function init() {
    connection.query("Select Distinct department_name from departments", function(err, results) {
        if (err) throw err;

        for (var i = 0; i < results.length; i++) {
            departmentArray.push(results[i].department_name);
        }
    });
}

function showMenuOptions() {
    inquirer.prompt([
        {
            name:"menuChoice",
            type: "list",
            message: "Please select an action from the menu below.",
            choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product"]
        }
    ]).then(function (response) {

        switch (response.menuChoice) {
            case "View Products for Sale":
                showResults("all");
                break;
            case "View Low Inventory":
                showResults("low");
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;                                                
        }

    });
}

function showResults(mode) {
    var strSQL;
    if (mode === "all") {
        strSQL = "Select * from products";
    } else if (mode === "low") {
        strSQL = "Select * from products where stock_quantity < 5";
    }

    connection.query(strSQL, function(err, results) {
        var table = new Table({
            head: ['Prod ID', 'Prod. Name', 'Department', 'Price', 'Quantity']
        });

        var prodID, prodName, dept, price, qty;
        
        for (var i = 0; i < results.length; i++) {
            prodID = results[i].item_id;
            prodName = results[i].product_name;
            dept = results[i].department_name;
            price = results[i].price;
            qty = results[i].stock_quantity;

            table.push([prodID, prodName, dept, price, qty]);
            //console.log(`ID: ${prodID} | Name: ${prodName} | Department: ${dept} | Price: $${price} | Qty: ${qty}`);
        }
        console.log(table.toString());
        console.log("-----------------------------------------------------------------------------------------");

        promptExit();
    });    
}

function promptExit() {
    inquirer.prompt([
        {type:"confirm", name:"showMenu", message:"Show the menu again?"}
    ]).then(function (response) {
        if (response.showMenu) {
            console.log("\n-----------------------------------------------------------------------------------------");
            showMenuOptions();
            console.log("\n-----------------------------------------------------------------------------------------");
        } else {
            process.exit();
        }
    });
}

function addToInventory() {
    connection.query("Select * from products Order By item_id", function(err, results) {
        var table = new Table({
            head: ['Prod ID', 'Prod. Name', 'Department', 'Price', 'Quantity']
        });

        var prodID, prodName, dept, price, qty;
        
        for (var i = 0; i < results.length; i++) {
            prodID = results[i].item_id;
            prodName = results[i].product_name;
            dept = results[i].department_name;
            price = results[i].price;
            qty = results[i].stock_quantity;

            table.push([prodID, prodName, dept, price, qty]);
            //console.log(`ID: ${prodID} | Name: ${prodName} | Department: ${dept} | Price: $${price} | Qty: ${qty}`);
        }
        
        console.log(table.toString());
        console.log("-----------------------------------------------------------------------------------------");

        inquirer.prompt([
            {
                type: "input",
                name: "whichProd",
                message: "Please enter the id for product that you want to replenish.",
                validate: function (str) {
                    if (!isNaN(str)) {
                        return true;
                    } else {
                        console.log("\nA numeric entry from the product id table is required. Please try again");
                        return false;
                    }
                }                  
            },
            {
                type: "input",
                name: "howMany",
                message: "How many units do you want to add?",
                validate: function (str) {
                    if (!isNaN(str)) {
                        return true;
                    } else {
                        console.log("\nA numeric entry for units is required. Please try again");
                        return false;
                    }
                } 
            }
        ]).then(function(response) {
            var pid = parseInt(response.whichProd);
            var qty = parseInt(response.howMany);
        
            connection.query("Update products Set stock_quantity = stock_quantity + ? Where ?", 
            [
                qty,
                {item_id: pid}
            ],
            function(err, results) {
                if (err) throw err;
                
                console.log(`The product has been replenished with ${qty} more units.`);
                promptExit();
            });

        });
    });    
}

function addNewProduct() {
    inquirer.prompt([
        {
            type:"input",
            name:"prodName",
            message:"Please enter a product name."
        },
        {
            type:"list",
            name:"prodDept",
            message:"Please select which department this product belongs to.",
            choices: departmentArray
        },
        {
            type:"input",
            name:"prodPrice",
            message:"Please enter a product price.",
            validate: function (str) {
                return !isNaN(str);
            }
        },
        {
            type:"input",
            name:"prodQty",
            message:"Please enter a product supply quantity.",
            validate: function (str) {
                return !isNaN(str);
            }
        }
    ]).then(function(response) {
        var n, d, p, q;
        n = response.prodName;
        d = response.prodDept;
        p = parseFloat(response.prodPrice);
        q = parseInt(response.prodQty);

        connection.query("Insert Into products Set ?", 
        [
            {
                product_name: n,
                department_name: d,
                price: p,
                stock_quantity: q
            }
        ],
        function(err, results) {
            if (err) throw err;
            console.log("The product has been entered into the system.");
            promptExit();
        });
    });
}