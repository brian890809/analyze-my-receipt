import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const db = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Generate taste profile from user's ratings
const generateTasteProfile = (ratings) => {
    const restaurants = new Set();
    const favoriteTags = new Map();
    const topRatedDishes = ratings
        .filter(r => r.rating >= 4) // Only consider highly rated dishes
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10); // Keep top 10 dishes

    ratings.forEach(rating => {
        restaurants.add(rating.restaurant);
        if (rating.tags) {
            rating.tags.forEach(tag => {
                favoriteTags.set(tag, (favoriteTags.get(tag) || 0) + rating.rating);
            });
        }
    });

    // Sort tags by total rating score
    const sortedTags = Array.from(favoriteTags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15) // Keep top 15 tags
        .map(([tag]) => tag);

    return {
        tasteTags: sortedTags,
        favoriteRestaurants: Array.from(restaurants),
        topRatedDishes: topRatedDishes.map(d => ({
            dishId: `${d.restaurant.toLowerCase()}_${d.dishName.toLowerCase()}`.replace(/[^a-z0-9]/g, '_'),
            rating: d.rating
        }))
    };
};

// Update user's taste profile
const updateTasteProfile = async (userId) => {
    // First, get all user's ratings
    const ratingsParams = {
        TableName: "dish-ratings",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: marshall({
            ":userId": userId
        })
    };

    try {
        const ratingsCommand = new QueryCommand(ratingsParams);
        const ratingsResult = await db.send(ratingsCommand);
        const ratings = ratingsResult.Items.map(item => unmarshall(item));

        // Generate new taste profile
        const profile = generateTasteProfile(ratings);

        // Save the profile
        const command = new PutItemCommand({
            TableName: "taste-profiles",
            Item: marshall({
                userId,
                ...profile,
                updatedAt: Date.now()
            })
        });

        await db.send(command);
        return profile;
    } catch (error) {
        console.error("Error updating taste profile:", error);
        throw error;
    }
};

// Get user's taste profile
const getTasteProfile = async (userId) => {
    const params = {
        TableName: "taste-profiles",
        Key: marshall({
            userId
        })
    };

    try {
        const command = new GetItemCommand(params);
        const result = await db.send(command);
        return result.Item ? unmarshall(result.Item) : null;
    } catch (error) {
        console.error("Error fetching taste profile:", error);
        throw error;
    }
};

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        if (req.method === "GET") {
            const profile = await getTasteProfile(userId);
            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }
            res.status(200).json(profile);
        } else if (req.method === "POST") {
            const profile = await updateTasteProfile(userId);
            res.status(200).json(profile);
        } else {
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Error handling taste profile request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}