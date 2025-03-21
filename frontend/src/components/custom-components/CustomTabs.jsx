import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * CustomTabs - A reusable tabs component with understated design
 * 
 * @param {Object} props
 * @param {string} props.defaultValue - The default active tab
 * @param {function} props.onValueChange - Callback function when tab changes
 * @param {Array} props.tabs - Array of tab objects with { value, label, icon: IconComponent }
 * @param {React.ReactNode} props.children - Content for each tab, should be TabsContent components
 * @param {string} props.className - Optional additional class names
 * @param {string} props.tabsListClassName - Optional class names for the tabs list container
 */
export function CustomTabs({ 
  defaultValue, 
  onValueChange, 
  tabs = [], 
  children,
  className = "",
  tabsListClassName = ""
}) {
  return (
    <Tabs 
      defaultValue={defaultValue} 
      onValueChange={onValueChange} 
      className={`w-full ${className}`}
    >
      <div className="border-b">
        <TabsList className={`h-12 w-full justify-start rounded-none bg-transparent p-0 ${tabsListClassName}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            
            return (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:text-foreground whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{tab.label}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </Tabs>
  );
}

/**
 * TabPanel - A helper component for rendering tab content
 * 
 * @param {Object} props
 * @param {string} props.value - The tab value this content belongs to
 * @param {React.ReactNode} props.children - Content to display
 * @param {string} props.className - Optional additional class names
 */
export function TabPanel({ value, children, className = "" }) {
  return (
    <TabsContent value={value} className={`h-full ${className}`}>
      {children}
    </TabsContent>
  );
} 