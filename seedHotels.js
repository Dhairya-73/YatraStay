const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");

mongoose
  .connect("mongodb://127.0.0.1:27017/yatrastay")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch(err => console.log(err));

const hotels = [
  {
    name: "The Grand Palace",
    location: "Mumbai, Maharashtra",
    price: 8999,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description: "Luxury 5-star hotel overlooking the Arabian Sea in South Mumbai. Features a private pool, high-speed WiFi, dedicated workspace, secure parking, and a premium wellness spa."
  },
  {
    name: "Royal Orchid Hotel",
    location: "Bangalore, Karnataka",
    price: 4499,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Elegant business hotel with modern comfort, spacious executive work desks, high-speed WiFi, air conditioning, and a stunning rooftop infinity pool."
  },
  {
    name: "Ocean View Resort",
    location: "Calangute, Goa",
    price: 7999,
    image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb2103c?auto=format&fit=crop&w=800&q=80",
    description: "Beachside luxury resort in North Goa with stunning ocean views, direct private beach access, a sprawling outdoor pool, and tropical landscaped gardens. Pet friendly."
  },
  {
    name: "Himalayan Retreat & Spa",
    location: "Manali, Himachal Pradesh",
    price: 4999,
    image: "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?auto=format&fit=crop&w=800&q=80",
    description: "Peaceful mountain retreat surrounded by towering pine forests and snow-capped peaks in Manali. Features cozy fireplace lounges, a local organic kitchen, and bonfire yards."
  },
  {
    name: "Desert Pearl Palace",
    location: "Jaipur, Rajasthan",
    price: 3899,
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    description: "Royal heritage hotel in Jaipur featuring traditional Rajasthani architecture, handcrafted marble arches, evening cultural performances, and gourmet local cuisine."
  },
  {
    name: "Taj Pichola Palace",
    location: "Udaipur, Rajasthan",
    price: 12999,
    image: "https://images.unsplash.com/photo-1543968332-f9947dbc2f95?auto=format&fit=crop&w=800&q=80",
    description: "An iconic luxury palace floating in Lake Pichola, Udaipur. Experience royal hospitality, antique heritage decor, private boat tours, and premium fine dining under the stars."
  },
  {
    name: "Munnar Tea Hills Lodge",
    location: "Munnar, Kerala",
    price: 5499,
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    description: "Charming wooden cottages nestled inside the misty tea plantations of Munnar. Perfect for nature lovers, offering trekking trails, birdwatching decks, and private bonfire setups."
  },
  {
    name: "Fort View Heritage Haveli",
    location: "Jodhpur, Rajasthan",
    price: 3200,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    description: "Stunning boutique haveli with direct views of the Mehrangarh Fort. Features intricate stone carvings, a rooftop restaurant, air conditioning, and authentic traditional hospitality."
  },
  {
    name: "The Park Capital Stay",
    location: "Connaught Place, Delhi",
    price: 6500,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    description: "Premium modern stay in the heart of New Delhi. Offers high-speed fiber WiFi, free private parking, a fitness gym, and immediate proximity to heritage sights and metro stations."
  },
  {
    name: "Whispering Pines Cabin",
    location: "Shimla, Himachal Pradesh",
    price: 4800,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    description: "Cozy A-frame pine cabin offering panoramic Himalayan valley views. Enjoy outdoor BBQ dining, private forest walks, bonfire nights, and pet-friendly lawns."
  },
  {
    name: "Coconut Grove Backwater Villa",
    location: "Alleppey, Kerala",
    price: 7200,
    image: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?auto=format&fit=crop&w=800&q=80",
    description: "Serene waterfront villa along the quiet Kerala backwaters in Alleppey. Offers private houseboat cruises, traditional Keralan kitchen dining, and a swimming pool."
  },
  {
    name: "Ganga Waves River Resort",
    location: "Rishikesh, Uttarakhand",
    price: 3600,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    description: "Peaceful riverside resort in Rishikesh featuring dedicated yoga decks, local adventure guidance, organic cafe dining, and private balconies overlooking the Ganges."
  },
  {
    name: "Wildflower Valley Cottage",
    location: "Ooty, Tamil Nadu",
    price: 5100,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    description: "Boutique hillside cottage in Ooty with botanical gardens, private bonfire lawns, breakfast included, and breathtaking mountain valley vistas."
  },
  {
    name: "Golkonda Elite Hotel",
    location: "Banjara Hills, Hyderabad",
    price: 7500,
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    description: "Sophisticated luxury stay in Banjara Hills, Hyderabad. Offers business-class suites, private pool access, high-speed WiFi, and a multi-cuisine specialty restaurant."
  },
  {
    name: "Marina Sands Hotel",
    location: "Marina Beach, Chennai",
    price: 5800,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    description: "Modern seaside hotel in Chennai. Offers ocean view balconies, local coastal seafood specialty restaurant, outdoor pool, and high-speed internet."
  }
];

async function seedDB() {
  await Hotel.deleteMany({});
  await Hotel.insertMany(hotels);
  console.log("Hotels added successfully");
  mongoose.connection.close();
}

seedDB();
