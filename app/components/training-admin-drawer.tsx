"use client";

import type { TrainingRecord } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { AdminDrawer } from "./admin-drawer";
import { TrainingCreateForm, TrainingEditorForm } from "./training-editor-form";

const drawerCloseDelayMs = 220;

export type TrainingDrawerState =
  | { type: "addTraining" }
  | { type: "training"; trainingId: string }
  | null;

interface TrainingAdminDrawerProps {
  trainings: TrainingRecord[];
  state: TrainingDrawerState;
  onClose: () => void;
}

export function TrainingAdminDrawer({
  trainings,
  state,
  onClose,
}: TrainingAdminDrawerProps) {
  const [renderedState, setRenderedState] =
    useState<TrainingDrawerState>(state);
  const [open, setOpen] = useState(Boolean(state));
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (openFrameRef.current !== null) {
      cancelAnimationFrame(openFrameRef.current);
    }

    openFrameRef.current = requestAnimationFrame(() => {
      setRenderedState(state);
      setOpen(true);
      openFrameRef.current = null;
    });
  }, [state]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      if (openFrameRef.current !== null) {
        cancelAnimationFrame(openFrameRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (!renderedState || !open) return;

    setOpen(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setRenderedState(null);
      onClose();
    }, drawerCloseDelayMs);
  };

  if (!renderedState) return null;

  if (renderedState.type === "addTraining") {
    return (
      <AdminDrawer
        open={open}
        onClose={handleClose}
        title="Новая программа"
        description="Создайте новую карточку обучения прямо на пользовательской странице."
      >
        <TrainingCreateForm onSuccess={handleClose} />
      </AdminDrawer>
    );
  }

  const training = trainings.find(
    (entry) => entry.id === renderedState.trainingId,
  );

  if (!training) return null;

  return (
    <AdminDrawer
      open={open}
      onClose={handleClose}
      title={training.title}
      description="Меняйте программу обучения, блоки и фотографии прямо поверх публичной страницы."
    >
      <TrainingEditorForm
        key={training.id}
        training={training}
        onDelete={handleClose}
      />
    </AdminDrawer>
  );
}
