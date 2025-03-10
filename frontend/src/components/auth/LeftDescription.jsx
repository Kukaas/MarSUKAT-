import React from "react";
import { Badge } from "@/components/ui/badge";

const LeftDescription = ({ title, description }) => {
  return (
    <div className="relative h-full flex flex-col justify-center bg-gray-50/50">
      <div className="absolute inset-0 bg-grid-gray-900/[0.04] bg-[size:60px_60px]" />
      <div className="relative px-8 lg:px-16">
        <Badge
          className="mb-8 bg-gray-900/5 text-gray-900 hover:bg-gray-900/10 transition-colors"
          variant="secondary"
        >
          MarSUKAT
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight max-w-xl bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-lg">
          {description}
        </p>
      </div>
    </div>
  );
};

export default LeftDescription;
