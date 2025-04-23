import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UtensilsCrossed } from 'lucide-react';

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

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/40 p-6 transition-all hover:shadow-md h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/90 to-accent-foreground/70 flex items-center justify-center shadow-sm">
                    <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-heading font-semibold text-foreground/90">Your Taste Profile</h2>
            </div>
            {!profile ? (
                <p className="text-foreground/60">Rate some dishes to build your taste profile!</p>
            ) : (
                <div className="space-y-5">
                    {profile.tasteTags?.length > 0 && (
                        <div>
                            <h3 className="font-medium text-sm text-foreground/70 mb-2">Favorite Tastes</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.tasteTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-primary/10 rounded-full text-sm text-primary/90"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.favoriteRestaurants?.length > 0 && (
                        <div>
                            <h3 className="font-medium text-sm text-foreground/70 mb-2">Favorite Restaurants</h3>
                            <div className="space-y-3">
                                {profile.favoriteRestaurants.slice(0, 5).map((restaurant) => (
                                    <div key={restaurant} className="flex justify-between items-center border-b border-border/30 pb-2">
                                        <span className="font-medium text-foreground/80">{restaurant}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.topRatedDishes?.length > 0 && (
                        <div>
                            <h3 className="font-medium text-sm text-foreground/70 mb-2">Top Rated Dishes</h3>
                            <div className="space-y-3">
                                {profile.topRatedDishes.slice(0, 5).map((dish) => (
                                    <div key={dish.dishId} className="flex justify-between items-center border-b border-border/30 pb-2">
                                        <span className="font-medium text-foreground/80">
                                            {dish.dishId.split('_').slice(1).join(' ')}
                                        </span>
                                        <span className="text-right font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                            {dish.rating}★
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}