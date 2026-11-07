"use client";

import * as React from "react";
import { AddProduct } from "@/components/admin/AddProduct";

export default function AddProductPage() {
  return (
    <div className="pb-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-lg font-medium capitalize">
            Add new product
          </h3>
        </div>
      </div>

      <AddProduct />
    </div>
  );
}