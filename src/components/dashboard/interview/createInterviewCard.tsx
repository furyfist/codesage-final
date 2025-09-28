"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface CreateInterviewCardProps {
  setOpen: (open: boolean) => void;
}

function CreateInterviewCard({ setOpen }: CreateInterviewCardProps) {
  return (
    <Card
      className=" flex items-center border-dashed border-gray-700 border-2 cursor-pointer hover:scale-105 ease-in-out duration-300 h-60 w-56 ml-1 mr-3 mt-4 rounded-xl shrink-0 overflow-hidden shadow-md"
      onClick={() => {
        setOpen(true);
      }}
    >
      <CardContent className="flex items-center flex-col mx-auto">
        <div className="flex flex-col justify-center items-center w-full overflow-hidden">
          <Plus size={90} strokeWidth={0.5} className="text-gray-700" />
        </div>
        <CardTitle className="p-0 text-md text-center">
          Create an Interview
        </CardTitle>
      </CardContent>
    </Card>
  );
}

export default CreateInterviewCard;