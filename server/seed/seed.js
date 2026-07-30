require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Car = require('../models/Car');
const InventoryHistory = require('../models/InventoryHistory');
const ServiceCenter = require('../models/ServiceCenter');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car-inventory';

const users = [
  {
    name: 'Admin User',
    email: 'admin@carinventory.com',
    password: 'Admin@1234',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'user@carinventory.com',
    password: 'User@1234',
    role: 'user',
  },
];

const carData = [
  { name: 'BMW 3 Series', brand: 'BMW', model: '330i', year: 2024, category: 'Sedan', color: 'Alpine White', fuelType: 'Petrol', transmission: 'Automatic', mileage: 15.6, engine: '2.0L TwinPower Turbo', horsepower: 255, price: 45000, stockQuantity: 8, description: 'The legendary 3 Series combines sport, style, and precision engineering.' },
  { name: 'Mercedes-Benz C-Class', brand: 'Mercedes-Benz', model: 'C300', year: 2024, category: 'Sedan', color: 'Obsidian Black', fuelType: 'Petrol', transmission: 'Automatic', mileage: 14.2, engine: '2.0L Turbo', horsepower: 255, price: 48000, stockQuantity: 5, description: 'Luxury redefined with cutting-edge technology and comfort.' },
  { name: 'Tesla Model 3', brand: 'Tesla', model: 'Model 3', year: 2024, category: 'Sedan', color: 'Pearl White', fuelType: 'Electric', transmission: 'Automatic', mileage: 60, engine: 'Dual Motor Electric', horsepower: 350, price: 42000, stockQuantity: 12, description: 'All-electric performance sedan with autopilot and zero emissions.' },
  { name: 'Toyota Land Cruiser', brand: 'Toyota', model: 'Land Cruiser 300', year: 2024, category: 'SUV', color: 'Precious Silver', fuelType: 'Diesel', transmission: 'Automatic', mileage: 11.5, engine: '3.3L V6 Diesel', horsepower: 306, price: 88000, stockQuantity: 3, description: 'The ultimate off-road SUV with legendary Toyota reliability.' },
  { name: 'Ford Mustang GT', brand: 'Ford', model: 'Mustang GT', year: 2024, category: 'Coupe', color: 'Grabber Blue', fuelType: 'Petrol', transmission: 'Manual', mileage: 12.8, engine: '5.0L V8 Coyote', horsepower: 450, price: 38000, stockQuantity: 6, description: 'American muscle at its finest — raw power and iconic style.' },
  { name: 'Porsche 911', brand: 'Porsche', model: '911 Carrera', year: 2024, category: 'Sports', color: 'Guards Red', fuelType: 'Petrol', transmission: 'Automatic', mileage: 13.0, engine: '3.0L Twin-Turbo Flat-6', horsepower: 379, price: 115000, stockQuantity: 2, description: 'Iconic sports car with unmatched driving dynamics and heritage.' },
  { name: 'Audi Q8', brand: 'Audi', model: 'Q8 55 TFSI', year: 2024, category: 'SUV', color: 'Mythos Black', fuelType: 'Petrol', transmission: 'Automatic', mileage: 12.4, engine: '3.0L V6 TFSI', horsepower: 335, price: 78000, stockQuantity: 4, description: 'The flagship SUV coupe with quattro all-wheel drive and premium luxury.' },
  { name: 'Honda Civic Type R', brand: 'Honda', model: 'Civic Type R', year: 2024, category: 'Hatchback', color: 'Championship White', fuelType: 'Petrol', transmission: 'Manual', mileage: 14.5, engine: '2.0L VTEC Turbo', horsepower: 315, price: 44000, stockQuantity: 7, description: 'Track-bred hot hatch delivering an electrifying driving experience.' },
  { name: 'Lamborghini Urus', brand: 'Lamborghini', model: 'Urus S', year: 2024, category: 'SUV', color: 'Arancio Borealis', fuelType: 'Petrol', transmission: 'Automatic', mileage: 9.8, engine: '4.0L V8 Twin-Turbo', horsepower: 666, price: 238000, stockQuantity: 1, description: 'The world\'s first Super Sport Utility Vehicle with breathtaking performance.' },
  { name: 'Range Rover Sport', brand: 'Land Rover', model: 'Range Rover Sport HSE', year: 2024, category: 'SUV', color: 'Santorini Black', fuelType: 'Diesel', transmission: 'Automatic', mileage: 13.2, engine: '3.0L I6 Diesel', horsepower: 249, price: 92000, stockQuantity: 4, description: 'British luxury meets all-terrain capability with effortless refinement.' },
  { name: 'Rolls-Royce Ghost', brand: 'Rolls-Royce', model: 'Ghost Series II', year: 2024, category: 'Luxury', color: 'Arctic White', fuelType: 'Petrol', transmission: 'Automatic', mileage: 8.5, engine: '6.75L V12 Twin-Turbo', horsepower: 563, price: 340000, stockQuantity: 1, description: 'The pinnacle of automotive luxury — hand-crafted excellence.' },
  { name: 'Toyota GR86', brand: 'Toyota', model: 'GR86', year: 2024, category: 'Coupe', color: 'Icy Silver', fuelType: 'Petrol', transmission: 'Manual', mileage: 14.9, engine: '2.4L Boxer', horsepower: 228, price: 32000, stockQuantity: 9, description: 'Pure sports car experience with a perfectly balanced chassis.' },
  { name: 'Hyundai IONIQ 6', brand: 'Hyundai', model: 'IONIQ 6 SE', year: 2024, category: 'Sedan', color: 'Gravity Gold Matte', fuelType: 'Electric', transmission: 'Automatic', mileage: 55, engine: 'Dual Motor Electric', horsepower: 320, price: 38500, stockQuantity: 10, description: 'Streamlined EV with 600km range and ultra-fast charging capability.' },
  { name: 'Chevrolet Silverado', brand: 'Chevrolet', model: 'Silverado 1500 LTZ', year: 2024, category: 'Pickup Truck', color: 'Slate Gray', fuelType: 'Petrol', transmission: 'Automatic', mileage: 11.2, engine: '5.3L EcoTec3 V8', horsepower: 355, price: 52000, stockQuantity: 6, description: 'America\'s most trusted full-size pickup — built for work and adventure.' },
  { name: 'Jeep Wrangler', brand: 'Jeep', model: 'Wrangler Rubicon', year: 2024, category: 'SUV', color: 'Firecracker Red', fuelType: 'Petrol', transmission: 'Manual', mileage: 12.5, engine: '3.6L Pentastar V6', horsepower: 285, price: 48000, stockQuantity: 5, description: 'The ultimate off-road icon — freedom and adventure in every drive.' },
  { name: 'McLaren 720S', brand: 'McLaren', model: '720S', year: 2024, category: 'Sports', color: 'Papaya Spark', fuelType: 'Petrol', transmission: 'Automatic', mileage: 10.5, engine: '4.0L V8 Twin-Turbo', horsepower: 720, price: 320000, stockQuantity: 1, description: 'Track-focused supercar with 0-100 kmph in 2.9 seconds.' },
  { name: 'Volkswagen Golf GTI', brand: 'Volkswagen', model: 'Golf GTI MK8', year: 2024, category: 'Hatchback', color: 'Tornado Red', fuelType: 'Petrol', transmission: 'Automatic', mileage: 15.2, engine: '2.0L TSI Turbo', horsepower: 245, price: 34000, stockQuantity: 11, description: 'The original hot hatch — everyday usability with sporty performance.' },
  { name: 'Mercedes-Benz GLE', brand: 'Mercedes-Benz', model: 'GLE 450', year: 2024, category: 'SUV', color: 'Iridium Silver', fuelType: 'Hybrid', transmission: 'Automatic', mileage: 18.5, engine: '3.0L I6 Mild Hybrid', horsepower: 362, price: 72000, stockQuantity: 3, description: 'Full-size luxury SUV with intelligent hybrid drive and supreme comfort.' },
  { name: 'Ferrari Roma', brand: 'Ferrari', model: 'Roma', year: 2024, category: 'Coupe', color: 'Rosso Portofino', fuelType: 'Petrol', transmission: 'Automatic', mileage: 11.8, engine: '3.9L V8 Twin-Turbo', horsepower: 612, price: 230000, stockQuantity: 1, description: 'La dolce vita on wheels — Italian elegance with Ferrari performance.' },
  { name: 'Toyota Camry Hybrid', brand: 'Toyota', model: 'Camry XLE Hybrid', year: 2024, category: 'Sedan', color: 'Wind Chill Pearl', fuelType: 'Hybrid', transmission: 'CVT', mileage: 22.5, engine: '2.5L Hybrid', horsepower: 208, price: 32000, stockQuantity: 0, description: 'Mid-size hybrid sedan delivering exceptional fuel efficiency and comfort.' },
];

