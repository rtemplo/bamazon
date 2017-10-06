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
    displayProducts();
});

function displayProducts() {
    console.log("################ AVAILABLE PRODUCTS FOR SALE ################");
    
    connection.query("SELECT * FROM products", function(err, results) {
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
        console.log("Please choose a product.");

        inquirer.prompt([
            {
                name:"prodID",
                type:"input",
                message:"Please enter the ID of the product you would like to buy.",
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
                name:"itemQty",
                type:"input",
                message:"How many you would like to buy?",
                validate: function (str) {
                    if (!isNaN(str)) {
                        return true;
                    } else {
                        console.log("\nA numeric entry for quantity is required. Please try again");
                        return false;
                    }
                }                
            }              
        ]).then(function (response) {
            var pid = Number.parseInt(response.prodID);
            var qty = Number.parseInt(response.itemQty);

            connection.query("Select stock_quantity, price FROM products where ?",
            [
                {
                    item_id: pid
                }
            ], 
            function(err, results) {
                if (err) {
                    console.log(err);
                    throw err
                };
                
                var db_qty = Number.parseInt(results[0].stock_quantity); 
                var db_price = Number.parseFloat(results[0].price);

                if (qty <= db_qty) {
                    updateQuantity(pid, qty, db_price);
                } else {
                    console.log("Insufficient Quantity");
                }
            });   

        });        

    
    });
    //connection.end();

}

function promptExit() {
    inquirer.prompt([
        {type:"confirm", name:"showMenu", message:"Would you like to make another purchase?"}
    ]).then(function (response) {
        if (response.showMenu) {
            console.log("\n-----------------------------------------------------------------------------------------");
            displayProducts();
            console.log("\n-----------------------------------------------------------------------------------------");
        } else {
            process.exit();
        }
    });
}

function updateQuantity (itemID, itemQty, itemPrice) {
    var salePrice = itemPrice * itemQty;
    connection.query("Update products Set stock_quantity = stock_quantity - ?, product_sales = product_sales + ? where ?",
    [
        itemQty,
        salePrice,
        {
            item_id:itemID
        }
    ], 
    function(err, results) {
        if (err) throw err;

        console.log(`Your purchase is compelete. Your total purchase price is: ${salePrice}`);

        promptExit();
    });
};    

