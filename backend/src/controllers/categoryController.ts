import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional()
});

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { courses: true, students: true }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const data = categorySchema.parse(req.body);
        const category = await prisma.category.create({ data });
        res.status(201).json(category);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const issues = (error as any).errors || (error as any).issues;
            return res.status(400).json({ message: issues[0]?.message || "Validation Error" });
        }
        res.status(400).json({ message: "Error creating category. Name might be duplicate." });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id: String(id) } });
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category" });
    }
};
