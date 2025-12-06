# Inventory Management System

A comprehensive, professional-grade inventory management system built with React and Node.js. Track products, manage stock levels, monitor transactions, and maintain supplier relationships - all with a beautiful, modern interface.

---

## ✨ Features

### **Dashboard**
- **Real-time Overview** - Complete system statistics at a glance
- **Key Metrics** - Total products, categories, suppliers, and transactions
- **Low Stock Alerts** - Immediate visibility of products needing attention
- **Recent Activity** - Latest transactions and newly added products
- **Visual Analytics** - Bar charts showing top categories by product count
- **Quick Actions** - One-click access to common tasks
- **Auto-calculated Statistics** - Inventory value, net stock change, and more

### **Product Management**
- **Complete CRUD Operations** - Create, read, update, and delete products
- **Product Details** - Name, description, stock level, unit of measure, unique code
- **Category Assignment** - Organize products into categories
- **Supplier Linking** - Track which supplier provides each product
- **Status Management** - Active, discontinued, or out-of-stock states
- **Bulk Operations** - Select and delete multiple products at once
- **Advanced Search** - Real-time search by name, code, or description
- **Multi-filter System** - Filter by category, status, and sort options
- **Stock Level Indicators** - Color-coded badges (green, yellow, red) for quick visual status
- **Dual View Modes** - Card grid and table layouts

### **Category Management**
- **Flexible Organization** - Create and manage product categories
- **Product Count Tracking** - See how many products in each category
- **Duplicate Prevention** - Unique category names enforced
- **Smart Deletion** - Handles products when categories are removed
- **Statistics Dashboard** - Active vs empty categories
- **Search Functionality** - Quick category lookup
- **Dual Display** - Grid cards and table view

### **Supplier Management**
- **Complete Supplier Profiles** - Company name, email, phone, address, contact person
- **Status Control** - Activate/deactivate suppliers
- **Product Association** - Link products to their suppliers
- **Contact Information** - Full supplier details for reordering
- **Active/Inactive Tracking** - Manage supplier relationships
- **Email Validation** - Ensures unique and valid supplier emails
- **Search & Filter** - Find suppliers quickly by any field

### **Stock Transaction System**
- **Professional Audit Trail** - Every stock change is recorded with full details
- **Transaction Types**:
  - **Stock In** - Receiving inventory from suppliers
  - **Stock Out** - Sales, issues, or shipments
  - **Adjustments** - Physical count corrections, damage, loss
  - **Returns** - Customer or supplier returns
- **Complete History** - User, timestamp, quantity, reason for every change
- **Stock Validation** - Cannot sell more than available stock
- **Reference Tracking** - Link to PO numbers, invoices, etc.
- **Notes/Reason Field** - Document why changes were made
- **Timeline View** - Beautiful visual transaction history
- **Advanced Filtering** - By type, product, date range, and search
- **Atomic Operations** - Database transactions ensure data integrity
- **User Accountability** - Track who made each change

### **Authentication & Security**
- **User Authentication** - Secure login and registration
- **JWT Tokens** - Stateless authentication
- **Password Hashing** - Secure password storage
- **Rate Limiting** - Protection against brute force attacks
- **Security Headers** - Helmet.js for enhanced security
- **CORS Configuration** - Controlled cross-origin access
- **Request Logging** - Track all API requests with IP and user agent
- **User-scoped Data** - Users only see their own inventory

### **User Interface**
- **Modern Design** - Clean, professional interface with gradient accents
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Hover effects, transitions, and micro-interactions
- **Color-coded System** - Consistent visual language throughout
- **Loading States** - Spinners and skeletons for better UX
- **Empty States** - Helpful messages when no data exists
- **Modal Dialogs** - Clean forms for adding and editing
- **Toast Notifications** - Success/error feedback
- **Professional Typography** - Clear hierarchy and readability

---

## Technology Stack

