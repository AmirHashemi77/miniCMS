import type { Article } from "../types/article";
import API from "./axios";

export const getAticlesListService = async (page: number, limit: number) => {
  const response = await API.get<Article[]>(`/admin/articles?page=${page}&limit=${limit}`);
  return response;
};

export const getAticleService = async (id: string) => {
  const response = await API.get<Article>(`/admin/articles/${id}`);
  return response;
};
export const changeStatusAticleService = async (id: string) => {
  const response = await API.patch<Article>(`/admin/articles/${id}/status`);
  return response;
};

export const createAticlesService = async (data: Omit<Article, "id" | "createdAt" | "updatedAt">) => {
  const response = await API.post<Article>(`/admin/articles`, data);
  return response;
};

export const editAticlesService = async (id: string, data: Partial<Omit<Article, "id">>) => {
  const response = await API.put<Article>(`/admin/articles/${id}`, data);
  return response;
};

export const deleteAticlesService = async (id: string) => {
  const response = await API.delete<void>(`/admin/articles/${id}`);
  return response;
};
