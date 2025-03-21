import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { isChromeBrowser } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

const CustomSelect = ({
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  icon: Icon,
  className,
  showSearch = false,
  maxHeight = 250,
  ...props
}) => {
  const isChrome = isChromeBrowser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      // Small delay to ensure the content is fully rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showSearch]);

  // Filter options based on search term
  useEffect(() => {
    if (!showSearch || !searchTerm) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options, showSearch]);

  // For Chrome native select
  const handleSelectChange = (e) => {
    onChange(e.target.value);
  };

  // For modern Select component
  const renderSelectContent = () => (
    <SelectContent onOpenChange={setIsOpen}>
      {showSearch && (
        <div className="px-2 py-2 sticky top-0 bg-background border-b z-10">
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              ref={searchInputRef}
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              // These event handlers prevent focus loss
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              // Prevent any keyboard events from bubbling up
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      <ScrollArea className={`${showSearch && filteredOptions.length > 5 ? 'max-h-[200px]' : ''}`}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        ) : (
          <div className="px-2 py-2 text-sm text-muted-foreground text-center">
            No results found
          </div>
        )}
      </ScrollArea>
    </SelectContent>
  );

  // For native Chrome select with search
  const renderChromeSelect = () => {
    if (showSearch) {
      const [chromeIsOpen, setChromeIsOpen] = useState(false);
      
      useEffect(() => {
        if (chromeIsOpen && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, [chromeIsOpen]);

  return (
        <div className="relative">
          <div className="rounded-md border border-input bg-background p-2 space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                ref={searchInputRef}
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                onClick={() => setChromeIsOpen(true)}
                onFocus={() => setChromeIsOpen(true)}
                onBlur={() => setChromeIsOpen(false)}
              />
            </div>
            
            <div className={`overflow-y-auto relative ${filteredOptions.length > 5 ? `max-h-[${maxHeight}px]` : ''}`}>
              <select
                id={name}
                className={`${
                  Icon ? "pl-10" : "pl-3"
                } flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background pr-10 appearance-none`}
                value={value || ""}
                onChange={handleSelectChange}
                size={Math.min(filteredOptions.length, 5)}
                {...props}
              >
                {!value && (
                  <option
                    value=""
                    disabled
                    className="text-muted-foreground"
                  >
                    {placeholder}
                  </option>
                )}
                {filteredOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="text-foreground"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className={`h-4 w-4 opacity-50 ${
                    props.disabled ? "opacity-30" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Return normal select with icon
    return (
          <div className="relative">
            <select
              id={name}
              className={`${
                Icon ? "pl-10" : "pl-3"
              } flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background pr-10 appearance-none`}
              value={value || ""}
          onChange={handleSelectChange}
              {...props}
            >
              {!value && (
                <option
                  value=""
                  disabled
                  className="text-muted-foreground"
                >
                  {placeholder}
                </option>
              )}
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-foreground"
                >
                  {option.label}
                </option>
              ))}
            </select>
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className={`h-4 w-4 opacity-50 ${
                  props.disabled ? "opacity-30" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
    );
  };

  return (
    <div className={className}>
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        )}
        {isChrome ? renderChromeSelect() : (
          <Select
            value={value}
            onValueChange={onChange}
            onOpenChange={setIsOpen}
            {...props}
          >
            <SelectTrigger
              className={`${
                Icon ? "pl-10" : ""
              } h-11 bg-background border-input ring-offset-background focus:ring-ring w-full`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            {renderSelectContent()}
          </Select>
        )}
      </div>
    </div>
  );
};

export default CustomSelect; 