### **Frontend**
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with modern features

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - SQL ORM for database management
- **PostgreSQL/MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Winston** - Professional logging
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting
- **CORS** - Cross-origin resource sharing

---

## API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### **Products**
- `GET /api/products` - Get all products (with category & supplier)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Categories**
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### **Suppliers**
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `PATCH /api/suppliers/:id/toggle-status` - Activate/deactivate supplier

### **Stock Transactions**
- `GET /api/stock-transactions` - Get all transactions
- `GET /api/stock-transactions/:id` - Get single transaction
- `GET /api/stock-transactions/product/:productId` - Get product transaction history
- `POST /api/stock-transactions` - Create new transaction (auto-updates stock)
- `GET /api/stock-transactions/stats/summary` - Get transaction statistics

### **System**
- `GET /health` - Health check endpoint
- `GET /` - API information

---

## Key Business Logic

### **Stock Management Rules**
1. **No Direct Stock Editing** - Stock can only be changed through transactions
2. **Automatic Stock Updates** - Transactions automatically update product stock
3. **Stock Validation** - Cannot issue more stock than available
4. **Status Auto-update** - Products automatically marked "out-of-stock" when stock reaches 0
5. **Transaction Immutability** - Transactions cannot be edited (audit requirement)
6. **Database Locking** - Prevents race conditions during concurrent updates

### **Data Relationships**
- **Product → Category** (Many-to-One) - Products belong to one category
- **Product → Supplier** (Many-to-One) - Products have one primary supplier
- **Product → Transactions** (One-to-Many) - Products have many transactions
- **User → Products** (One-to-Many) - Users own their products
- **User → Transactions** (One-to-Many) - Users create transactions
- **Transaction → Product** (Many-to-One) - Transactions affect one product
- **Transaction → User** (Many-to-One) - Transactions recorded by one user

### **Validation & Constraints**
- Product names: 2-100 characters
- Category names: 1-50 characters, unique
- Supplier emails: Valid format, unique per user
- Stock quantities: Must be non-negative integers
- Transaction quantities: Must be positive integers
- Unique product codes: Auto-generated per category

---

## Security Features

- **Authentication Required** - All API endpoints protected (except login/register)
- **JWT Validation** - Tokens verified on every request
- **Password Security** - Bcrypt hashing with salt
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Security Headers** - XSS protection, no-sniff, frame options
- **CORS Protection** - Only allowed origins can access API
- **Input Validation** - All inputs sanitized and validated
- **SQL Injection Prevention** - Parameterized queries via Sequelize
- **Request Logging** - All requests logged with IP and user agent
- **Error Handling** - Secure error messages (no sensitive data leaks)

---

## Design Principles

1. **User-First Design** - Intuitive interface requiring minimal training
2. **Data Integrity** - Atomic operations and proper validation
3. **Audit Trail** - Complete history of all inventory changes
4. **Professional Standards** - Follows industry best practices
5. **Scalability** - Architecture supports growth
6. **Mobile-Ready** - Responsive design for on-the-go access
7. **Visual Feedback** - Clear indication of states and actions
8. **Error Prevention** - Validation prevents invalid operations

---

## Future Enhancements

- **Barcode/QR Code Generation** - Print labels for products
- **Multi-location Support** - Track stock across warehouses
- **Purchase Orders** - Create POs to suppliers
- **Sales Orders** - Manage customer orders
- **Reports & Analytics** - Advanced reporting features
- **Email Notifications** - Low stock alerts via email
- **Batch/Lot Tracking** - Expiry dates and FIFO
- **Multi-currency Support** - International operations
- **Mobile App** - Native iOS/Android apps
- **Export Functionality** - CSV/Excel/PDF exports
- **Advanced Search** - Elasticsearch integration
- **Real-time Updates** - WebSocket for live data

---

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Built with React and Node.js
- UI inspired by modern SaaS applications
- Database design following industry best practices
- Security patterns from OWASP guidelines

---

**Built for professional inventory management. Simple to use, powerful in functionality.** 