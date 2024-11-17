"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Send } from "lucide-react";

// Define the ApiResponse interface
interface ApiResponse {
  status: string;
  message?: string;
  data: {
    response: string;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I'm FluentAI. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const scrollAreaRef = useRef<HTMLDivElement | null>(null); // Changed ref type to HTMLDivElement

  const recognitionRef = useRef<typeof SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Ensure this runs only in the browser
    if (typeof window !== "undefined" && window.SpeechRecognition) {
      recognitionRef.current = new window.SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        setInput(transcript);

        clearTimeout(silenceTimeoutRef.current!);
        silenceTimeoutRef.current = setTimeout(() => {
          handleSend(); // This is fine without adding `handleSend` to dependencies
        }, 3000);
      };

      recognitionRef.current.onerror = (event: Event) => {
        console.error("Speech recognition error:", event);
      };
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (input.trim()) {
      const userMessage = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const res = await fetch("/api/chatbox", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch from API. Status: ${res.status}. Error: ${errorText}`
          );
        }

        const data: ApiResponse = await res.json();

        if (data.status === "success") {
          const botMessage = { role: "bot", content: data.data.response };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error(data.message || "Unknown error from API");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("An unknown error occurred.");
        }
      }
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]); // Automatically scroll to the bottom when messages change

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-800">
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Replace SimpleBar with div */}
          <div
            ref={scrollAreaRef}
            className="flex-1 p-4 space-y-4 overflow-auto bg-gray-800"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <Card
                  className={`max-w-[70%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-gray-700 text-white"}`}
                >
                  <CardContent className="p-3">
                    <p>{message.content}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={startSpeechRecognition}
                className="p-2 text-gray-500 hover:bg-gray-600 rounded-full"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white"
              />
              <Button
                onClick={handleSend}
                className="bg-primary text-white p-2 rounded-full"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
