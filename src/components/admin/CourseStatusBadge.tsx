import type { CourseStatus } from "@/types/database";

export default function CourseStatusBadge({
  status,
}: {
  status: CourseStatus;
}) {
  const styles = {
    published: "badge-green",
    draft: "badge-amber",
    archived: "badge-gray",
  };

  return (
    <span className={styles[status] ?? "badge-gray"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}