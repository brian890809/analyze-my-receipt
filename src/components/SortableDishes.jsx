'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star } from 'lucide-react';
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

function SortableItem({ id, rating, handleRate, tags, onTagAdd }) {
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
                        <span key={index} className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                            {tag}
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

    const sensors = useSensors(useSensor(PointerSensor));

    const handleRate = (dishName, rating) => {
        setRatings(prev => ({
            ...prev,
            [dishName]: rating
        }));
    };

    const handleTagAdd = (dishName, tag) => {
        setDishTags(prev => ({
            ...prev,
            [dishName]: [...(prev[dishName] || []), tag]
        }));
        
        setRatings(prev => ({
            ...prev,
            [dishName]: {
                ...prev[dishName],
                tags: [...(dishTags[dishName] || []), tag]
            }
        }));

        // Save the tag to suggestions
        fetch('/api/dish-tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag, userId: user.uid })
        }).catch(console.error);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        if (Object.keys(ratings).length === 0) {
            alert('Please rate at least one dish.');
            setSubmitting(false);
            return;
        }
        try {
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md"> 
                <DialogHeader>
                    <DialogTitle>Rate the Dishes 🍜</DialogTitle>
                </DialogHeader>
                <div className="max-w-md mx-auto mt-4">
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
                        <div className="mb-4">
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
                                />
                            ))}
                        </SortableContext>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">Not so much</p>
                        </div>
                    </DndContext>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full"
                    >
                        {submitting ? 'Submitting...' : 'Submit Ratings'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
