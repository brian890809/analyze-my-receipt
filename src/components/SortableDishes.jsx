'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star, X } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";

function StarRating({ rating, rateCurrent }) {
    const handleClick = (e, starValue) => {
        e.preventDefault();
        e.stopPropagation();
        rateCurrent(starValue);
    };

    return (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={(e) => handleClick(e, star)}
                    type="button"
                    className={`focus:outline-none ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                >
                    <Star className="w-6 h-6" />
                </button>
            ))}
        </div>
    );
}

function SortableItem({ id, rating, handleRate, tags, onTagAdd, onTagRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const [tagInput, setTagInput] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState([]);

    useEffect(() => {
        // Fetch tag suggestions
        fetch('/api/dish-tags')
            .then(res => res.json())
            .then(data => {
                // Sort by usage count
                setTagSuggestions(data.map(t => t.tag));
            })
            .catch(console.error);
    }, []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleTagAdd = (e) => {
        e.preventDefault();
        if (tagInput.trim()) {
            onTagAdd(id, tagInput.trim());
            setTagInput('');
        }
    };

    const dragHandleListeners = {
        ...listeners,
        onMouseDown: (e) => {
            if (e.target.tagName === 'SPAN' && listeners?.onMouseDown) {
                listeners.onMouseDown(e);
            }
        },
        onTouchStart: (e) => {
            if (e.target.tagName === 'SPAN' && listeners?.onTouchStart) {
                listeners.onTouchStart(e);
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="p-4 mb-3 bg-white rounded-xl border border-gray-200 shadow-sm"
        >
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span {...dragHandleListeners} className="cursor-grab active:cursor-grabbing">{id}</span>
                    <StarRating rating={rating} rateCurrent={(star) => handleRate(id, star)} />
                </div>
                <div className="flex flex-wrap gap-1">
                    {tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 rounded-full text-sm flex items-center">
                            {tag}
                            <button 
                                onClick={() => onTagRemove(id, tag)}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                aria-label="Remove tag"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <form onSubmit={handleTagAdd} className="flex gap-2">
                    <Input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a taste tag..."
                        list={`suggestions-${id}`}
                        className="flex-1"
                    />
                    <datalist id={`suggestions-${id}`}>
                        {tagSuggestions.map((tag) => (
                            <option key={tag} value={tag} />
                        ))}
                    </datalist>
                    <Button type="submit" size="sm">Add</Button>
                </form>
            </div>
        </div>
    );
}

export default function SortableDishes({ isOpen, onClose, entry }) {
    const { user } = useAuth();
    const [items, setItems] = useState(entry?.items?.map(item => item.description) || []);
    const [ratings, setRatings] = useState({});
    const [dishTags, setDishTags] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const initialFocusRef = useRef(null);

    const sensors = useSensors(useSensor(PointerSensor));

    // Create a function to generate dishId for lookup
    const createDishId = (dishName, restaurant) => {
        return `${restaurant.toLowerCase()}_${dishName.toLowerCase()}`.replace(/[^a-z0-9]/g, '_');
    };

    // Fetch existing ratings and tags when component mounts
    useEffect(() => {
        if (!isOpen || !user?.uid || !entry?.merchant) return;

        const fetchExistingRatings = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/dish-ratings?userId=${user.uid}`);
                if (response.ok) {
                    const userRatings = await response.json();
                    // Initialize temporary storage for ratings and tags
                    const newRatings = {};
                    const newDishTags = {};
                    
                    // For each dish in the current entry, find if we have a rating for it
                    items.forEach(dishName => {
                        const dishId = createDishId(dishName, entry.merchant);
                        
                        // Find the rating for this dish
                        const existingRating = userRatings.find(rating => 
                            rating.dishId === dishId && 
                            rating.dishName.toLowerCase() === dishName.toLowerCase()
                        );
                        if (existingRating) {
                            // Store the numeric rating
                            newRatings[dishName] = parseInt(existingRating.rating);
                            
                            // Store tags if they exist (they'll be in an array or null)
                            if (existingRating.tags && Array.isArray(existingRating.tags)) {
                                newDishTags[dishName] = existingRating.tags;
                            }
                        }
                    });
                    
                    // Update state with the fetched data
                    setRatings(newRatings);
                    setDishTags(newDishTags);
                }
            } catch (error) {
                console.error('Error fetching existing ratings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExistingRatings();
    }, [isOpen, user, entry, items]);

    const handleRate = (dishName, rating) => {
        setRatings(prev => ({
            ...prev,
            [dishName]: rating
        }));
    };

    const handleTagAdd = (dishName, tag) => {
        setDishTags(prev => {
            // Check if tag already exists to prevent duplicates
            if (prev[dishName]?.includes(tag)) {
                return prev;
            }
            return {
                ...prev,
                [dishName]: [...(prev[dishName] || []), tag]
            };
        });
    };
    
    const handleTagRemove = (dishName, tagToRemove) => {
        setDishTags(prev => ({
            ...prev,
            [dishName]: prev[dishName]?.filter(tag => tag !== tagToRemove) || []
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        if (Object.keys(ratings).length === 0) {
            alert('Please rate at least one dish.');
            setSubmitting(false);
            return;
        }
        try {
            // Collect all tags to submit in batch
            const allTags = [];
            Object.entries(dishTags).forEach(([dishName, tags]) => {
                tags.forEach(tag => {
                    allTags.push({ tag, userId: user.uid });
                });
            });
            
            // Submit tags in batch if there are any
            if (allTags.length > 0) {
                await fetch('/api/dish-tags/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tags: allTags })
                });
            }

            // Submit each rated dish
            const ratingPromises = Object.entries(ratings).map(([dishName, rating]) => {
                return fetch('/api/dish-ratings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.uid,
                        rating: {
                            dishName,
                            restaurant: entry.merchant,
                            rating,
                            dateEaten: entry.date,
                            modifications: [],
                            tags: dishTags[dishName] || []
                        }
                    })
                });
            });

            await Promise.all(ratingPromises);

            // Update taste profile after saving ratings
            await fetch(`/api/taste-profile?userId=${user.uid}`, {
                method: 'POST'
            });

            onClose();
        } catch (error) {
            console.error('Error submitting ratings:', error);
            alert('Failed to submit ratings. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle dialog closure with delay to avoid conflict
    const handleDialogClose = () => {
        // Delay closure to prevent focus management conflicts
        setTimeout(() => {
            onClose();
        }, 0);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent 
                className="sm:max-w-md"
                onInteractOutside={(e) => {
                    // Prevent interaction outside dialog when dropdown was the source
                    if (e.target.closest('[role="menu"]')) {
                        e.preventDefault();
                    }
                }}
                onEscapeKeyDown={(e) => {
                    // Prevent immediate closure on Escape to manage focus properly
                    e.preventDefault();
                    handleDialogClose();
                }}
            > 
                <DialogHeader>
                    <DialogTitle>Rate the Dishes 🍜</DialogTitle>
                </DialogHeader>
                <div className="max-w-md mx-auto mt-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <p className="text-gray-500">Loading your previous ratings...</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={({ active, over }) => {
                                if (active.id !== over?.id) {
                                    const oldIndex = items.indexOf(active.id);
                                    const newIndex = items.indexOf(over?.id);
                                    setItems(arrayMove(items, oldIndex, newIndex));
                                }
                            }}
                        >
                            <div className="mb-4" ref={initialFocusRef} tabIndex={-1}>
                                <p className="text-sm text-gray-500">Your favorite dish</p>
                            </div>
                            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                {items.map((dish) => (
                                    <SortableItem 
                                        key={dish} 
                                        id={dish} 
                                        rating={ratings[dish] || 0}
                                        handleRate={handleRate}
                                        tags={dishTags[dish] || []}
                                        onTagAdd={handleTagAdd}
                                        onTagRemove={handleTagRemove}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={submitting || loading}
                    >
                        {submitting ? 'Saving...' : 'Save Ratings'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
