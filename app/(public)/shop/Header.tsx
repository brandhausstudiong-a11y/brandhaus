"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
// import { ShowMore } from '@/components/ShowMore'

interface HeaderProps {
  category? : string;
}

export default function Header({category}: HeaderProps) {

    let categoryName = ""

    if (category) {
        categoryName = category.replace(/-/g, " ");
    }

    return (
        <div className=" max-w-7xl">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<a href="/" />}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<a href="/shop" />}>
                            Shop
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className='capitalize'>{category ? categoryName : "All Products"}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h3 className='mt-6 text-4xl md:text-5xl font-bold capitalize'>{category ? categoryName : "All Products"}</h3>  
        </div>
    )
}