"use client";

import React from "react";
import { AdminNewsCreateButton } from "@/components/admin/news/AdminNewsCreateButton";
import { AdminNewsTable } from "@/components/admin/news/AdminNewsTable";
import { News } from "@/db/schema/news";

const NewsPage = () => {
  const [news, setNews] = React.useState<News[]>([]);

  React.useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((res) => {
        if (res.error) throw new Error(res.message);

        setNews(res.data);
      });
  }, []);

  return (
    <div className="mx-8 flex flex-col gap-4">
      <AdminNewsCreateButton onNewNews={(news) => setNews((old) => [...old, news])} />
      <AdminNewsTable
        news={news}
        onRemoveNews={(keyId) => setNews((old) => old.filter((k) => k.id !== keyId))}
        onUpdateNews={(news) =>
          setNews((old) => [...old.filter((k) => k.id !== news.id), news])
        }
      />
    </div>
  );
};

export default NewsPage;
