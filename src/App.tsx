import type { FC } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ArticlesList from "./pages/articles/ArticlesList";
import CreateArticle from "./pages/articles/CreateArticle";
import EditArticle from "./pages/articles/EditArticle";
import NotFound from "./pages/NotFound";
import TagsList from "./pages/tags/TagsList";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/articles" replace />} />

          <Route path="articles" element={<Outlet />}>
            <Route index element={<ArticlesList />} />
            <Route path="new" element={<CreateArticle />} />
            <Route path=":id/edit" element={<EditArticle />} />
          </Route>
          <Route path="tags" element={<TagsList />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
