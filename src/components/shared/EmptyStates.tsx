"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, MessageSquare, Megaphone, Camera, Users } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  isWidget?: boolean;
}

function BaseEmptyState({
  title,
  description,
  isWidget,
  icon: Icon,
  blobColor,
  iconColor,
}: EmptyStateProps & { icon: React.ElementType; blobColor: string; iconColor: string }) {
  if (isWidget) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center text-center p-6 text-slate-500">
        <Icon className={`w-8 h-8 mb-2 opacity-50 ${iconColor}`} />
        <p className="font-medium text-sm text-slate-400">{title}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-center justify-center text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/50 relative overflow-hidden">
      {/* Background blobs for aesthetics */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className={`w-48 h-48 rounded-full blur-3xl ${blobColor} absolute`}></div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={`relative z-10 w-20 h-20 mb-6 rounded-full flex items-center justify-center bg-slate-900/80 border border-slate-700/50 shadow-2xl`}
      >
        <Icon className={`w-10 h-10 ${iconColor}`} />
      </motion.div>

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-bold text-slate-200 mb-2 relative z-10"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 max-w-sm relative z-10"
      >
        {description}
      </motion.p>
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
      blobColor="bg-purple-500"
      iconColor="text-purple-400"
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
      blobColor="bg-orange-500"
      iconColor="text-orange-400"
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
      blobColor="bg-blue-500"
      iconColor="text-blue-400"
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
      blobColor="bg-teal-500"
      iconColor="text-teal-400"
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
      blobColor="bg-slate-400"
      iconColor="text-slate-300"
    />
  );
}
