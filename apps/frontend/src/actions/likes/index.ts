"use server";

import { getAuthToken } from "../auth/session";

export type ReactionStatus = {
  liked: boolean;
  disliked: boolean;
};

const DEFAULT_STATUS: ReactionStatus = { liked: false, disliked: false };

async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response | null> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string>) },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Erro na requisição de reações:", error);
    return null;
  }
}

export async function getCourseReactionStatus(
  courseId: string,
): Promise<ReactionStatus> {
  if (!courseId) return DEFAULT_STATUS;

  const response = await apiFetch(`/courses/${courseId}/likes`);
  if (!response?.ok) return DEFAULT_STATUS;

  return (await response.json()) as ReactionStatus;
}

export async function getLessonReactionStatus(
  lessonId: number,
): Promise<ReactionStatus> {
  if (!lessonId) return DEFAULT_STATUS;

  const response = await apiFetch(`/lessons/${lessonId}/likes`);
  if (!response?.ok) return DEFAULT_STATUS;

  return (await response.json()) as ReactionStatus;
}

async function mutateCourseReaction(
  courseId: string,
  path: "likes" | "dislikes",
  method: "POST" | "DELETE",
): Promise<ReactionStatus | null> {
  const response = await apiFetch(`/courses/${courseId}/${path}`, { method });
  if (!response?.ok) return null;
  return (await response.json()) as ReactionStatus;
}

async function mutateLessonReaction(
  lessonId: number,
  path: "likes" | "dislikes",
  method: "POST" | "DELETE",
): Promise<ReactionStatus | null> {
  const response = await apiFetch(`/lessons/${lessonId}/${path}`, { method });
  if (!response?.ok) return null;
  return (await response.json()) as ReactionStatus;
}

export async function toggleCourseLike(
  courseId: string,
  currentlyLiked: boolean,
): Promise<ReactionStatus | null> {
  if (!courseId) return null;
  return mutateCourseReaction(
    courseId,
    "likes",
    currentlyLiked ? "DELETE" : "POST",
  );
}

export async function toggleCourseDislike(
  courseId: string,
  currentlyDisliked: boolean,
): Promise<ReactionStatus | null> {
  if (!courseId) return null;
  return mutateCourseReaction(
    courseId,
    "dislikes",
    currentlyDisliked ? "DELETE" : "POST",
  );
}

export async function toggleLessonLike(
  lessonId: number,
  currentlyLiked: boolean,
): Promise<ReactionStatus | null> {
  if (!lessonId) return null;
  return mutateLessonReaction(
    lessonId,
    "likes",
    currentlyLiked ? "DELETE" : "POST",
  );
}

export async function toggleLessonDislike(
  lessonId: number,
  currentlyDisliked: boolean,
): Promise<ReactionStatus | null> {
  if (!lessonId) return null;
  return mutateLessonReaction(
    lessonId,
    "dislikes",
    currentlyDisliked ? "DELETE" : "POST",
  );
}
