import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessages, useSendMessage, useMe } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { Loader2, Send } from "lucide-react";

export default function Conversation() {
  const params = useParams();
  const conversationId = Number(params.id);
  const { data: me } = useMe();
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMutation = useSendMessage();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const msgs = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMutation.mutateAsync({ conversationId, content: newMessage.trim() });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
        <h1 className="text-lg font-semibold mb-4">Conversation</h1>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4 border rounded-lg bg-muted/20">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : msgs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
          ) : (
            msgs.map((msg: any) => {
              const isMe = msg.senderUserId === (me as any)?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      isMe ? "bg-primary text-primary-foreground" : "bg-background border"
                    }`}
                  >
                    {!isMe && <p className="text-xs font-medium mb-1">{msg.senderName}</p>}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 mt-3">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || sendMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
