"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Loader2, AlertTriangle } from "lucide-react";

// Props interface for the page
interface InterviewPageProps {
  params: {
    interviewId: string;
  };
}

// The main component for the interview details and report generation page
function InterviewPage({ params }: InterviewPageProps) {
  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // This function now triggers the report generation and opens the dialog simultaneously.
  const handleGenerateReport = async () => {
    // Prevent multiple requests while one is in progress
    if (isLoading) {
      return;
    }

    setIsDialogOpen(true); // Open the modal immediately to show progress
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/coding/generate-full-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: params.interviewId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate report. Status: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);

    } catch (err: any) {
      console.error("Error generating report:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // This effect ensures that when the dialog is closed, all states are reset.
  // This prevents seeing old data (like a previous error) when you try again.
  useEffect(() => {
    if (!isDialogOpen) {
      setReport(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isDialogOpen]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle>Interview Session Details</CardTitle>
          <CardDescription>
            Review the details for this interview session and generate the full AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-gray-700">
            <span className="font-semibold text-gray-900">Interview ID:</span> {params.interviewId}
          </p>

          {/* This is the only button the user needs to click. */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleGenerateReport}>
            Generate Full AI Report
          </Button>

          <Modal open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <div className="sm:max-w-[600px]">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">AI-Generated Report</h2>
                <p className="text-sm text-gray-600 mt-1">
                  This is a comprehensive analysis of the candidate&apos;s performance.
                </p>
              </div>
              
              <div className="mt-4 max-h-[60vh] overflow-y-auto p-1">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="mt-4 text-gray-600">Generating your report, please wait...</p>
                  </div>
                )}
                {error && (
                  <div className="text-red-700 bg-red-50 p-4 rounded-md flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Failed to Generate Report</p>
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                {report && (
                  <pre className="bg-gray-900 text-white p-4 rounded-md text-sm whitespace-pre-wrap">
                    {JSON.stringify(report, null, 2)}
                  </pre>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        </CardContent>
      </Card>
    </div>
  );
}

export default InterviewPage;