import { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Search, 
  FileText, 
  Archive, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  MessageSquare,
  Send,
  User,
  Bot,
  Sparkles,
  Languages
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
interface PDFLink {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function App() {
  const [links, setLinks] = useState<PDFLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Namaste! I am Artha-Sahayak. I can help you understand RBI circulars and statistical handbooks. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrapeLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scrape");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setLinks(data.links);
    } catch (err: any) {
      setError(err.message || "Failed to fetch links");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      // Construct context from links
      const context = links.length > 0 
        ? `I have found ${links.length} RBI documents. Some titles include: ${links.slice(0, 5).map(l => l.title).join(", ")}.`
        : "I haven't scanned the RBI website yet, but I can answer general questions about RBI policies.";

      const systemInstruction = `You are Artha-Sahayak, an AI assistant for the Reserve Bank of India (RBI) documents. 
          Your goal is to help users understand complex financial circulars and statistical handbooks.
          Context: ${context}
          Style: Professional, helpful, and concise. Use Indian financial terminology where appropriate.
          If the user asks in Hindi or other Indian languages, respond in that language if possible, or provide a translation.
          Mention that you are powered by Databricks Lakehouse architecture for the Bharat Bricks Hackathon.`;

      // Map local messages to OpenAI format (bot -> assistant)
      const backendMessages = [
        { role: "system", content: systemInstruction },
        ...messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content })),
        { role: "user", content: userMessage }
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: backendMessages })
      });

      if (!res.ok) throw new Error("Failed to fetch response");
      const data = await res.json();
      const botReply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";

      setMessages(prev => [...prev, { role: "bot", content: botReply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "bot", content: "Error: " + (err.message || "Something went wrong.") }]);
    } finally {
      setIsTyping(false);
    }
  };

  const downloadZip = async () => {
    if (links.length === 0) return;
    setDownloading(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 95));
    }, 500);

    try {
      const response = await fetch("/api/download-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      });

      if (!response.ok) throw new Error("Failed to generate ZIP");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rbi_handbook_statistics.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setProgress(100);
    } catch (err: any) {
      setError(err.message || "Download failed");
    } finally {
      clearInterval(progressInterval);
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-[#1a1a1a] selection:bg-orange-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-200">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">RBI Artha-Sahayak</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-600">Bharat Bricks Hacks 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-mono text-[10px] px-2 py-0.5">
              DATABRICKS LAKEHOUSE
            </Badge>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Stats (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
              <div className="h-2 bg-orange-600 w-full" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-4 h-4 text-orange-600" />
                  Data Ingestion
                </CardTitle>
                <CardDescription>
                  Extracting real-time circulars from RBI.org.in into Delta Lake.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={scrapeLinks} 
                  disabled={loading || downloading}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingesting Data...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Sync with RBI
                    </>
                  )}
                </Button>

                {links.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 border-t border-slate-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delta Lake Storage</span>
                        <span className="text-sm font-semibold text-slate-700">{links.length} Documents</span>
                      </div>
                      <Badge className="bg-green-50 text-green-600 border-green-100 hover:bg-green-50">
                        Synced
                      </Badge>
                    </div>
                    <Button 
                      onClick={downloadZip} 
                      disabled={downloading}
                      variant="outline"
                      className="w-full h-12 border-slate-200 hover:bg-slate-50 rounded-xl"
                    >
                      {downloading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Archiving...
                        </>
                      ) : (
                        <>
                          <Archive className="mr-2 h-4 w-4" />
                          Export Archive
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
              {downloading && (
                <CardFooter className="flex-col items-start gap-2 pt-0">
                  <div className="w-full flex justify-between text-[10px] font-mono uppercase text-slate-400">
                    <span>Processing ZIP</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1 bg-slate-100" />
                </CardFooter>
              )}
            </Card>

            <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 space-y-4">
              <div className="flex items-center gap-2 text-orange-600">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">AI Capability</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Artha-Sahayak uses a RAG (Retrieval-Augmented Generation) pipeline to provide accurate answers based on official RBI data.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white rounded-2xl border border-orange-100 shadow-sm">
                  <Languages className="w-4 h-4 text-orange-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Multilingual</p>
                  <p className="text-xs font-semibold text-slate-700">Hindi, Tamil, etc.</p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-orange-100 shadow-sm">
                  <Bot className="w-4 h-4 text-orange-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Model</p>
                  <p className="text-xs font-semibold text-slate-700">Airavata-7B</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chat & Registry (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chat Interface */}
            <Card className="h-[500px] flex flex-col border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Artha-Sahayak AI</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online • RAG Active
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fafafa]">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-slate-900" : "bg-orange-600"}`}>
                        {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === "user" 
                          ? "bg-slate-900 text-white rounded-tr-none" 
                          : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </CardContent>
              <CardFooter className="p-4 border-t border-slate-50">
                <div className="flex w-full gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask about RBI circulars or handbooks..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isTyping || !input.trim()}
                    size="icon"
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-10 w-10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Document Registry */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Delta Lake Registry</CardTitle>
                    <CardDescription>Versioned documents in the Lakehouse</CardDescription>
                  </div>
                  {links.length > 0 && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {links.length} OBJECTS
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : links.length > 0 ? (
                  <div className="overflow-auto max-h-[300px]">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</TableHead>
                          <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {links.map((link, index) => (
                          <TableRow key={link.url} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                            <TableCell>
                              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                <FileText className="w-4 h-4" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-xs text-slate-700 truncate max-w-[300px]">
                              {link.title}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon-sm" render={<a href={link.url} target="_blank" rel="noopener noreferrer" />} className="text-slate-400 hover:text-orange-600">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                      <Database className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Data Ingested</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-1.5 rounded-lg">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">RBI Artha-Sahayak</span>
            </div>
            <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <span>Powered by Databricks</span>
              <span>IIT Delhi Hackathon 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
