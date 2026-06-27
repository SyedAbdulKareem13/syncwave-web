import { cx } from "@/lib/util";

export function GlassCard({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}) {
  return <Tag className={cx("glass rounded-card", className)}>{children}</Tag>;
}
