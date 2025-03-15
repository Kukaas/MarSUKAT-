import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Send, Copy, Trash, ChevronRight, Search } from "lucide-react";
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
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { ROUTES, DEFAULT_BODIES } from "../config/apiConfig";
import { Label } from "@/components/ui/label";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const ApiDebuggerTab = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [idParam, setIdParam] = useState("");

  // Flatten routes for searching
  const flattenedRoutes = Object.entries(ROUTES).reduce(
    (acc, [category, { routes }]) => {
      routes.forEach((route, index) => {
        acc.push({
          category,
          index,
          ...route,
          searchKey: `${category} ${route.path} ${route.method} ${
            route.role || ""
          }`.toLowerCase(),
        });
      });
      return acc;
    },
    []
  );

  // Update endpoint and method when selection changes
  useEffect(() => {
    if (selectedEndpoint) {
      const [category, index] = selectedEndpoint.split("-");
      const route = ROUTES[category].routes[parseInt(index)];
      setEndpoint(route.path);
      setMethod(route.method);
      setIdParam("");

      // Set default body if exists
      if (route.body) {
        const defaultBodyGenerator =
          DEFAULT_BODIES[route.path.split(":")[0].replace(/\/$/, "")];
        const defaultBody = defaultBodyGenerator ? defaultBodyGenerator() : {};
        setRequestBody(JSON.stringify(defaultBody, null, 2));
      } else {
        setRequestBody("");
      }
    }
  }, [selectedEndpoint]);

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSendRequest = async () => {
    if (!endpoint) {
      toast.error("Please select an endpoint");
      return;
    }

    if (endpoint.includes(":id") && !idParam) {
      toast.error("Please provide an ID");
      return;
    }

    setLoading(true);
    try {
      const finalEndpoint = endpoint.replace(":id", idParam);

      // Find the selected route to get role requirement
      const selectedRoute = Object.values(ROUTES)
        .flatMap((category) => category.routes)
        .find(
          (route) =>
            route.path.split(":")[0] === endpoint.split(":")[0] &&
            route.method === method
        );

      let requestConfig = {
        method,
        url: finalEndpoint,
        headers: {
          // Development bypass headers
          "X-Dev-Override": "true",
          "X-Dev-Mode": "true",
          // Include specific role if route requires it
          ...(selectedRoute?.role && {
            "X-Dev-Role":
              selectedRoute.role === "SuperAdmin"
                ? "SuperAdmin"
                : selectedRoute.role,
            "X-Dev-Bypass-Auth": "true",
            "X-Dev-Is-SuperAdmin":
              selectedRoute.role === "SuperAdmin" ? "true" : "false",
          }),
        },
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

      // Add visual indicator for development mode
      const startTime = Date.now();
      const result = await api(requestConfig);
      const endTime = Date.now();

      const responseData = {
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers,
        time: endTime - startTime,
        devMode: true, // Flag to show this was a dev request
      };

      setResponse(responseData);

      // Add to history with dev mode flag
      const historyItem = {
        id: Date.now(),
        method,
        endpoint,
        requestBody: requestBody || null,
        response: responseData,
        timestamp: new Date().toISOString(),
        devMode: true,
        roleBypass: selectedRoute?.role,
      };

      setRequestHistory((prev) => [historyItem, ...prev].slice(0, 10));

      toast.success(`Request successful (${responseData.time}ms)`, {
        description: selectedRoute?.role
          ? `Bypassed ${selectedRoute.role} role check`
          : `Status: ${responseData.status} ${responseData.statusText}`,
      });
    } catch (error) {
      console.error("API request error:", error);

      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Error",
        data: error.response?.data || { message: error.message },
        headers: error.response?.headers || {},
        error: true,
        devMode: true,
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
          <div className="space-y-2 w-full">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setSearchOpen(true)}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {selectedEndpoint
                    ? `${
                        ROUTES[selectedEndpoint.split("-")[0]].routes[
                          parseInt(selectedEndpoint.split("-")[1])
                        ].path
                      }`
                    : "Search endpoints..."}
                </span>
              </div>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
              <CommandInput placeholder="Search API endpoints..." />
              <CommandList>
                <CommandEmpty>No endpoints found.</CommandEmpty>
                {Object.entries(ROUTES).map(([category, { routes }]) => (
                  <CommandGroup key={category} heading={category}>
                    {routes.map((route, index) => (
                      <CommandItem
                        key={`${category}-${index}`}
                        value={`${category}-${index}`}
                        onSelect={(value) => {
                          setSelectedEndpoint(value);
                          setSearchOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Badge
                            variant="outline"
                            className={`w-16 text-center shrink-0 ${
                              route.method === "GET"
                                ? "text-blue-500 border-blue-200"
                                : route.method === "POST"
                                ? "text-green-500 border-green-200"
                                : route.method === "PUT"
                                ? "text-orange-500 border-orange-200"
                                : "text-red-500 border-red-200"
                            }`}
                          >
                            {route.method}
                          </Badge>
                          <span className="font-mono text-sm">
                            {route.path}
                          </span>
                          {route.role && (
                            <Badge variant="secondary" className="ml-auto">
                              {route.role}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    <CommandSeparator />
                  </CommandGroup>
                ))}
              </CommandList>
            </CommandDialog>

            {endpoint && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${
                      method === "GET"
                        ? "text-blue-500 border-blue-200"
                        : method === "POST"
                        ? "text-green-500 border-green-200"
                        : method === "PUT"
                        ? "text-orange-500 border-orange-200"
                        : "text-red-500 border-red-200"
                    }`}
                  >
                    {method}
                  </Badge>
                  <code className="text-xs flex-1">
                    {endpoint.replace(":id", idParam || ":id")}
                  </code>
                </div>

                {endpoint.includes(":id") && (
                  <div className="space-y-2">
                    <Label htmlFor="id-param" className="text-xs font-medium">
                      ID Parameter
                    </Label>
                    <Input
                      id="id-param"
                      placeholder="Enter ID..."
                      value={idParam}
                      onChange={(e) => setIdParam(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {["POST", "PUT", "PATCH"].includes(method) && (
            <div className="space-y-2">
              <Label htmlFor="request-body" className="text-xs font-medium">
                Request Body (JSON)
              </Label>
              <Textarea
                id="request-body"
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
                      className={`w-16 text-center shrink-0 ${
                        item.method === "GET"
                          ? "text-blue-500 border-blue-200"
                          : item.method === "POST"
                          ? "text-green-500 border-green-200"
                          : item.method === "PUT"
                          ? "text-orange-500 border-orange-200"
                          : "text-red-500 border-red-200"
                      }`}
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
