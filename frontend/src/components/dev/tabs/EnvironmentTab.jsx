import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Laptop, Server } from "lucide-react";

const EnvironmentTab = () => {
  const [envVars, setEnvVars] = useState([]);

  useEffect(() => {
    // Get all environment variables from import.meta.env
    const vars = Object.entries(import.meta.env)
      .filter(
        ([key]) => !key.includes("VITE_") || key.startsWith("VITE_PUBLIC_")
      )
      .map(([key, value]) => ({ key, value: String(value) }));

    setEnvVars(vars);
  }, []);

  return (
    <div className="space-y-4 pb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="h-4 w-4" />
            Environment Information
          </CardTitle>
          <CardDescription>
            Current environment settings and variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="space-y-1">
              <p className="text-xs font-medium">Mode</p>
              <Badge
                variant={
                  import.meta.env.MODE === "development"
                    ? "default"
                    : "destructive"
                }
              >
                {import.meta.env.MODE}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium">API URL</p>
              <p className="text-xs break-all font-mono">
                {import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Environment Variables</p>
            <Card className="border">
              <ScrollArea className="h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Variable</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {envVars.map(({ key, value }) => (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-xs">
                          {key}
                        </TableCell>
                        <TableCell className="font-mono text-xs break-all">
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            Browser Information
          </CardTitle>
          <CardDescription>
            Details about the current browser environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs font-medium">User Agent</p>
                <p className="text-xs break-all font-mono">
                  {navigator.userAgent}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">Platform</p>
                <p className="text-xs font-mono">{navigator.platform}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="space-y-1">
                <p className="text-xs font-medium">Screen Resolution</p>
                <p className="text-xs font-mono">
                  {window.screen.width} x {window.screen.height}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">Viewport Size</p>
                <p className="text-xs font-mono">
                  {window.innerWidth} x {window.innerHeight}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentTab;
