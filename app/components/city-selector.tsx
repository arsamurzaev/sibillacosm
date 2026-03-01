"use client";

import { MapPin } from "lucide-react";
import type { City } from "../data";

interface CitySelectorProps {
  onSelect: (city: City) => void;
}

export function CitySelector({ onSelect }: CitySelectorProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] px-5 md:px-6 flex flex-col items-center animate-fade-in-up">
        {/* Logo area */}
        <div className="mb-9 md:mb-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-5 md:mb-6">
            <MapPin className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground tracking-tight text-center">
            {"Выберите город"}
          </h1>
          <p className="mt-3 text-[13px] text-muted-foreground text-center leading-relaxed max-w-[260px]">
            {"Цены и контакты зависят от выбранного города"}
          </p>
        </div>

        {/* City buttons */}
        <div className="w-full flex flex-col gap-2.5 md:gap-3">
          <button
            type="button"
            onClick={() => onSelect("grozny")}
            className="
              group relative w-full py-4 md:py-5 px-5 md:px-6 rounded-2xl
              bg-card border border-border
              transition-all duration-300
              hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
              active:scale-[0.98] cursor-pointer
            "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/[0.06] flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/10">
                  <span className="text-lg">{"G"}</span>
                </div>
                <div className="text-left">
                  <span className="block text-[16px] font-medium text-foreground tracking-tight">
                    {"Грозный"}
                  </span>
                  <span className="block text-[12px] text-muted-foreground mt-0.5">
                    {"@sibillacosm"}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelect("moscow")}
            className="
              group relative w-full py-4 md:py-5 px-5 md:px-6 rounded-2xl
              bg-card border border-border
              transition-all duration-300
              hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
              active:scale-[0.98] cursor-pointer
            "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/[0.06] flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/10">
                  <span className="text-lg">{"M"}</span>
                </div>
                <div className="text-left">
                  <span className="block text-[16px] font-medium text-foreground tracking-tight">
                    {"Москва"}
                  </span>
                  <span className="block text-[12px] text-muted-foreground mt-0.5">
                    {"@sibillacosm"}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
