import type { Tag } from "../types/tag";
import API from "./axios";

export const getTagsListService = async (page: number, limit: number) => {
  const response = await API.get<Tag[]>(`/admin/tags?page=${page}&limit=${limit}`);
  return response;
};

export const createTagService = async (data: { name: string }) => {
  const response = await API.post<unknown>(`/admin/tags`, data);
  return response;
};

export const editTagService = async (id: string, data: { name: string }) => {
  const response = await API.put<unknown>(`/admin/tags/${id}`, data);
  return response;
};

export const deleteTagService = async (id: string) => {
  const response = await API.delete<unknown>(`/admin/tags/${id}`);
  return response;
};
