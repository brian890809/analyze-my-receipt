'use client';

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
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const initialDishes = [
    'Tteokbokki',
    'Bibimbap',
    'Japchae',
    'Kimchi Jjigae',
    'Samgyeopsal',
];

function SortableItem({ id }) {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-4 mb-3 bg-white rounded-xl border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing"
        >
            {id}
        </div>
    );
}

export default function SortableDishes({ isOpen, onClose }) {
    const [items, setItems] = useState(initialDishes);
    const [submitting, setSubmitting] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleSubmit = async () => {
        setSubmitting(true);

        console.log(items)
        // Simulated API call
        // await fetch('/api/save-rankings', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         userId: 'example-user-id',
        //         rankedDishes: items.map((dish, index) => ({
        //             dish,
        //             rank: index + 1,
        //         })),
        //     }),
        // });

        setSubmitting(false);
        alert('Ranking submitted!');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent> 
                <DialogHeader>
                    <DialogTitle>Rank the Dishes 🍜</DialogTitle>
                </DialogHeader>
                    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-2xl shadow-md">
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
                            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                {items.map((dish) => (
                                    <SortableItem key={dish} id={dish} />
                                ))}
                            </SortableContext>
                        </DndContext>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="mt-6 w-full py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Ranking'}
                        </button>
                    </div>
            </DialogContent>
        </Dialog>
    );
}
