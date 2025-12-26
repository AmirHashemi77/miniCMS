import type { Article } from "../types/article";
import API from "./axios";

export const getAticlesListService = async (page: number, limit: number) => {
  const response = await API.get<Article[]>(`/admin/articles?page=${page}&limit=${limit}`);
  return response;
};

export const createAticlesService = async (data: Article) => {
  const response = await API.post<unknown>(`/admin/articles`, data);
  return response;
};

export const editAticlesService = async (id: string, data: Omit<Article, "id ">) => {
  const response = await API.put<unknown>(`/admin/articles/${id}`, data);
  return response;
};

export const deleteAticlesService = async (id: string) => {
  const response = await API.delete<unknown>(`/admin/articles/${id}`);
  return response;
};
