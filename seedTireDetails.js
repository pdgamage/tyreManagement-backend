require('dotenv').config();
const TireDetails = require('./models/TireDetails');
const { sequelize } = require('./config/db');

const sampleTireDetails = [
  {
    tire_size: '120*80*18*6PR',
    tire_brand: 'Bridgestone',
    total_price: 15000,
    warranty_distance: 50000
  },
  {
    tire_size: '145/80R13',
    tire_brand: 'Michelin',
    total_price: 12000,
    warranty_distance: 45000
  },
  {
    tire_size: '155/80R13',
    tire_brand: 'Continental',
    total_price: 13500,
    warranty_distance: 48000
  },
  {
    tire_size: '165/80R14',
    tire_brand: 'Goodyear',
    total_price: 14500,
    warranty_distance: 50000
  },
  {
    tire_size: '175/70R14',
    tire_brand: 'Pirelli',
    total_price: 16000,
    warranty_distance: 52000
  },
  {
    tire_size: '185/65R15',
    tire_brand: 'Yokohama',
    total_price: 17500,
    warranty_distance: 55000
  },
  {
    tire_size: '195/65R15',
    tire_brand: 'Dunlop',
    total_price: 18000,
    warranty_distance: 55000
  },
  {
    tire_size: '205/55R16',
    tire_brand: 'Hankook',
    total_price: 20000,
    warranty_distance: 60000
  },
  {
    tire_size: '215/60R16',
    tire_brand: 'Kumho',
    total_price: 21000,
    warranty_distance: 60000
  },
  {
    tire_size: '225/45R17',
    tire_brand: 'Toyo',
    total_price: 25000,
    warranty_distance: 65000
  },
  {
    tire_size: '235/45R17',
    tire_brand: 'Falken',
    total_price: 26000,
    warranty_distance: 65000
  },
  {
    tire_size: '245/40R18',
    tire_brand: 'Nitto',
    total_price: 30000,
    warranty_distance: 70000
  }
];

async function seedTireDetails() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the TireDetails model
    await TireDetails.sync({ force: false });
    console.log('TireDetails table synced.');

    // Check if data already exists
    const existingCount = await TireDetails.count();
    console.log(`Existing tire details count: ${existingCount}`);

    if (existingCount === 0) {
      // Insert sample data
      await TireDetails.bulkCreate(sampleTireDetails);
      console.log('Sample tire details inserted successfully!');
      
      // Verify insertion
      const newCount = await TireDetails.count();
      console.log(`New tire details count: ${newCount}`);
    } else {
      console.log('Tire details already exist. Skipping seed.');
    }

    // Display all tire sizes
    const allTireDetails = await TireDetails.findAll({
      attributes: ['tire_size', 'tire_brand', 'total_price'],
      order: [['tire_size', 'ASC']]
    });
    
    console.log('\nAll tire details:');
    allTireDetails.forEach(tire => {
      console.log(`- ${tire.tire_size} (${tire.tire_brand}) - $${tire.total_price}`);
    });

  } catch (error) {
    console.error('Error seeding tire details:', error);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the seed function
seedTireDetails();
