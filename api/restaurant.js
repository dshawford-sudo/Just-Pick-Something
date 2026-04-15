export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    mode,
    zip,
    lat,
    lng,
    radius = "4800",
    cuisine = "Any",
    priceLevel = "Any"
  } = req.query;

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const geocodeApiKey =
    process.env.GOOGLE_GEOCODING_API_KEY || googleApiKey;

  try {
    if (mode === "geocode") {
      if (!zip) {
        return res.status(400).json({ error: "ZIP code required" });
      }

      if (!geocodeApiKey) {
        return res.status(200).json({
          lat: 35.2271,
          lng: -80.8431,
          label: "Charlotte, NC (Mock)"
        });
      }

      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          zip
        )}&key=${geocodeApiKey}`
      );

      const geoData = await geoRes.json();

      if (
        geoData.status !== "OK" ||
        !geoData.results ||
        !geoData.results.length
      ) {
        return res.status(400).json({ error: "Invalid ZIP code" });
      }

      const loc = geoData.results[0];

      return res.status(200).json({
        lat: loc.geometry.location.lat,
        lng: loc.geometry.location.lng,
        label: loc.formatted_address
      });
    }

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Missing latitude and longitude"
      });
    }

    if (!googleApiKey) {
      return res.status(200).json(getMockRestaurants());
    }

    const includedTypes = buildIncludedTypes(cuisine);

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleApiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.location"
        },
        body: JSON.stringify({
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude: Number(lat),
                longitude: Number(lng)
              },
              radius: Number(radius)
            }
          },
          includedTypes
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json(getMockRestaurants());
    }

    const results = (data.places || []).map(place => ({
      name: place.displayName?.text || "Restaurant",
      rating: place.rating || "N/A",
      address: place.formattedAddress || "",
      priceLevel: normalizePriceLevel(place.priceLevel),
      cuisine: cuisine === "Any" ? "Restaurant" : cuisine,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      mapsUrl: ""
    }));

    return res.status(200).json(
      results.length ? results : getMockRestaurants()
    );
  } catch (error) {
    return res.status(200).json(getMockRestaurants());
  }
}

function buildIncludedTypes(cuisine) {
  const map = {
    any: ["restaurant"],
    italian: ["italian_restaurant"],
    mexican: ["mexican_restaurant"],
    american: ["american_restaurant"],
    pizza: ["pizza_restaurant"],
    burgers: ["hamburger_restaurant"]
  };

  return map[String(cuisine).toLowerCase()] || ["restaurant"];
}

function normalizePriceLevel(level) {
  const map = {
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
  };

  return map[level] || "$$";
}

function getMockRestaurants() {
  return [
    {
      name: "Tasty Bites",
      rating: 4.5,
      address: "123 Main St",
      priceLevel: "$$",
      cuisine: "American",
      image:
        "https://images.unsplash.com/photo-1555992336-03a23c6c2b1d",
      mapsUrl: ""
    },
    {
      name: "Pizza Palace",
      rating: 4.2,
      address: "456 Elm St",
      priceLevel: "$",
      cuisine: "Pizza",
      image:
        "https://images.unsplash.com/photo-1548365328-9f547fb0953d",
      mapsUrl: ""
    },
    {
      name: "Fiesta Grill",
      rating: 4.6,
      address: "789 Oak St",
      priceLevel: "$$",
      cuisine: "Mexican",
      image:
        "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
      mapsUrl: ""
    }
  ];
}
