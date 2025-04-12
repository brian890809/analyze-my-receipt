'use client';

import { useState } from 'react';
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

function SortableItem({ id, rating, handleRate }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const dragHandleListeners = {
        ...listeners,
        onMouseDown: (e) => {
            // Only apply drag listeners to the text content
            if (e.target.tagName === 'SPAN') {
                listeners.onMouseDown(e);
            }
        },
        onTouchStart: (e) => {
            // Only apply drag listeners to the text content
            if (e.target.tagName === 'SPAN') {
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
            <div className="flex justify-between items-center">
                <span {...dragHandleListeners} className="cursor-grab active:cursor-grabbing">{id}</span>
                <StarRating rating={rating} rateCurrent={(star) => handleRate(id, star)} />
            </div>
        </div>
    );
}

export default function SortableDishes({ isOpen, onClose, entry }) {
    const { user } = useAuth();
    const [items, setItems] = useState(entry?.items?.map(item => item.description) || []);
    const [ratings, setRatings] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleRate = (dishName, rating) => {
        setRatings(prev => ({
            ...prev,
            [dishName]: rating
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
                            modifications: []
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
