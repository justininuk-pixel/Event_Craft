"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { THEMES } from "@/lib/themes/registry";
import { supabase } from "@/lib/db/client";
import { useUserId } from "@/lib/hooks/useUserId";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: {
    id: string;
    title: string;
    event_date: string;
    event_type: string;
    theme_id: string | null;
    recurrence?: string;
  } | null;
}

export function AddEventModal({ isOpen, onClose, onSuccess, eventToEdit }: AddEventModalProps) {
  const userId = useUserId();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form State
  const [themeId, setThemeId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [recurrence, setRecurrence] = useState<"single" | "yearly" | "monthly">("single");
  const [date, setDate] = useState(""); // For single
  const [month, setMonth] = useState("1"); // For yearly
  const [day, setDay] = useState("1"); // For yearly/monthly

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive available categories for the filter
  const categories = useMemo(() => {
    const cats = new Set(THEMES.map(t => t.category));
    return Array.from(cats);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredThemes = useMemo(() => {
    if (selectedCategory === "all") return THEMES;
    return THEMES.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setThemeId(eventToEdit.theme_id || "");
      setRecurrence((eventToEdit.recurrence as "single" | "yearly" | "monthly") || "single");
      
      const d = new Date(eventToEdit.event_date);
      if (eventToEdit.recurrence === "yearly") {
        setMonth(String(d.getMonth() + 1));
        setDay(String(d.getDate()));
      } else if (eventToEdit.recurrence === "monthly") {
        setDay(String(d.getDate()));
      } else {
        // Single
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setDate(`${yyyy}-${mm}-${dd}`);
      }
      setStep(2); // Skip theme selection when editing, or maybe not?
    } else {
      setTitle("");
      setDate("");
      setMonth("1");
      setDay("1");
      setRecurrence("single");
      setThemeId("");
      setStep(1);
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    // Construct target date based on recurrence
    let finalDate = "";
    if (recurrence === "single") {
      if (!date) {
        setError("Please select a date.");
        return;
      }
      finalDate = new Date(date).toISOString();
    } else if (recurrence === "yearly") {
      const currentYear = new Date().getFullYear();
      finalDate = new Date(Date.UTC(currentYear, Number(month) - 1, Number(day), 12, 0, 0)).toISOString();
    } else if (recurrence === "monthly") {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      finalDate = new Date(Date.UTC(currentYear, currentMonth, Number(day), 12, 0, 0)).toISOString();
    }

    if (!title || !finalDate) {
      setError("Please fill in all required fields.");
      return;
    }

    // Determine event type from theme
    let eventType = "Custom";
    if (themeId) {
      const selectedTheme = THEMES.find(t => t.id === themeId);
      if (selectedTheme) {
        eventType = selectedTheme.category.charAt(0).toUpperCase() + selectedTheme.category.slice(1);
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      const eventData = {
        user_id: userId,
        title,
        event_date: finalDate,
        event_type: eventType,
        theme_id: themeId || null,
        recurrence
      };

      if (eventToEdit) {
        const { error: err } = await supabase
          .from("calendar_events")
          .update(eventData)
          .eq("id", eventToEdit.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("calendar_events")
          .insert(eventData);
        if (err) throw err;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? "Edit Event" : step === 1 ? "Select a Theme" : "Event Details"}
      size={step === 1 ? "lg" : "sm"}
    >
      {error && (
        <div className="p-3 mb-4 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col h-[60vh]">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap capitalize transition-colors ${
                  selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setThemeId("")}
              className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                themeId === "" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">⚪</span>
              </div>
              <span className="font-bold text-sm">No Theme</span>
              {themeId === "" && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>

            {filteredThemes.map(theme => {
              const bg = Array.isArray(theme.visual.palette.background)
                ? `linear-gradient(135deg, ${theme.visual.palette.background.join(", ")})`
                : theme.visual.palette.background;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={`relative flex flex-col p-4 border-2 rounded-xl transition-all text-left overflow-hidden ${
                    themeId === theme.id ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-primary/50"
                  }`}
                  style={{ background: bg, color: theme.visual.palette.text }}
                >
                  <div className="text-2xl mb-2">{theme.emoji}</div>
                  <span className="font-extrabold text-sm leading-tight drop-shadow-sm">{theme.name}</span>
                  <span className="text-[10px] uppercase font-bold opacity-80 mt-1 drop-shadow-sm">{theme.category}</span>
                  
                  {themeId === theme.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setStep(2)} className="flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground">Event Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grandma's 80th Birthday"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground">Frequency</label>
            <Select
              value={recurrence}
              onChange={(val: any) => setRecurrence(val)}
              options={[
                { value: "single", label: "Single Event (Does not repeat)" },
                { value: "yearly", label: "Yearly (e.g. Birthday, Anniversary)" },
                { value: "monthly", label: "Monthly (e.g. Monthly check-in)" },
              ]}
            />
          </div>

          {recurrence === "single" && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-muted-foreground">Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          )}

          {recurrence === "yearly" && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Month *"
                value={month}
                onChange={(val) => setMonth(val)}
                options={[
                  { value: "1", label: "January" },
                  { value: "2", label: "February" },
                  { value: "3", label: "March" },
                  { value: "4", label: "April" },
                  { value: "5", label: "May" },
                  { value: "6", label: "June" },
                  { value: "7", label: "July" },
                  { value: "8", label: "August" },
                  { value: "9", label: "September" },
                  { value: "10", label: "October" },
                  { value: "11", label: "November" },
                  { value: "12", label: "December" },
                ]}
              />
              <Input
                label="Day *"
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                required
              />
            </div>
          )}

          {recurrence === "monthly" && (
            <div className="space-y-1.5">
              <Input
                label="Day of Month *"
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => setStep(1)} disabled={submitting} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={submitting}>
                {eventToEdit ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
