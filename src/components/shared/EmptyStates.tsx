"use client";

import React from "react";
import { ShoppingBag, MessageSquare, Megaphone, Camera, Users, Search } from "lucide-react";

import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  isWidget?: boolean;
  actionLabel?: string;
  actionHref?: string;
}

function BaseEmptyState({
  title,
  description,
  isWidget,
  actionLabel,
  actionHref,
  icon: Icon,
  blobColor,
  iconColor,
}: EmptyStateProps & { icon: React.ElementType; blobColor: string; iconColor: string }) {
  if (isWidget) {
    return (
      <div className="flex flex-col w-full min-h-[200px] items-center justify-center text-center p-2 text-text-disabled">
        <Icon className={`w-8 h-8 mb-2 opacity-50 ${iconColor}`} />
        <p className="font-medium text-sm text-text-muted">{title}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-center justify-center text-center py-20 bg-surface-hover/20 rounded-2xl border border-dashed border-border relative overflow-hidden">

      <div className={`relative z-10 w-20 h-20 mb-6 rounded-full flex items-center justify-center bg-surface-hover border border-border`}>
        <Icon className={`w-10 h-10 ${iconColor}`} />
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-2 relative z-10">
        {title}
      </h3>

      <p className="text-text-muted max-w-sm relative z-10 mb-6">
        {description}
      </p>

      {actionLabel && actionHref && !isWidget && (
        <div className="relative z-10">
          <Link
            href={actionHref}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-surface font-semibold rounded-lg transition-colors inline-block"
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}

export function EmptyMarketplace({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <BaseEmptyState
      title="Marketplace is Empty"
      description="No items have been listed for sale yet. Be the first to post something!"
      isWidget={isWidget}
      icon={ShoppingBag}
      blobColor="bg-primary"
      iconColor="text-warning"
      actionLabel="List an Item"
      actionHref="#action-form"
    />
  );
}

export function EmptyComplaints({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <BaseEmptyState
      title="No Active Complaints"
      description="It's quiet here. Everything seems to be running smoothly on campus!"
      isWidget={isWidget}
      icon={MessageSquare}
      blobColor="bg-warning"
      iconColor="text-warning"
      actionLabel="File a Complaint"
      actionHref="#action-form"
    />
  );
}

export function EmptyAnnouncements({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <BaseEmptyState
      title="No Announcements"
      description="There are no official announcements from the faculty at this time."
      isWidget={isWidget}
      icon={Megaphone}
      blobColor="bg-warning"
      iconColor="text-warning"
    />
  );
}

export function EmptyLostFound({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <BaseEmptyState
      title="No Items Found"
      description="No lost or found items have been reported recently."
      isWidget={isWidget}
      icon={Camera}
      blobColor="bg-primary"
      iconColor="text-warning"
      actionHref="#action-form"
    />
  );
}

export function EmptyDirectory({ isWidget = false }: { isWidget?: boolean }) {
  return (
    <BaseEmptyState
      title="Directory Empty"
      description="No faculty members match your search criteria or the directory is empty."
      isWidget={isWidget}
      icon={Users}
      blobColor="bg-text-muted"
      iconColor="text-text-secondary"
    />
  );
}

export function EmptySearch({ searchTerm }: { searchTerm: string }) {
  return (
    <BaseEmptyState
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}". Try adjusting your keywords or clearing the search.`}
      isWidget={false}
      icon={Search}
      blobColor="bg-text-muted"
      iconColor="text-text-secondary"
    />
  );
}