const serviceCenters = [
  // BMW
  { brand: 'BMW', name: 'BMW Mumbai South', city: 'Mumbai', state: 'Maharashtra', address: '14, Nariman Point, Mumbai – 400021', phone: '+91 22 6622 6622', email: 'mumbaisouth@bmwindia.com', rating: 4.7, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Test Drive', 'Parts'] },
  { brand: 'BMW', name: 'BMW Delhi Connaught Place', city: 'New Delhi', state: 'Delhi', address: 'Block A, Connaught Place, New Delhi – 110001', phone: '+91 11 4567 8901', email: 'delhi@bmwindia.com', rating: 4.5, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Test Drive', 'Body Shop'] },
  { brand: 'BMW', name: 'BMW Bangalore Central', city: 'Bangalore', state: 'Karnataka', address: 'MG Road, Bangalore – 560001', phone: '+91 80 2222 3333', email: 'bangalore@bmwindia.com', rating: 4.6, timings: 'Mon–Sat: 8:30AM–6:30PM', services: ['Service', 'Repair', 'Accessories'] },
  // Mercedes-Benz
  { brand: 'Mercedes-Benz', name: 'Mercedes-Benz Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Bandra Kurla Complex, Mumbai – 400051', phone: '+91 22 7788 9900', email: 'mumbai@mercedes-benz.co.in', rating: 4.8, timings: 'Mon–Sat: 9AM–7PM', services: ['Service', 'Repair', 'Test Drive', 'Detailing', 'Parts'] },
  { brand: 'Mercedes-Benz', name: 'Mercedes-Benz Pune', city: 'Pune', state: 'Maharashtra', address: 'Koregaon Park, Pune – 411001', phone: '+91 20 4455 6677', email: 'pune@mercedes-benz.co.in', rating: 4.6, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Body Shop'] },
  { brand: 'Mercedes-Benz', name: 'Mercedes-Benz Hyderabad', city: 'Hyderabad', state: 'Telangana', address: 'Jubilee Hills, Hyderabad – 500033', phone: '+91 40 3344 5566', email: 'hyderabad@mercedes-benz.co.in', rating: 4.4, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Accessories'] },
  // Tesla
  { brand: 'Tesla', name: 'Tesla Mumbai Service Center', city: 'Mumbai', state: 'Maharashtra', address: 'Lower Parel, Mumbai – 400013', phone: '+91 22 9988 7766', email: 'mumbai@tesla.com', rating: 4.9, timings: 'Mon–Fri: 9AM–6PM, Sat: 10AM–4PM', services: ['Service', 'Software Update', 'Charging', 'Collision Repair'] },
  { brand: 'Tesla', name: 'Tesla Bangalore Service Center', city: 'Bangalore', state: 'Karnataka', address: 'Whitefield, Bangalore – 560066', phone: '+91 80 5566 7788', email: 'bangalore@tesla.com', rating: 4.8, timings: 'Mon–Fri: 9AM–6PM', services: ['Service', 'Software Update', 'Charging'] },
  // Toyota
  { brand: 'Toyota', name: 'Toyota Kirloskar Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Andheri West, Mumbai – 400058', phone: '+91 22 6677 8899', email: 'mumbai@toyotakirloskar.com', rating: 4.5, timings: 'Mon–Sat: 8AM–7PM', services: ['Service', 'Repair', 'Genuine Parts', 'Test Drive'] },
  { brand: 'Toyota', name: 'Toyota Kirloskar Chennai', city: 'Chennai', state: 'Tamil Nadu', address: 'Anna Salai, Chennai – 600002', phone: '+91 44 2233 4455', email: 'chennai@toyotakirloskar.com', rating: 4.4, timings: 'Mon–Sat: 8AM–7PM', services: ['Service', 'Repair', 'Parts'] },
  { brand: 'Toyota', name: 'Toyota Kirloskar Kolkata', city: 'Kolkata', state: 'West Bengal', address: 'Park Street, Kolkata – 700016', phone: '+91 33 4455 6677', email: 'kolkata@toyotakirloskar.com', rating: 4.3, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair'] },
  // Audi
  { brand: 'Audi', name: 'Audi Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Worli, Mumbai – 400018', phone: '+91 22 2234 5678', email: 'mumbai@audi.in', rating: 4.7, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Test Drive', 'Accessories', 'Body Shop'] },
  { brand: 'Audi', name: 'Audi Delhi', city: 'New Delhi', state: 'Delhi', address: 'Greater Kailash, New Delhi – 110048', phone: '+91 11 5566 7788', email: 'delhi@audi.in', rating: 4.5, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Parts'] },
  // Porsche
  { brand: 'Porsche', name: 'Porsche Centre Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Prabhadevi, Mumbai – 400025', phone: '+91 22 3344 5566', email: 'mumbai@porsche.in', rating: 4.9, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Test Drive', 'Detailing'] },
  { brand: 'Porsche', name: 'Porsche Centre Delhi', city: 'New Delhi', state: 'Delhi', address: 'Vasant Kunj, New Delhi – 110070', phone: '+91 11 6677 8899', email: 'delhi@porsche.in', rating: 4.8, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Accessories'] },
  // Ford
  { brand: 'Ford', name: 'Ford Service Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Thane West, Mumbai – 400601', phone: '+91 22 7788 0011', email: 'mumbai@ford.in', rating: 4.2, timings: 'Mon–Sat: 8AM–6PM', services: ['Service', 'Repair', 'Parts', 'Body Shop'] },
  { brand: 'Ford', name: 'Ford Service Delhi', city: 'New Delhi', state: 'Delhi', address: 'Rohini, New Delhi – 110085', phone: '+91 11 8899 0011', email: 'delhi@ford.in', rating: 4.1, timings: 'Mon–Sat: 8AM–6PM', services: ['Service', 'Repair'] },
  // Honda
  { brand: 'Honda', name: 'Honda Cars Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Dadar, Mumbai – 400014', phone: '+91 22 9900 1122', email: 'mumbai@hondacarsindia.com', rating: 4.4, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Genuine Parts', 'Accessories'] },
  { brand: 'Honda', name: 'Honda Cars Pune', city: 'Pune', state: 'Maharashtra', address: 'Viman Nagar, Pune – 411014', phone: '+91 20 1122 3344', email: 'pune@hondacarsindia.com', rating: 4.3, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair'] },
  // Lamborghini
  { brand: 'Lamborghini', name: 'Lamborghini Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Pedder Road, Mumbai – 400026', phone: '+91 22 2233 4455', email: 'mumbai@lamborghini-india.com', rating: 5.0, timings: 'Mon–Fri: 10AM–5PM (By Appointment)', services: ['Service', 'Repair', 'Concierge', 'Detailing'] },
  // Land Rover
  { brand: 'Land Rover', name: 'Land Rover Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Powai, Mumbai – 400076', phone: '+91 22 4455 6677', email: 'mumbai@landrover-india.com', rating: 4.6, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Off-Road Assessment', 'Parts'] },
  // Rolls-Royce
  { brand: 'Rolls-Royce', name: 'Rolls-Royce Motor Cars Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Altamount Road, Mumbai – 400026', phone: '+91 22 3344 7788', email: 'mumbai@rolls-roycemotorcars.com', rating: 5.0, timings: 'Mon–Fri: 10AM–5PM (By Appointment)', services: ['Bespoke Service', 'Repair', 'Detailing', 'Storage'] },
  // Hyundai
  { brand: 'Hyundai', name: 'Hyundai Service Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Andheri East, Mumbai – 400069', phone: '+91 22 5566 7788', email: 'mumbai@hyundai.in', rating: 4.3, timings: 'Mon–Sat: 8AM–7PM', services: ['Service', 'Repair', 'EV Charging', 'Parts'] },
  { brand: 'Hyundai', name: 'Hyundai Service Bangalore', city: 'Bangalore', state: 'Karnataka', address: 'Indiranagar, Bangalore – 560038', phone: '+91 80 6677 8899', email: 'bangalore@hyundai.in', rating: 4.2, timings: 'Mon–Sat: 8AM–7PM', services: ['Service', 'Repair', 'EV Charging'] },
  // McLaren
  { brand: 'McLaren', name: 'McLaren Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Tardeo, Mumbai – 400034', phone: '+91 22 9988 5544', email: 'mumbai@mclaren.com', rating: 5.0, timings: 'Mon–Fri: 10AM–5PM (By Appointment)', services: ['Service', 'Repair', 'Track Support', 'Detailing'] },
  // Ferrari
  { brand: 'Ferrari', name: 'Ferrari Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Worli Sea Face, Mumbai – 400030', phone: '+91 22 7766 5544', email: 'mumbai@ferrari-india.com', rating: 5.0, timings: 'Mon–Fri: 10AM–5PM (By Appointment)', services: ['Service', 'Repair', 'Bespoke', 'Track Support'] },
  // Chevrolet
  { brand: 'Chevrolet', name: 'Chevrolet Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Malad West, Mumbai – 400064', phone: '+91 22 3322 1100', email: 'mumbai@gmindia.com', rating: 4.0, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Parts'] },
  // Volkswagen
  { brand: 'Volkswagen', name: 'Volkswagen Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Santacruz, Mumbai – 400055', phone: '+91 22 6655 4433', email: 'mumbai@vw.in', rating: 4.4, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Accessories', 'Parts'] },
  { brand: 'Volkswagen', name: 'Volkswagen Bangalore', city: 'Bangalore', state: 'Karnataka', address: 'Jayanagar, Bangalore – 560041', phone: '+91 80 7788 9900', email: 'bangalore@vw.in', rating: 4.3, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair'] },
  // Jeep
  { brand: 'Jeep', name: 'Jeep Mumbai', city: 'Mumbai', state: 'Maharashtra', address: 'Goregaon, Mumbai – 400063', phone: '+91 22 5544 3322', email: 'mumbai@jeepindia.com', rating: 4.2, timings: 'Mon–Sat: 9AM–6PM', services: ['Service', 'Repair', 'Off-Road Prep', 'Parts'] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Car.deleteMany(),
      InventoryHistory.deleteMany(),
      ServiceCenter.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create cars with admin as creator
    const carsWithCreator = carData.map((car) => ({
      ...car,
      createdBy: adminUser._id,
    }));
    const createdCars = await Car.create(carsWithCreator);
    console.log(`🚗 Created ${createdCars.length} cars`);

    // Create sample inventory history
    const historyEntries = [];
    for (let i = 0; i < 15; i++) {
      const car = createdCars[Math.floor(Math.random() * createdCars.length)];
      const action = Math.random() > 0.4 ? 'purchase' : 'restock';
      const qty = Math.floor(Math.random() * 3) + 1;
      historyEntries.push({
        car: car._id,
        user: action === 'purchase' ? createdUsers[1]._id : adminUser._id,
        action,
        quantity: qty,
        priceAtTime: car.price,
        stockBefore: car.stockQuantity + (action === 'purchase' ? qty : -qty),
        stockAfter: car.stockQuantity,
        totalAmount: action === 'purchase' ? car.price * qty : 0,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }
    await InventoryHistory.create(historyEntries);
    console.log(`📦 Created ${historyEntries.length} inventory history entries`);

    // Seed service centers
    await ServiceCenter.insertMany(serviceCenters);
    console.log(`🔧 Created ${serviceCenters.length} service centers`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin   : admin@carinventory.com');
    console.log('  Password: Admin@1234');
    console.log('  User    : user@carinventory.com');
    console.log('  Password: User@1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
