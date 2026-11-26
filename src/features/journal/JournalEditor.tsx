'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useTranslations } from 'next-intl';
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JournalEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function JournalEditor({
  value,
  onChange,
  placeholder,
}: JournalEditorProps) {
  const t = useTranslations('journal.toolbar');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || '',
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="h-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 animate-pulse" />
    );
  }

  const tools = [
    {
      label: t('bold'),
      icon: Bold,
      active: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: t('italic'),
      icon: Italic,
      active: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: t('heading'),
      icon: Heading2,
      active: editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: t('bulletList'),
      icon: List,
      active: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: t('orderedList'),
      icon: ListOrdered,
      active: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: t('blockquote'),
      icon: Quote,
      active: editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
      <div className="flex flex-wrap gap-1 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] p-2">
        {tools.map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            className={cn(
              'rounded-md p-1.5 transition-colors cursor-pointer',
              active
                ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div className="p-3 text-sm leading-relaxed">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
