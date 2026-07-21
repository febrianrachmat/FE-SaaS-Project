"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ApiError } from "@/shared/types/api";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "../schemas/project.schema";
import { useCreateTask } from "../hooks/use-project";

type Props = {
  workspaceSlug: string;
  projectSlug: string;
  onCreated?: () => void;
};

export function CreateTaskForm({
  workspaceSlug,
  projectSlug,
  onCreated,
}: Props) {
  const create = useCreateTask(workspaceSlug, projectSlug);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  return (
    <form
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      onSubmit={handleSubmit(async (values) => {
        try {
          await create.mutateAsync(values);
          reset();
          onCreated?.();
        } catch {
          // shown below
        }
      })}
      noValidate
    >
      <div>
        <Label htmlFor="task-title">New task</Label>
        <Input
          id="task-title"
          placeholder="What needs to be done?"
          {...register("title")}
        />
        {errors.title ? (
          <p className="mt-1 text-xs text-danger-600">{errors.title.message}</p>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          {...register("status")}
        >
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="TESTING">Testing</option>
          <option value="DONE">Done</option>
        </select>
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          {...register("priority")}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <Input type="date" {...register("dueDate")} />
      </div>
      {create.error instanceof ApiError ? (
        <p className="text-sm text-danger-600">{create.error.message}</p>
      ) : null}
      <Button type="submit" size="sm" disabled={create.isPending}>
        {create.isPending ? "Adding…" : "Add task"}
      </Button>
    </form>
  );
}
