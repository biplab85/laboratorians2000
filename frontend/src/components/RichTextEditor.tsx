'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Undo,
  Redo,
  Pilcrow,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing...', rows = 6 }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
        style: `min-height: ${rows * 1.5}rem; padding: 0.75rem 1rem;`,
      },
    },
  });

  if (!editor) return null;

  const ToolBtn = ({
    active,
    onClick,
    children,
    title,
  }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="w-px h-5 bg-border/60 mx-0.5" />;

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted/20 border-b border-border/50 px-3 py-2 flex flex-wrap items-center gap-0.5">
        <ToolBtn
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Paragraph"
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolBtn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="text-sm text-foreground bg-background [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground/50 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none" />
    </div>
  );
}
