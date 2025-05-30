import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Trash2 } from "lucide-react";

const Messages = () => {
  const messages = [
    { id: 1, from: 'John Doe', subject: 'System Update', date: '2024-03-15', status: 'Unread' },
    { id: 2, from: 'Jane Smith', subject: 'Support Request', date: '2024-03-14', status: 'Read' },
    { id: 3, from: 'Bob Johnson', subject: 'Feedback', date: '2024-03-13', status: 'Read' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Messages</h2>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inbox</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-8" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-2 w-2 rounded-full ${
                    message.status === 'Unread' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="font-medium">{message.subject}</p>
                    <p className="text-sm text-gray-500">From: {message.from}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{message.date}</span>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages; 