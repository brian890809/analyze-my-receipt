import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const db = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Create a unique dishId from dishName and restaurant
const createDishId = (dishName, restaurant) => {
    return `${restaurant.toLowerCase()}_${dishName.toLowerCase()}`.replace(/[^a-z0-9]/g, '_');
};

// Handle POST request to save a dish rating
const saveDishRating = async (userId, rating) => {
    const dishId = createDishId(rating.dishName, rating.restaurant);
    const item = {
        userId: { S: userId },
        dishId: { S: dishId },
        dishName: { S: rating.dishName },
        restaurant: { S: rating.restaurant },
        rating: { N: rating.rating.toString() },
        dateEaten: { S: rating.dateEaten },
        tags: rating.tags ? { SS: rating.tags } : { NULL: true },
        modifications: rating.modifications ? { SS: rating.modifications } : { NULL: true },
        createdAt: { N: Date.now().toString() }
    };

    const command = new PutItemCommand({
        TableName: "dish-ratings",
        Item: item
    });

    try {
        await db.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error saving dish rating:", error);
        throw error;
    }
};

// Handle GET request to fetch user's dish ratings
const getUserRatings = async (userId) => {
    const params = {
        TableName: "dish-ratings",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: marshall({
            ":userId": userId
        })
    };

    const command = new QueryCommand(params);
    try {
        const result = await db.send(command);
        return result.Items.map(item => unmarshall(item));
    } catch (error) {
        console.error("Error fetching user ratings:", error);
        throw error;
    }
};

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { userId, rating } = req.body;
            await saveDishRating(userId, rating);
            res.status(200).json({ message: "Rating saved successfully" });
        } catch (error) {
            res.status(500).json({ error: "Failed to save rating" });
        }
    } else if (req.method === "GET") {
        try {
            const { userId } = req.query;
            const ratings = await getUserRatings(userId);
            res.status(200).json(ratings);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch ratings" });
        }
    } else {
        res.setHeader("Allow", ["POST", "GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}