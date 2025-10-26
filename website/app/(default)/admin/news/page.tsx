"use client";

import React from "react";
import { AdminNewsCreateButton } from "@/components/admin/news/AdminNewsCreateButton";
import { AdminNewsTable } from "@/components/admin/news/AdminNewsTable";
import { News } from "@/db/schema/news";

const NewsPage = () => {
  const [news, setNews] = React.useState<News[]>([]);

  React.useEffect(() => {
    // TODO fetch news from /api/news
    fetch("/api/news")
      .then((res) => res.json())
      .then((res) => {
        if (res.error) throw new Error(res.message);

        setNews(res.data);
      });
  }, []);

  return (
    <div className="ml-8 flex flex-col gap-4">
      <AdminNewsCreateButton onNewNews={(news) => setNews((old) => [...old, news])} />
      <AdminNewsTable
        news={news}
        onRemoveNews={(keyId) => setNews((old) => old.filter((k) => k.id !== keyId))}
      />
    </div>
  );
};

export default NewsPage;
