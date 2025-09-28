"use client";
import React, { useState, useRef, useEffect } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MonacoEditor from "@monaco-editor/react";
import { FeedbackForm } from "./feedbackForm";
import { Loader2 } from "lucide-react";
import { Interview } from "@/types/interview";

interface IPROPS {
  interview: Interview;
}

function Call({ interview }: IPROPS) {
  // State for Retell Web Client
  const [isCalling, setIsCalling] = useState(false);
  const [callId, setCallId] = useState("");
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  // --- FIX ---
  // Initialize the RetellWebClient only once using useState.
  // This prevents creating a new SDK instance on every re-render,
  // which is crucial for preventing memory leaks and ensuring event listeners work correctly.
  const [sdk] = useState(() => new RetellWebClient());

  // State for Code Editor
  const [code, setCode] = useState(
    "// Complete the function to reverse a string.\nfunction reverseString(str) {\n  // your code here\n}"
  );
  const [consoleOutput, setConsoleOutput] = useState("");
  const [hint, setHint] = useState("");
  const editorRef = useRef(null);

  // Loading and Error States
  const [isRegisteringCall, setIsRegisteringCall] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // Retell SDK Event Listeners
    sdk.on("call_started", (callId: string) => {
      console.log("Call started with ID:", callId);
      setCallId(callId);
      setIsCalling(true);
      setIsRegisteringCall(false);
    });

    sdk.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsCallEnded(true);
      setIsFeedbackFormOpen(true);
    });

    sdk.on("error", (error) => {
      console.error("An error occurred:", error);
      setError("An error occurred during the call. Please try again.");
      setIsCalling(false);
      setIsRegisteringCall(false);
    });

    // Cleanup on component unmount
    return () => {
        // If the Retell SDK has a cleanup method, like `sdk.disconnect()` or similar,
        // it should be called here to remove listeners and prevent memory leaks.
        // For example: sdk.cleanup();
    };
  }, [sdk]); // Add `sdk` as a dependency

  const toggleConversation = async () => {

    if (isCalling) {
      sdk.stopCall();
    } else {
      setIsRegisteringCall(true);
      setError(null);
      try {
        console.log("Starting call registration with data:", {
          interviewer_id: interview.interviewer_id,
          objective: interview.objective,
          questions: interview.questions
        });

        const response = await fetch("/api/register-call", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            interviewer_id: Number(interview.interviewer_id),
            dynamic_data: {
              name: "Candidate",
              objective: interview.objective || "General interview",
              questions: interview.questions?.map(q => q.question).join(", ") || "General questions",
              mins: interview.time_duration || "15"
            }
          }),
        });

        console.log("Register call response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`Failed to register call: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Register call response data:", data);

        // Robust check for the necessary data before starting the call
        if(data && data.registerCallResponse && data.registerCallResponse.call_id){
            console.log("Starting call with ID:", data.registerCallResponse.call_id);
            sdk.startCall(data.registerCallResponse.call_id);
        } else {
            console.error("Invalid response structure:", data);
            throw new Error("Invalid response from register-call API - missing call_id");
        }
      } catch (err: any) {
        console.error("Error during call registration:", err);
        setError(`Failed to start the call: ${err.message}`);
        setIsRegisteringCall(false);
      }
    }
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setConsoleOutput("");
    setError(null);
    try {
      const response = await fetch("/api/coding/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setConsoleOutput(data.output || "No output");
    } catch (err: any) {
      console.error("Error executing code:", err);
      setConsoleOutput(`Error: ${err.message}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleGetHint = async () => {
    setIsGettingHint(true);
    setHint("");
    setError(null);
    try {
      const response = await fetch("/api/coding/get-hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        throw new Error(`Failed to get hint: ${response.statusText}`);
      }
      const data = await response.json();
      setHint(data.hint || "No hint available.");
    } catch (err: any) {
      console.error("Error getting hint:", err);
      setError("Failed to get a hint. Please try again.");
    } finally {
      setIsGettingHint(false);
    }
  };

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Voice Agent Panel */}
      <div className="w-full md:w-1/2 p-4">
        <Card className="w-full h-full shadow-lg">
          <CardHeader>
            <CardTitle>Voice Agent</CardTitle>
            <CardDescription>
              Press &quot;Start Conversation&quot; to speak with the AI interviewer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className={`w-full text-white font-bold py-2 px-4 rounded ${
                isCalling ? "bg-red-500 hover:bg-red-700" : "bg-blue-500 hover:bg-blue-700"
              }`}
              disabled={isRegisteringCall}
              onClick={toggleConversation}
            >
              {isRegisteringCall ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : isCalling ? (
                "Stop Conversation"
              ) : (
                "Start Conversation"
              )}
            </Button>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            {isCallEnded && <p className="text-gray-600">The call has ended.</p>}
            {isFeedbackFormOpen && (
              <FeedbackForm
                email="user@example.com"
                onSubmit={(data) => {
                  console.log("Feedback submitted:", data);
                  setIsFeedbackFormOpen(false);
                }}
              />
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Coding Environment Panel */}
      <div className="w-full md:w-1/2 p-4">
        <Card className="w-full h-full shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle>Coding Environment</CardTitle>
            <CardDescription>
              Please solve the coding problem below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="border rounded-md flex-grow">
                <MonacoEditor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                theme="vs-dark"
                onChange={(value) => setCode(value || "")}
                onMount={handleEditorDidMount}
                />
            </div>
            <div className="flex justify-end mt-4">
              <Button className="mr-2" disabled={isRunningCode} onClick={handleRunCode}>
                {isRunningCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Code"
                )}
              </Button>
              <Button disabled={isGettingHint} onClick={handleGetHint}>
                 {isGettingHint ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Hint...
                  </>
                ) : (
                  "Get Hint"
                )}
              </Button>
            </div>
            <div className="mt-4">
                <label className="font-semibold">Console:</label>
                <Textarea
                className="mt-2 bg-gray-800 text-white font-mono"
                placeholder="Console output will appear here..."
                value={consoleOutput}
                rows={5}
                readOnly
                />
            </div>
            {hint && <p className="mt-4 text-sm text-blue-600 p-2 bg-blue-50 rounded-md"><b>Hint:</b> {hint}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Call;
