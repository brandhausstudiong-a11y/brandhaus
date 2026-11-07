"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Group = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
};

type GroupsResponse = {
  groups: Group[];
};

const fetcher = async (url: string): Promise<GroupsResponse> => {
  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load category groups."
    );
  }

  return data;
};

function GroupListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-[62px] items-center rounded-md bg-neutral-200 px-5"
        >
          <Skeleton className="h-5 w-6 bg-neutral-300" />

          <Skeleton className="ml-4 h-5 w-32 bg-neutral-300" />

          <div className="ml-auto flex items-center gap-7">
            <Skeleton className="h-5 w-10 bg-neutral-300" />
            <Skeleton className="h-5 w-12 bg-neutral-300" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GroupList() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<GroupsResponse>(
    "/api/admin/category-groups",
    fetcher
  );

  const groups = data?.groups ?? [];

  const [editingGroup, setEditingGroup] =
    useState<Group | null>(null);

  const [groupName, setGroupName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
  };

  const closeEditDialog = () => {
    if (isUpdating) return;

    setEditingGroup(null);
    setGroupName("");
  };

  const handleUpdate = async () => {
    if (!editingGroup || !groupName.trim()) {
      return;
    }

    setIsUpdating(true);

    const request = fetch(
      `/api/admin/category-groups/${editingGroup.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName.trim(),
        }),
      }
    ).then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update group."
        );
      }

      return data;
    });

    toast.promise(request, {
      loading: "Updating Group...",
      success: "Group updated successfully.",
      error: (error) =>
        error instanceof Error
          ? error.message
          : "Failed to update group.",
    });

    try {
      await request;

      setEditingGroup(null);
      setGroupName("");

      await mutate();
    } catch {
      // Error is already handled by toast.promise()
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this group?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    const request = fetch(
      `/api/admin/category-groups/${id}`,
      {
        method: "DELETE",
      }
    ).then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete group."
        );
      }

      return data;
    });

    toast.promise(request, {
      loading: "Deleting Group...",
      success: "Group deleted successfully.",
      error: (error) =>
        error instanceof Error
          ? error.message
          : "Failed to delete group.",
    });

    try {
      await request;

      await mutate();
    } catch {
      // Error is already handled by toast.promise()
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="w-full">
        <h2 className="mb-12 text-2xl font-medium tracking-tight text-neutral-950 capitalize">
          Active Groups
        </h2>

        {/* Loading */}
        {isLoading && <GroupListSkeleton />}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-md bg-red-50 px-5 py-6 text-center">
            <p className="text-sm font-medium text-red-600">
              {error.message || "Failed to load groups."}
            </p>

            <button
              type="button"
              onClick={() => mutate()}
              className="mt-3 text-sm font-medium text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Groups */}
        {!isLoading && !error && groups.length > 0 && (
          <div className="space-y-3">
            {groups.map((group, index) => (
              <div
                key={group.id}
                className="flex min-h-[62px] items-center rounded-md bg-neutral-200 px-5"
              >
                {/* Number */}
                <span className="w-10 shrink-0 text-base font-medium text-neutral-900">
                  {index + 1}.
                </span>

                {/* Group name */}
                <span className="flex-1 text-base font-medium text-neutral-900 capitalize">
                  {group.name}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-7">
                  <button
                    type="button"
                    onClick={() => handleEdit(group)}
                    disabled={deletingId === group.id}
                    className="text-base font-medium text-green-600 transition-colors hover:text-green-700 disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(group.id)}
                    disabled={deletingId === group.id}
                    className="text-base font-medium text-red-500 transition-colors hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === group.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && groups.length === 0 && (
          <div className="rounded-md bg-neutral-100 py-12 text-center">
            <p className="text-sm text-neutral-500">
              No groups found.
            </p>
          </div>
        )}
      </section>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingGroup}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-neutral-900">
              Edit Group
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-5">
            <div>
              <label
                htmlFor="group-name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Name
              </label>

              <Input
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                disabled={isUpdating}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={isUpdating}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleUpdate}
                disabled={
                  !groupName.trim() ||
                  isUpdating
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}