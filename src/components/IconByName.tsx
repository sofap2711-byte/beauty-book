"use client";

import {
  Sparkles,
  Heart,
  Flower2,
  LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Sparkles,
  Heart,
  Flower2,
};

export default function IconByName({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = iconMap[name] || Sparkles;
  return <Icon {...props} />;
}
