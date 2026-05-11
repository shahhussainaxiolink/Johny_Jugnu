import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem, Deal } from './models/Menu.js';

dotenv.config();

const menuItems = [
  { id: 1, name: "The Classic Smash", category: "Burgers", price: 650, rating: 4.8, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", description: "Juicy smash burger with all the fixings" },
  { id: 2, name: "Spicy Crunch Burger", category: "Burgers", price: 750, rating: 4.9, img: "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=600&q=80", description: "Spicy burger with crunchy coating" },
  { id: 3, name: "Loaded Animal Fries", category: "Fries", price: 450, rating: 4.7, img: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=600&q=80", description: "Fries loaded with cheese and toppings" },
  { id: 4, name: "Zinger Wrap Combo", category: "Wraps", price: 550, rating: 4.5, img: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80", description: "Crispy chicken wrap with combo sides" },
  { id: 5, name: "Neon Mint Margarita", category: "Drinks", price: 250, rating: 4.6, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", description: "Refreshing mint margarita" },
  { id: 6, name: "Midnight Deal 1", category: "Deals", price: 1100, rating: 4.9, img: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&w=600&q=80", description: "Combo deal with multiple items" },
];

const dealsData = [
  {
    id: 1,
    name: "The Jugnu Platter",
    desc: "2 Classic Smash, 1 Loaded Animal Fries, 2 Drinks.",
    oldPrice: 2300,
    newPrice: 1850,
    img: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    name: "Midnight Feast",
    desc: "1 Spicy Crunch, 1 Zinger Wrap, 2 Mint Margaritas.",
    oldPrice: 1950,
    newPrice: 1550,
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/johnny-jugnu');
    console.log('Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    await Deal.deleteMany({});
    console.log('Cleared existing data');

    // Insert menu items
    await MenuItem.insertMany(menuItems);
    console.log('Inserted menu items');

    // Insert deals
    await Deal.insertMany(dealsData);
    console.log('Inserted deals');

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();