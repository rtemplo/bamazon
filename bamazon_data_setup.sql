DROP DATABASE IF EXISTS bamazon_db;

Create Database bamazon_db;

use bamazon_db;

Create Table Products (
	item_id int NOT NULL AUTO_INCREMENT,
    product_name varchar(50) NOT NULL,
    department_name varchar(50) NULL,
    price decimal(10,2) DEFAULT 0 NOT NULL,
    stock_quantity int DEFAULT 0 NOT NULL,
    product_sales int DEFAULT 0 NOT NULL,
    primary key(item_id)
);

Create Table departments (
	department_id int NOT NULL AUTO_INCREMENT,
    department_name varchar(50) NOT NULL,
    over_head_costs int NOT NULL,
    primary key(department_id)
);


Truncate Table products;
Truncate Table departments;

Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Pantene Shampoo', 'Personal Care', 6, 50, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Dishwasher Soap', 'Household Essentials', 9, 30, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('LG 4K OLED 55" ', 'Electronics', 1400, 3, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Georgia Pacific White 8.5 x 11 printing paper', 'Office', 5, 20, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Patio Chair', 'Sports & Outdoors', 26, 10, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Tide 150 fl. oz Detergent', 'Household Essentials', 16, 25, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Trix Cereal 20oz', 'Food', 4, 40, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Star Wars Movie Collection', 'Movies, Music, & Books', 30, 35, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Mobil 1 Synthetic Motor Oil 5 qts.', 'Auto', 28, 4, 0);
Insert Into products (product_name, department_name, price, stock_quantity, product_sales) Values
('Queen Air Bed', 'Sports & Outdoors', 60, 3, 0);

Insert Into departments (department_name, over_head_costs) Values ("Personal Care", 120);
Insert Into departments (department_name, over_head_costs) Values ("Sports & Outdoors", 220);
Insert Into departments (department_name, over_head_costs) Values ("Office", 50);
Insert Into departments (department_name, over_head_costs) Values ("Movies, Music, & Books", 220);
Insert Into departments (department_name, over_head_costs) Values ("Household Essentials", 230);
Insert Into departments (department_name, over_head_costs) Values ("Food", 48);
Insert Into departments (department_name, over_head_costs) Values ("Electronics", 2400);
Insert Into departments (department_name, over_head_costs) Values ("Auto", 28);

Select * from products;
Select * from departments Order By department_id;

Select 
	d.department_id, 
	d.department_name, 
	d.over_head_costs, 
	IF(p.product_sales is NULL, 0, p.product_sales) as product_sales, 
	IF(p.product_sales is NULL, d.over_head_costs * -1, p.product_sales - d.over_head_costs) as total_profit
from departments d 
	left join products p on p.department_name = d.department_name 
Group By d.department_name 
Order By d.department_id

SELECT EXISTS(SELECT * FROM products WHERE item_id = 100) as inProducts













