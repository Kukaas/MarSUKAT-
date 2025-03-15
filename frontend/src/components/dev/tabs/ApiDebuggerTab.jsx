import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Copy, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const ApiDebuggerTab = () => {
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);

  const handleSendRequest = async () => {
    if (!endpoint) {
      toast.error("Please enter an endpoint");
      return;
    }

    setLoading(true);
    try {
      let requestConfig = {
        method,
        url: endpoint,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && requestBody) {
        try {
          requestConfig.data = JSON.parse(requestBody);
        } catch (e) {
          toast.error("Invalid JSON in request body");
          setLoading(false);
          return;
        }
      }

      const startTime = Date.now();
      const result = await api(requestConfig);
      const endTime = Date.now();

      const responseData = {
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers,
        time: endTime - startTime,
      };

      setResponse(responseData);

      // Add to history
      const historyItem = {
        id: Date.now(),
        method,
        endpoint,
        requestBody: requestBody || null,
        response: responseData,
        timestamp: new Date().toISOString(),
      };

      setRequestHistory((prev) => [historyItem, ...prev].slice(0, 10));

      toast.success(`Request successful (${responseData.time}ms)`, {
        description: `Status: ${responseData.status} ${responseData.statusText}`,
      });
    } catch (error) {
      console.error("API request error:", error);

      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Error",
        data: error.response?.data || { message: error.message },
        headers: error.response?.headers || {},
        error: true,
      };

      setResponse(errorResponse);

      toast.error("Request failed", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const clearHistory = () => {
    setRequestHistory([]);
    toast.success("Request history cleared");
  };

  const formatJson = (json) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };

  const loadFromHistory = (item) => {
    setEndpoint(item.endpoint);
    setMethod(item.method);
    setRequestBody(item.requestBody ? formatJson(item.requestBody) : "");
    setResponse(item.response);
  };

  return (
    <div className="space-y-4 pb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">API Request</CardTitle>
          <CardDescription>Test API endpoints directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="API endpoint (e.g., /auth/me)"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1"
            />
          </div>

          {["POST", "PUT", "PATCH"].includes(method) && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Request Body (JSON)</p>
              <Textarea
                placeholder='{"key": "value"}'
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="font-mono text-xs h-[100px]"
              />
            </div>
          )}

          <Button
            onClick={handleSendRequest}
            disabled={loading || !endpoint}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm">Response</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant={response.error ? "destructive" : "outline"}>
                    {response.status} {response.statusText}
                  </Badge>
                  {response.time && (
                    <span className="text-xs text-muted-foreground">
                      {response.time}ms
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(formatJson(response.data))}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-md border">
              <ScrollArea className="h-[200px] w-full">
                <pre className="font-mono text-xs p-4 whitespace-pre-wrap break-all">
                  {formatJson(response.data)}
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {requestHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Request History</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-8 w-8 p-0"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Recent API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {requestHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer group"
                    onClick={() => loadFromHistory(item)}
                  >
                    <Badge
                      variant={item.response.error ? "destructive" : "outline"}
                      className="w-16 text-center shrink-0"
                    >
                      {item.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {item.endpoint}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {item.response.status} {item.response.statusText}
                        </p>
                        {item.response.time && (
                          <span className="text-xs text-muted-foreground">
                            {item.response.time}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiDebuggerTab;
