import type { Tag } from "../types/tag";
import API from "./axios";

export const getTagsListService = async (page: number, limit: number) => {
  const response = await API.get<Tag[]>(`/admin/tags?page=${page}&limit=${limit}`);
  return response;
};

export const createTagService = async (data: { name: string }) => {
  const response = await API.post<Tag>(`/admin/tags`, data);
  return response;
};

export const editTagService = async (id: string, data: { name: string }) => {
  const response = await API.put<Tag>(`/admin/tags/${id}`, data);
  return response;
};

export const deleteTagService = async (id: string) => {
  const response = await API.delete<void>(`/admin/tags/${id}`);
  return response;
};
