# 🏥 ABK Pharmacy Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-orange.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive **pharmacy inventory management system** designed for modern pharmacies. Features real-time inventory tracking, automated stock alerts, sales processing, and comprehensive reporting capabilities.

## ✨ Key Features

### 📦 **Inventory Management**
- Real-time stock tracking
- Automated low-stock alerts
- Expiry date monitoring
- Barcode scanning support
- Multi-location inventory

### 💰 **Sales & Revenue**
- Point-of-sale processing
- Customer management
- Transaction history
- Revenue analytics
- Receipt generation

### 📊 **Reports & Analytics**
- Sales performance reports
- Inventory status reports
- Financial summaries
- Export capabilities
- Dashboard insights

### 🔐 **Security & Access**
- Role-based authentication
- User management
- Session security
- Audit trails

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Beratokl/ABK-Pharmacy-System.git
cd ABK-Pharmacy-System

# Install dependencies
npm install

# Setup database and sample data
node complete-setup.js

# Start the server
npm start
```

### Access the System

🌐 **Web Interface:** [http://localhost:3000](http://localhost:3000)

**Default Credentials:**
- **Admin:** `admin` / `admin123`
- **Pharmacist:** `pharmacist` / `pharma123`
- **Technician:** `tech` / `tech123`

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Frontend:** HTML5, CSS3, JavaScript
- **Authentication:** Express Sessions
- **Architecture:** MVC Pattern

## 📁 Project Structure

```
ABK-Pharmacy-System/
├── 📂 database/           # Database files and migrations
├── 📂 public/             # Frontend assets
├── 📂 routes/             # API endpoints
├── 📂 src/                # Controllers and middleware
├── 📄 server.js           # Main application entry
├── 📄 package.json        # Dependencies
└── 📄 README.md           # Documentation
```

## 🔧 Available Scripts

```bash
# Start the application
npm start

# Setup database with sample data
node complete-setup.js

# Add sample users
node add-users.js

# Add sample inventory
node sample-data.js

# Test login functionality
node test-login.js
```

## 📈 System Capabilities

| Feature | Description |
|---------|-------------|
| **Inventory Tracking** | Real-time stock levels with automatic updates |
| **Sales Processing** | Complete POS system with receipt generation |
| **Alert System** | Automated notifications for low stock & expiry |
| **User Management** | Role-based access control (Admin/Pharmacist/Tech) |
| **Reporting** | Comprehensive business intelligence reports |
| **Backup & Export** | Data backup and export functionality |
| **Barcode Support** | Product scanning and identification |
| **Customer Management** | Customer profiles and purchase history |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- 📧 Email: support@abkpharmacy.com
- 🐛 Issues: [GitHub Issues](https://github.com/Beratokl/ABK-Pharmacy-System/issues)

---

<div align="center">
  <strong>Built with ❤️ for modern pharmacy management</strong>
</div>