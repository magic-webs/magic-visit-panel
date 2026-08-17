"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { DATE_RANGE_PRESETS, monthToDateRange, presetToRange, type DateRange } from "@/lib/analytics/aggregate";

export function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  const [open, setOpen] = React.useState(false);

  const label = `${value.from.toLocaleDateString()} – ${value.to.toLocaleDateString()}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <CalendarIcon />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col gap-1 border-b p-2 sm:w-40 sm:border-r sm:border-b-0">
            {DATE_RANGE_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(presetToRange(preset.days));
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
            <Separator className="my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                onChange(monthToDateRange());
                setOpen(false);
              }}
            >
              Month to date
            </Button>
          </div>
          <Calendar
            mode="range"
            selected={{ from: value.from, to: value.to }}
            onSelect={(range) => {
              if (range?.from) {
                onChange({ from: range.from, to: range.to ?? range.from });
              }
            }}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
