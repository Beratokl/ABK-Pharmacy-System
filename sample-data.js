const Database = require('./database/db');

const db = new Database();
db.init();

const sampleData = [
    // Pain Relief
    { name: 'Panadol Extra', category: 'Pain Relief', quantity: 150, unit_price: 8.50, supplier: 'GSK', expiry_date: '2025-08-15', reorder_level: 20 },
    { name: 'Advil 200mg', category: 'Pain Relief', quantity: 5, unit_price: 12.75, supplier: 'Pfizer', expiry_date: '2024-12-30', reorder_level: 15 },
    { name: 'Aspirin 100mg', category: 'Pain Relief', quantity: 200, unit_price: 6.25, supplier: 'Bayer', expiry_date: '2026-03-20', reorder_level: 25 },
    
    // Antibiotics
    { name: 'Amoxicillin 500mg', category: 'Antibiotics', quantity: 8, unit_price: 25.00, supplier: 'Sandoz', expiry_date: '2024-06-15', reorder_level: 10 },
    { name: 'Augmentin 625mg', category: 'Antibiotics', quantity: 45, unit_price: 35.50, supplier: 'GSK', expiry_date: '2025-01-10', reorder_level: 12 },
    { name: 'Azithromycin 250mg', category: 'Antibiotics', quantity: 30, unit_price: 28.75, supplier: 'Pfizer', expiry_date: '2025-09-05', reorder_level: 8 },
    
    // Cold & Flu
    { name: 'Panadol Cold & Flu', category: 'Cold & Flu', quantity: 3, unit_price: 15.25, supplier: 'GSK', expiry_date: '2024-11-20', reorder_level: 10 },
    { name: 'Sudafed PE', category: 'Cold & Flu', quantity: 75, unit_price: 18.50, supplier: 'Johnson & Johnson', expiry_date: '2025-07-12', reorder_level: 15 },
    { name: 'Robitussin DM', category: 'Cold & Flu', quantity: 40, unit_price: 22.00, supplier: 'Pfizer', expiry_date: '2025-04-18', reorder_level: 12 },
    
    // Vitamins
    { name: 'Centrum Multivitamin', category: 'Vitamins', quantity: 120, unit_price: 32.99, supplier: 'Pfizer', expiry_date: '2026-02-28', reorder_level: 20 },
    { name: 'Vitamin D3 1000IU', category: 'Vitamins', quantity: 85, unit_price: 19.75, supplier: 'Nature Made', expiry_date: '2025-12-15', reorder_level: 25 },
    { name: 'Vitamin C 500mg', category: 'Vitamins', quantity: 2, unit_price: 16.50, supplier: 'Blackmores', expiry_date: '2024-10-30', reorder_level: 15 },
    
    // Diabetes
    { name: 'Metformin 500mg', category: 'Diabetes', quantity: 60, unit_price: 18.25, supplier: 'Teva', expiry_date: '2025-06-08', reorder_level: 20 },
    { name: 'Glucophage XR 750mg', category: 'Diabetes', quantity: 35, unit_price: 42.50, supplier: 'Merck', expiry_date: '2025-11-22', reorder_level: 15 },
    
    // Heart & Blood Pressure
    { name: 'Lisinopril 10mg', category: 'Cardiovascular', quantity: 90, unit_price: 24.75, supplier: 'Lupin', expiry_date: '2025-08-30', reorder_level: 18 },
    { name: 'Amlodipine 5mg', category: 'Cardiovascular', quantity: 7, unit_price: 21.00, supplier: 'Pfizer', expiry_date: '2024-09-12', reorder_level: 12 },
    
    // Stomach & Digestion
    { name: 'Omeprazole 20mg', category: 'Gastro', quantity: 110, unit_price: 16.75, supplier: 'AstraZeneca', expiry_date: '2025-10-05', reorder_level: 20 },
    { name: 'Gaviscon Liquid', category: 'Gastro', quantity: 1, unit_price: 12.25, supplier: 'Reckitt', expiry_date: '2024-07-25', reorder_level: 8 },
    
    // Allergy
    { name: 'Claritin 10mg', category: 'Allergy', quantity: 65, unit_price: 28.50, supplier: 'Bayer', expiry_date: '2025-05-14', reorder_level: 15 },
    { name: 'Zyrtec 10mg', category: 'Allergy', quantity: 4, unit_price: 26.75, supplier: 'Johnson & Johnson', expiry_date: '2024-08-18', reorder_level: 10 }
];

const personnelData = [
    { name: 'Dr. Sarah Ahmed', role: 'Pharmacist', email: 'sarah.ahmed@abkpharmacy.com', phone: '+971-50-123-4567' },
    { name: 'Mohammed Al-Rashid', role: 'Pharmacy Technician', email: 'mohammed.rashid@abkpharmacy.com', phone: '+971-55-987-6543' },
    { name: 'Fatima Hassan', role: 'Assistant Pharmacist', email: 'fatima.hassan@abkpharmacy.com', phone: '+971-52-456-7890' },
    { name: 'Ahmed Abdullah', role: 'Store Manager', email: 'ahmed.abdullah@abkpharmacy.com', phone: '+971-50-789-1234' }
];

function insertSampleData() {
    console.log('Inserting sample inventory data...');
    
    sampleData.forEach(item => {
        const sql = `INSERT INTO inventory (name, category, quantity, unit_price, supplier, expiry_date, reorder_level) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.getDb().run(sql, [item.name, item.category, item.quantity, item.unit_price, item.supplier, item.expiry_date, item.reorder_level], function(err) {
            if (err) {
                console.error('Error inserting item:', item.name, err.message);
            } else {
                console.log(`✓ Added: ${item.name}`);
            }
        });
    });
    
    console.log('\nInserting sample personnel data...');
    
    personnelData.forEach(person => {
        const sql = 'INSERT INTO personnel (name, role, email, phone) VALUES (?, ?, ?, ?)';
        
        db.getDb().run(sql, [person.name, person.role, person.email, person.phone], function(err) {
            if (err) {
                console.error('Error inserting personnel:', person.name, err.message);
            } else {
                console.log(`✓ Added: ${person.name}`);
            }
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 Sample data insertion completed!');
        console.log('📊 Summary:');
        console.log(`   • ${sampleData.length} inventory items added`);
        console.log(`   • ${personnelData.length} personnel records added`);
        console.log('   • Several items are low stock (will trigger alerts)');
        console.log('   • Some items expire soon (will trigger alerts)');
        console.log('\n🚀 Start your server with: npm start');
        process.exit(0);
    }, 2000);
}

insertSampleData();