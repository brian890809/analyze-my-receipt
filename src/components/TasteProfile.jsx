import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';

export default function TasteProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) return;
            
            try {
                const response = await fetch(`/api/taste-profile?userId=${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error('Error fetching taste profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return <div>Loading taste profile...</div>;
    }

    if (!profile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Taste Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Rate some dishes to build your taste profile!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Taste Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {profile.tasteTags?.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2">Favorite Tastes</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.tasteTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {profile.favoriteRestaurants?.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2">Favorite Restaurants</h3>
                        <ul className="list-disc list-inside">
                            {profile.favoriteRestaurants.slice(0, 5).map((restaurant) => (
                                <li key={restaurant}>{restaurant}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {profile.topRatedDishes?.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2">Top Rated Dishes</h3>
                        <ul className="list-disc list-inside">
                            {profile.topRatedDishes.slice(0, 5).map((dish) => (
                                <li key={dish.dishId}>
                                    {dish.dishId.split('_').slice(1).join(' ')} ({dish.rating}★)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}