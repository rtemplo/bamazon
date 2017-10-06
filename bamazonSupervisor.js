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
    showMenuOptions();
});

function showMenuOptions() {
    inquirer.prompt([
        {
            type:"list",
            name:"deptList",
            message:"Please enter the ID of the product you would like to buy.",
            choices: ["View Product Sales By Department", "Create New Department"]
        }
    ]).then(function (response) {
        if (response.deptList === "View Product Sales By Department") {
            connection.query(
                `Select 
                    d.department_id, 
                    d.department_name, 
                    d.over_head_costs, 
                    IF(p.product_sales is NULL, 0, p.product_sales) as product_sales, 
                    IF(p.product_sales is NULL, d.over_head_costs * -1, p.product_sales - d.over_head_costs) as total_profit
                from departments d 
                    left join products p on p.department_name = d.department_name 
                Group By d.department_name 
                Order By d.department_id`,
                function(err, results) {
                    var deptID, deptName, overHead, totalSales, totalProfit;

                    var table = new Table({
                        head: ['Dept ID', 'Dept. Name', 'Over Head Costs', 'Tot. Sales', 'Tot. Profit']
                    });
                    
                    for (var i = 0; i < results.length; i++) {
                        deptID = results[i].department_id;
                        deptName = results[i].department_name;
                        overHead = results[i].over_head_costs;
                        totalSales = results[i].product_sales;
                        totalProfit = results[i].product_sales - results[i].over_head_costs;
            
                        table.push([deptID, deptName, overHead, totalSales, totalProfit]);
                    }

                    console.log(table.toString());
                    promptExit();
                }
            );
        } else if (response.deptList === "Create New Department")  {
            inquirer.prompt([
                {
                    type:"input",
                    name:"deptName",
                    message:"Please a name for the new department.",
                    validate: function (str) {
                        return (str !== undefined && str !== "");
                    }
                },
                {
                    type:"input",
                    name:"overHead",
                    message:"Please specify overhead costs for this department.",
                    validate: function (str) {
                        if (!isNaN(str)) {
                            return true;
                        } else {
                            console.log("\nA numeric entry for overhead cost is required. Please try again");
                            return false;
                        }
                    } 
                }                          
            ]).then(function(response) {
                var strSQL = "Insert Into departments (department_name, over_head_costs) Values (?, ?)"
                connection.query(strSQL, [response.deptName, response.overHead], function (err) {
                    if (err) throw err;
                    console.log(`The new department record for "${response.deptName}" was entered into the system.`);
                    promptExit();
                });
            });
        }
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