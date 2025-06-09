## Setting up Locally
1. Clone the repository
2. Ensure that you have Node installed.
3. Install dependencies:
   - npm : ``` npm install ```
   - yarn: ``` yarn install ```
   - pnpm : ``` pnpm install ```
4. Connect to a online postgres db solution of your choice or use postgres locally.
5. Copy the following script to create the database and the required tables.
   ```
   CREATE DATABASE b2b-express;

   USE b2b-express; 
   
   -- Create Sellers Table
    CREATE TABLE sellers (
        seller_id SERIAL PRIMARY KEY,  -- Auto-incrementing primary key
        name VARCHAR(100) NOT NULL,    -- Seller's name
        business_name VARCHAR(150) NOT NULL,  -- Seller's business name
        email VARCHAR(100) NOT NULL UNIQUE  -- Seller's email, must be unique
        password VARCHAR(255) NOT NULL
    );
    
    -- Create Buyers Table
    CREATE TABLE buyers (
        buyer_id SERIAL PRIMARY KEY,  -- Auto-incrementing primary key
        name VARCHAR(100) NOT NULL,    -- Buyer's name
        business_name VARCHAR(150),  -- Buyer's business name (optional)
        email VARCHAR(100) NOT NULL UNIQUE  -- Buyer's email, must be unique
        password VARCHAR(255) NOT NULL
    );
    
    -- Create Products Table
    CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,  -- Auto-incrementing primary key
        name VARCHAR(100) NOT NULL,    -- Product name
        description TEXT,  -- Product description
        category VARCHAR(100) NOT NULL,  -- Product category
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),  -- Product price, with a check to ensure non-negative values
        discount DECIMAL(5, 2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100)  -- Discount as a percentage, with a default of 0
        seller_email VARCHAR(100) NOT NULL,
        ADD CONSTRAINT fk_seller_email
            FOREIGN KEY (seller_email) REFERENCES sellers(email)
            ON DELETE CASCADE;
    );
       ```
  6. Add database config in the database.js file.
  7. Run the app with the following command.
     ```
       node server.js
     ```
  8. Visit ```http://localhost:3000``` to test the endpoints.


## Sellers API Documentation

### Base URL

`/api/sellers`

---

### **Signup Seller**

- **URL**: `/signup`
- **Method**: `POST`
- **Description**: Register a new seller.
- **Request Body**:
  - `name`: Seller's full name (String, Required)
  - `business_name`: Seller's business name (String, Required)
  - `email`: Seller's email (String, Required)
  - `password`: Seller's password (String, Required, min length 6)
- **Responses**:
  - `201 Created`: Successfully signed up. The user data and a cookie are returned.
  - `400 Bad Request`: Validation errors like invalid email format, required fields, or password length.
  - `409 Conflict`: Seller already exists.

---

### **Signin Seller**

- **URL**: `/signin`
- **Method**: `POST`
- **Description**: Login a registered seller.
- **Request Body**:
  - `email`: Seller's email (String, Required)
  - `password`: Seller's password (String, Required)
- **Responses**:
  - `201 Created`: Successfully signed in. The user data and a cookie are returned.
  - `400 Bad Request`: Invalid credentials or required fields.
  - `404 Not Found`: Seller does not exist.

---

### **Logout Seller**

- **URL**: `/logout`
- **Method**: `GET`
- **Description**: Logout the current seller and clear the session cookie.
- **Responses**:
  - `200 OK`: Successfully logged out and cleared the cookie.

---

### **Get Seller Profile**

- **URL**: `/me`
- **Method**: `GET`
- **Authentication**: Yes, required.
- **Description**: Retrieve the profile details of the currently logged-in seller.
- **Responses**:
  - `200 OK`: Successfully retrieved seller profile data.

---

### **Add Product**

- **URL**: `/addProduct`
- **Method**: `POST`
- **Authentication**: Yes, required.
- **Description**: Add a new product under the currently logged-in seller.
- **Request Body**:
  - `name`: Product name (String, Required)
  - `description`: Product description (String, Required)
  - `category`: Product category (String, Required)
  - `price`: Product price (Float, Required, must be > 0)
  - `discount`: Discount percentage (Float, Required, must be >= 0)
- **Responses**:
  - `201 Created`: Successfully added the product.
  - `400 Bad Request`: Validation errors like missing fields or negative price/discount.

---

### **Update Product**

- **URL**: `/:id`
- **Method**: `PUT`
- **Authentication**: Yes, required.
- **Description**: Update a product by its `id`.
- **Path Parameters**:
  - `id`: Product ID (Integer, Required)
- **Request Body**:
  - `name`: Product name (String, Optional)
  - `description`: Product description (String, Optional)
  - `category`: Product category (String, Optional)
  - `price`: Product price (Float, Optional, must be > 0)
  - `discount`: Discount percentage (Float, Optional, must be >= 0)
