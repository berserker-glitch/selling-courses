"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Button } from './ui/button'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Undo,
    Redo,
    Minus
} from 'lucide-react'

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm dark:prose-invert max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    const ToolbarButton = ({
        onClick,
        isActive = false,
        icon: Icon,
        title
    }: {
        onClick: () => void,
        isActive?: boolean,
        icon: any,
        title: string
    }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={`h-8 w-8 p-0 ${isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            type="button"
            title={title}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )

    return (
        <div className="flex flex-col gap-2 rounded-md border border-input bg-background">
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/20 p-1">
                {/* Text Formatting */}
                <div className="flex items-center gap-0.5 pr-2 border-r border-border/50">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon={Bold}
                        title="Bold"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon={Italic}
                        title="Italic"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        icon={UnderlineIcon}
                        title="Underline"
                    />
                </div>

                {/* Headings & Block Types */}
                <div className="flex items-center gap-0.5 px-2 border-r border-border/50">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        icon={Heading1}
                        title="Heading 1"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon={Heading2}
                        title="Heading 2"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon={Quote}
                        title="Blockquote"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        icon={Code}
                        title="Code Block"
                    />
                </div>

                {/* Lists & Alignment */}
                <div className="flex items-center gap-0.5 px-2 border-r border-border/50">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon={List}
                        title="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        icon={ListOrdered}
                        title="Ordered List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        icon={Minus}
                        title="Horizontal Rule"
                    />
                </div>

                {/* History */}
                <div className="flex items-center gap-0.5 pl-2 ml-auto">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        icon={Undo}
                        title="Undo"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        icon={Redo}
                        title="Redo"
                    />
                </div>
            </div>

            <div className="p-2 min-h-[150px]">
                <EditorContent editor={editor} className="outline-none" />
            </div>
        </div>
    )
}
