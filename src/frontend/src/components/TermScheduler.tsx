import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type HolidayPeriod,
  type TermSchedule,
  getTermScheduleForTeacher,
  saveTermScheduleForTeacher,
} from "../utils/termStorage";

type Props = {
  teacherName: string;
  onClose: () => void;
};

export function TermScheduler({ teacherName, onClose }: Props) {
  const [schedule, setSchedule] = useState<TermSchedule>(() =>
    getTermScheduleForTeacher(teacherName),
  );
  const [termEndInput, setTermEndInput] = useState(schedule.termEndDate);
  const [holidayLabel, setHolidayLabel] = useState("");
  const [holidayStart, setHolidayStart] = useState("");
  const [holidayEnd, setHolidayEnd] = useState("");

  function handleSaveTermEnd() {
    if (!termEndInput) {
      toast.error("Please pick a term end date.");
      return;
    }
    const updated: TermSchedule = {
      ...schedule,
      termEndDate: termEndInput,
      updatedAt: Date.now(),
    };
    saveTermScheduleForTeacher(updated);
    setSchedule(updated);
    toast.success("Term end date saved!");
  }

  function handleClearTermEnd() {
    const updated: TermSchedule = {
      ...schedule,
      termEndDate: "",
      updatedAt: Date.now(),
    };
    saveTermScheduleForTeacher(updated);
    setSchedule(updated);
    setTermEndInput("");
    toast.success("Term end date cleared.");
  }

  function handleAddHoliday() {
    if (!holidayLabel.trim() || !holidayStart || !holidayEnd) {
      toast.error("Please fill in all holiday fields.");
      return;
    }
    if (holidayEnd < holidayStart) {
      toast.error("End date must be on or after start date.");
      return;
    }
    const holiday: HolidayPeriod = {
      id: `hol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: holidayLabel.trim(),
      startDate: holidayStart,
      endDate: holidayEnd,
    };
    const updated: TermSchedule = {
      ...schedule,
      holidays: [...schedule.holidays, holiday],
      updatedAt: Date.now(),
    };
    saveTermScheduleForTeacher(updated);
    setSchedule(updated);
    setHolidayLabel("");
    setHolidayStart("");
    setHolidayEnd("");
    toast.success(`Holiday "${holiday.label}" added!`);
  }

  function handleDeleteHoliday(id: string) {
    const updated: TermSchedule = {
      ...schedule,
      holidays: schedule.holidays.filter((h) => h.id !== id),
      updatedAt: Date.now(),
    };
    saveTermScheduleForTeacher(updated);
    setSchedule(updated);
    toast.success("Holiday removed.");
  }

  function formatDate(d: string) {
    if (!d) return "";
    return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function daysUntil(d: string): number | null {
    if (!d) return null;
    const now = new Date();
    const target = new Date(`${d}T00:00:00`);
    const diff = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  }

  const termDays = daysUntil(schedule.termEndDate);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">
                When Does the Term End?
              </h2>
              <p className="text-xs text-muted-foreground">
                Schedule term end and holidays
              </p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Term End Date */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground">Term End Date</p>
            {schedule.termEndDate && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <CalendarDays className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">
                    {formatDate(schedule.termEndDate)}
                  </p>
                  {termDays !== null && (
                    <p className="text-xs text-amber-600">
                      {termDays > 0
                        ? `${termDays} day${termDays !== 1 ? "s" : ""} remaining`
                        : termDays === 0
                          ? "Term ends today!"
                          : `Term ended ${Math.abs(termDays)} day${Math.abs(termDays) !== 1 ? "s" : ""} ago`}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-amber-500 hover:text-destructive"
                  onClick={handleClearTermEnd}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type="date"
                value={termEndInput}
                onChange={(e) => setTermEndInput(e.target.value)}
                className="h-9 flex-1"
              />
              <Button
                onClick={handleSaveTermEnd}
                className="bg-amber-500 hover:bg-amber-600 text-white h-9 px-4"
              >
                Save
              </Button>
            </div>
          </div>

          {/* Holidays */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground">Holidays</p>

            {schedule.holidays.length > 0 && (
              <div className="space-y-2">
                {schedule.holidays.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {h.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(h.startDate)} — {formatDate(h.endDate)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteHoliday(h.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add holiday form */}
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Add Holiday
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Holiday Name</Label>
                  <Input
                    placeholder="e.g. Easter Break, Half Term"
                    value={holidayLabel}
                    onChange={(e) => setHolidayLabel(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={holidayStart}
                      onChange={(e) => setHolidayStart(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={holidayEnd}
                      onChange={(e) => setHolidayEnd(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddHoliday}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Holiday
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