- **Responses**:
  - `200 OK`: Successfully updated the product.
  - `404 Not Found`: Product with the provided ID does not exist.
  - `400 Bad Request`: Validation errors.

---

### **Delete Product**

- **URL**: `/:id`
- **Method**: `DELETE`
- **Authentication**: Yes, required.
- **Description**: Delete a product by its `id`.
- **Path Parameters**:
  - `id`: Product ID (Integer, Required)
- **Responses**:
  - `200 OK`: Successfully deleted the product.
  - `404 Not Found`: Product with the provided ID does not exist.

---

### **Get Seller's Products**

- **URL**: `/getMyProducts`
- **Method**: `GET`
- **Authentication**: Yes, required.
- **Description**: Retrieve all products added by the logged-in seller.
- **Responses**:
  - `200 OK`: Successfully retrieved the list of products.
  - `400 Bad Request`: No products available.

---

### Error Response Format

In case of an error, the API will return the following response format:

- **Response**:
  ```json
  {
    "success": false,
    "message": "Error message",
    "status": 400
  }
  ```

---

### Authentication Middleware

**isAuthenticated**: This middleware ensures that the user making the request is authenticated. It should be applied to all routes requiring authentication. If the user is not authenticated, the API will return a `401 Unauthorized` error.

## Buyers API Documentation

### Base URL

`/api/buyers`

---

### **Signup Buyer**

- **URL**: `/signup`
- **Method**: `POST`
- **Description**: Register a new buyer.
- **Request Body**:
  - `name`: Buyer's full name (String, Required)
  - `business_name`: Buyer's business name (String, Required)
  - `email`: Buyer's email (String, Required)
  - `password`: Buyer's password (String, Required, min length 6)
- **Responses**:
  - `201 Created`: Successfully signed up. The user data and a cookie are returned.
  - `400 Bad Request`: Validation errors like invalid email format, required fields, or password length.
  - `409 Conflict`: Buyer already exists.

---

### **Signin Buyer**

- **URL**: `/signin`
- **Method**: `POST`
- **Description**: Login a registered buyer.
- **Request Body**:
  - `email`: Buyer's email (String, Required)
  - `password`: Buyer's password (String, Required)
- **Responses**:
  - `201 Created`: Successfully signed in. The user data and a cookie are returned.
  - `400 Bad Request`: Invalid credentials or required fields.
  - `404 Not Found`: Buyer does not exist.

---

### **Logout Buyer**

- **URL**: `/logout`
- **Method**: `GET`
- **Description**: Logout the current buyer and clear the session cookie.
- **Responses**:
  - `200 OK`: Successfully logged out and cleared the cookie.

---

### **Get Buyer Profile**

- **URL**: `/me`
- **Method**: `GET`
- **Authentication**: Yes, required.
- **Description**: Retrieve the profile details of the currently logged-in buyer.
- **Responses**:
  - `200 OK`: Successfully retrieved buyer profile data.

---

### **Get All Products**

- **URL**: `/products`
- **Method**: `GET`
- **Authentication**: Yes, required.
- **Description**: Retrieve a list of all available products.
- **Responses**:
  - `200 OK`: Successfully retrieved the list of products.
  - `404 Not Found`: No products found.

---

### **Search Products by Category**

- **URL**: `/products/searchByCategory`
- **Method**: `GET`
- **Authentication**: Yes, required.
- **Description**: Search for products based on a specific category.
- **Query Parameters**:
  - `category`: Category of the product (String, Required)
- **Responses**:
  - `200 OK`: Successfully retrieved the list of products in the specified category.
  - `400 Bad Request`: If no category is provided.
  - `404 Not Found`: No products found in the given category.

---

### **Search Products by Name**

- **URL**: `/products/searchByName`
- **Method**: `GET`
- **Authentication**: Yes, required.
- **Description**: Search for products based on the name or likeness.
- **Query Parameters**:
  - `name`: Name of the product (String, Required)
- **Responses**:
  - `200 OK`: Successfully retrieved products that match the name query.
  - `400 Bad Request`: If no name is provided.
  - `404 Not Found`: No products found with the given name or likeness.

---

### **Get Product Categories**

- **URL**: `/products/getCategories`
- **Method**: `GET`
- **Authentication**: Yes, required.
- **Description**: Get a list of all distinct product categories.
- **Responses**:
  - `200 OK`: Successfully retrieved the list of product categories.
  - `404 Not Found`: No categories found.

---

### Error Response Format

In case of an error, the API will return the following response format:

- **Response**:
  ```json
  {
    "success": false,
    "message": "Error message",
    "status": 400
  }
  ```

---

hehehehhe

### Authentication Middleware

**isAuthenticated**: This middleware ensures that the user making the request is authenticated. It should be applied to all routes requiring authentication. If the user is not authenticated, the API will return a `401 Unauthorized` error.

