import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Languages } from "lucide-react";

interface SettingsMenuProps {
  language: string;
  setLanguage: (lang: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const languageNames = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  pt: "Português"
};

export default function SettingsMenu({ language, setLanguage, isDark, setIsDark }: SettingsMenuProps) {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Languages className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(languageNames).map(([code, name]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className={language === code ? "bg-accent" : ""}
            >
              {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsDark(!isDark)}
      >
        {isDark ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>
    </div>
  );
} 