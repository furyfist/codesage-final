"use client";

import { useEffect, useState } from "react";
import CallComponent from "@/components/call"; // Our new component!
import Image from "next/image";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { Interview } from "@/types/interview";

// Re-using the original file's structure for stability.

function PopupLoader() {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-[90%] md:w-[80%] h-[88vh] flex justify-center items-center rounded-lg border-2 border-b-4 border-r-4 border-black dark:border-white">
        <LoaderWithText />
      </div>
    </div>
  );
}

function PopUpMessage({ title, description, image }: { title: string; description: string; image: string; }) {
  return (
    <div className="flex justify-center items-center h-screen w-full">
        <div className="w-[90%] md:w-[80%] h-[88vh] flex flex-col justify-center items-center rounded-lg border-2 border-b-4 border-r-4 border-black dark:border-white p-4">
            <Image
              src={image}
              alt="Status Graphic"
              width={200}
              height={200}
              className="mb-4"
            />
            <h1 className="text-xl font-medium mb-2 text-center">{title}</h1>
            <p className="text-center">{description}</p>
        </div>
    </div>
  );
}


export default function InterviewPage({ params }: { params: { interviewId: string } }) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const response = await fetch(`/api/get-call?interviewId=${params.interviewId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Interview not found");
        }
        const data: Interview = await response.json();
        setInterview(data);
        document.title = data.name;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewData();
  }, [params.interviewId]);

  if (isLoading) {
    return <PopupLoader />;
  }

  if (error) {
    return (
      <PopUpMessage
        title="Invalid Interview"
        description={error}
        image="/invalid-url.png"
      />
    );
  }
  
  if (!interview?.is_active) {
    return (
      <PopUpMessage
        title="Interview Is Unavailable"
        description="This interview is no longer active. Please contact the sender for more information."
        image="/closed.png"
      />
    );
  }

  // If everything is good, we render our new, upgraded component!
  return (
    <main className="h-screen w-full">
      {interview && <CallComponent interview={interview} />}
    </main>
  );
}