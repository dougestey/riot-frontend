import React from 'react';
import type { LexicalContent } from './types';

interface LexicalNode {
  type: string;
  tag?: string;
  text?: string;
  format?: number | string;
  children?: LexicalNode[];
  url?: string;
  listType?: string;
  direction?: string | null;
  [k: string]: unknown;
}

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_UNDERLINE = 8;

function renderText(node: LexicalNode, key: number): React.ReactNode {
  let content: React.ReactNode = node.text ?? '';
  const format = typeof node.format === 'number' ? node.format : 0;

  if (format & FORMAT_BOLD) content = <strong key={key}>{content}</strong>;
  if (format & FORMAT_ITALIC) content = <em key={key}>{content}</em>;
  if (format & FORMAT_UNDERLINE) content = <u key={key}>{content}</u>;

  if (format === 0) return <React.Fragment key={key}>{content}</React.Fragment>;
  return content;
}

function renderNode(node: LexicalNode, key: number): React.ReactNode {
  const children = node.children?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case 'root':
      return <React.Fragment key={key}>{children}</React.Fragment>;

    case 'paragraph':
      return (
        <p key={key} className="mb-3 leading-relaxed">
          {children}
        </p>
      );

    case 'heading': {
      const Tag = (node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') || 'h3';
      return (
        <Tag key={key} className="font-display mt-5 mb-2 font-semibold">
          {children}
        </Tag>
      );
    }

    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul';
      return (
        <Tag key={key} className="mb-3 ml-5 list-outside list-disc space-y-1">
          {children}
        </Tag>
      );
    }

    case 'listitem':
      return <li key={key}>{children}</li>;

    case 'link':
      return (
        <a
          key={key}
          href={(node.url as string) ?? '#'}
          className="text-riot-pink underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );

    case 'autolink':
      return (
        <a
          key={key}
          href={(node.url as string) ?? '#'}
          className="text-riot-pink underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );

    case 'text':
      return renderText(node, key);

    case 'linebreak':
      return <br key={key} />;

    case 'quote':
      return (
        <blockquote
          key={key}
          className="mb-3 border-l-4 border-riot-pink/30 pl-4 italic text-riot-text-secondary"
        >
          {children}
        </blockquote>
      );

    default:
      if (children && children.length > 0) {
        return <React.Fragment key={key}>{children}</React.Fragment>;
      }
      return null;
  }
}

interface LexicalRendererProps {
  content: LexicalContent;
  className?: string;
}

export function LexicalRenderer({ content, className }: LexicalRendererProps) {
  if (!content?.root?.children) return null;

  return (
    <div className={className}>
      {content.root.children.map((node, i) =>
        renderNode(node as LexicalNode, i)
      )}
    </div>
  );
}
