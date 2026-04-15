function fetchRestaurants() {

    // FAKE RESTAURANT DATA (NO SERVER NEEDED)
    const data = [
        {
            name: "Burger Palace",
            rating: 4.6,
            image: "https://source.unsplash.com/400x300/?burger"
        },
        {
            name: "Pizza Central",
            rating: 4.7,
            image: "https://source.unsplash.com/400x300/?pizza"
        },
        {
            name: "Sushi Express",
            rating: 4.5,
            image: "https://source.unsplash.com/400x300/?sushi"
        },
        {
            name: "Taco Fiesta",
            rating: 4.4,
            image: "https://source.unsplash.com/400x300/?taco"
        },
        {
            name: "Noodle House",
            rating: 4.6,
            image: "https://source.unsplash.com/400x300/?noodles"
        },
        {
            name: "Chicken Spot",
            rating: 4.3,
            image: "https://source.unsplash.com/400x300/?chicken"
        }
    ];

    // SIMULATE LOADING
    setTimeout(() => {
        state.restaurants = data;
        state.index = 0;
        state.matches = [];
        showSwipe();
    }, 500);
}
