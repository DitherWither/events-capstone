"use client";
import createDOMPurify from "dompurify";
import { marked } from "marked";
import { useEffect, useState } from "react";

export function MarkdownView({ text }: { text: string }) {
  const [renderedHtml, setRenderedHtml] = useState("");

  // TODO: Client render this
  useEffect(
    () =>
      void (async () =>
        setRenderedHtml(
          createDOMPurify().sanitize(await marked.parse(text)),
        ))(),
    [text],
  );

  return (
    <span
      className="prose dark:prose-invert"
      dangerouslySetInnerHTML={{
        __html: renderedHtml,
      }}
    ></span>
  );
}
