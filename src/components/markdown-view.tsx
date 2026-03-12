"use client";
import createDOMPurify from "dompurify";
// import { marked } from "marked";
import { useEffect, useState } from "react";

// TODO: we should probably rename this function to something
// like "sanitizedview"
//
// We were naming it that before we switched to TipTap for
// WYSIWYG, so it was markdown-based, while the current iteration
// involves tiptap generating html, so we just have to
// sanitize for XSS
//
// Refactor after demo,
export function MarkdownView({ text }: { text: string }) {
  const [renderedHtml, setRenderedHtml] = useState("");

  // TODO: Client render this
  useEffect(
    () =>
      void (async () => setRenderedHtml(createDOMPurify().sanitize(text)))(),
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
