"use client";

import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbProps {
    items: {
        label: string;
        href?: string;
    }[];
}

export function CourseBreadcrumb({ items }: BreadcrumbProps) {
    return (
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <BreadcrumbItem>
                                {isLast || !item.href ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
