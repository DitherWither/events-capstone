import { JSDOM } from "jsdom";
import createDOMPurify, { type WindowLike } from "dompurify";
import { marked } from "marked";

export async function MarkdownView({ text }: { text: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const mWindow: WindowLike = new JSDOM("").window;
  const DOMPurify = createDOMPurify(mWindow);
  return (
    <span
      className="prose dark:prose-invert"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(await marked.parse(text)),
      }}
    ></span>
  );
}
