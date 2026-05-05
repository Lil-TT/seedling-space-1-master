import type { Activity } from "@prisma/client";

export type StudentEligibility = {
  classId: string | null;
  gradeLevel: number | null;
};

export function studentCanJoinActivity(
  activity: Pick<Activity, "targetClassId" | "minGrade" | "maxGrade">,
  student: StudentEligibility
): boolean {
  if (activity.targetClassId) {
    if (!student.classId || student.classId !== activity.targetClassId) return false;
  }
  if (activity.minGrade != null) {
    if (student.gradeLevel == null || student.gradeLevel < activity.minGrade) return false;
  }
  if (activity.maxGrade != null) {
    if (student.gradeLevel == null || student.gradeLevel > activity.maxGrade) return false;
  }
  return true;
}
