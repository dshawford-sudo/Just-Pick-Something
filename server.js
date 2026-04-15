const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Mock restaurant API (THIS FIXES YOUR ISSUE)
app.get("/api/restaurants", (req, res) => {
    const { lat, lng } = req.query;

    console.log("Request received:", lat, lng);

    const restaurants = [
        {
            name: "Burger Palace",
            rating: 4.5,
            image: "https://source.unsplash.com/400x300/?burger"
        },
        {
            name: "Pizza Town",
            rating: 4.7,
            image: "https://source.unsplash.com/400x300/?pizza"
        },
        {
            name: "Sushi World",
            rating: 4.6,
            image: "https://source.unsplash.com/400x300/?sushi"
        },
        {
            name: "Taco Spot",
            rating: 4.4,
            image: "https://source.unsplash.com/400x300/?tacos"
        }
    ];

    res.json(restaurants);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
