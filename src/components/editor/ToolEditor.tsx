'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Wand2,
  RotateCcw,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

/**
 * Shape of toolbar toggle states – strongly-typed so we always
 * update the full object and avoid undefined look-ups.
 */
interface ActiveButtons {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
}

/**
 * Utility union types for better autocompletion where appropriate.
 */
export type FontSize = '12' | '14' | '16' | '18' | '20' | '24' | '28' | '32';
export type FormatTag =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'blockquote'
  | 'code';
export type ListStyle = 'none' | 'bullet' | 'number' | 'check' | 'arrow' | 'dash';

interface RichTextEditorProps {
  onSave?: (data: { title: string; signature: string }) => void;
  title?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  content?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({  onContentChange, content }) => {
  const [fontSize, setFontSize] = useState<FontSize>('16');
  const [showFontDropdown, setShowFontDropdown] = useState<boolean>(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState<boolean>(false);
//   const [showListDropdown, setShowListDropdown] = useState<boolean>(false);
  const [activeButtons, setActiveButtons] = useState<ActiveButtons>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false
  });
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{top: number, left: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  /**
   * Sync editor content with prop
   */
  useEffect(() => {
    if (
      typeof content === 'string' &&
      editorRef.current &&
      content !== editorRef.current.innerHTML
    ) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  /**
   * Cross-browser helper around the deprecated execCommand API.
   * Although deprecated it is still the quickest way to deliver a rich-text
   * MVP without external dependencies. Wrap in try/catch for safety.
   */
  const execCommand = (command: string, value: string | null = null): void => {
    editorRef.current?.focus();
    try {
      /**
       * The ignore rule suppresses the TS lib.dom deprecation warning.
       * You may replace this with a modern editor later without breaking
       * consumer components.
       */
      // @ts-expect-error execCommand is deprecated but still required for MVP
      document.execCommand(command, false, value);
      // Let the DOM settle and then sync internal content + toolbar state.
      setTimeout(() => {
        if (editorRef.current) {
          updateActiveButtons();
          if (onContentChange) onContentChange(editorRef.current.innerHTML);
        }
      }, 10);
    } catch (error) {
      /* eslint-disable no-console */
      console.error('execCommand failed', command, error);
    }
  };

  /**
   * Updates the toolbar button state based on the current selection.
   */
  const updateActiveButtons = (): void => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    setActiveButtons({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList')
    });
  };

  /**
   * Handle raw content changes coming from onInput.
   */
  const handleContentChange = () => {
    if (editorRef.current && onContentChange) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  /**
   * Helper to insert headings / block elements.
   */
  const handleFormatSelect = (tag: FormatTag): void => {
    editorRef.current?.focus();

    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      setShowFormatDropdown(false);
      return;
    }

    const range = selection.getRangeAt(0);

    const elementFactory = (): HTMLElement => {
      const el = document.createElement(tag);
      switch (tag) {
        case 'h1':
          Object.assign(el.style, {
            fontSize: '2em',
            fontWeight: 'bold',
            color: '#3b82f6',
            margin: '0.67em 0'
          });
          el.textContent = 'Header 1';
          break;
        case 'h2':
          Object.assign(el.style, {
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: '#374151',
            margin: '0.83em 0'
          });
          el.textContent = 'Header 2';
          break;
        case 'h3':
          Object.assign(el.style, {
            fontSize: '1.17em',
            fontWeight: '600',
            color: '#3b82f6',
            margin: '1em 0'
          });
          el.textContent = 'Header 3';
          break;
        case 'h4':
          Object.assign(el.style, {
            fontSize: '1em',
            fontWeight: '600',
            color: '#3b82f6',
            margin: '1.33em 0'
          });
          el.textContent = 'Header 4';
          break;
        case 'h5':
          Object.assign(el.style, {
            fontSize: '0.83em',
            fontWeight: '600',
            color: '#374151',
            margin: '1.67em 0'
          });
          el.textContent = 'Header 5';
          break;
        case 'h6':
          Object.assign(el.style, {
            fontSize: '0.67em',
            fontWeight: '500',
            color: '#3b82f6',
            margin: '2.33em 0'
          });
          el.textContent = 'Header 6';
          break;
        case 'blockquote':
          Object.assign(el.style, {
            borderLeft: '4px solid #d1d5db',
            paddingLeft: '1em',
            margin: '1em 0',
            fontStyle: 'italic',
            color: '#6b7280'
          });
          el.textContent = 'Quote text here';
          break;
        case 'code':
          Object.assign(el.style, {
            backgroundColor: '#f3f4f6',
            padding: '0.125em 0.25em',
            borderRadius: '0.25em',
            fontFamily: 'monospace',
            fontSize: '0.875em'
          });
          el.textContent = 'code';
          break;
        default:
          el.textContent = 'Normal text';
      }
      return el;
    };

    // Collapsed selection – insert new element and place caret inside.
    if (range.collapsed) {
      const element = elementFactory();
      range.insertNode(element);

      const caret = document.createRange();
      caret.selectNodeContents(element);
      caret.collapse(false);
      selection.removeAllRanges();
      selection.addRange(caret);
    } else {
      // Non-collapsed: wrap selected text.
      const selectedText = range.toString();
      range.deleteContents();
      const element = elementFactory();
      element.textContent = selectedText;
      range.insertNode(element);
    }

    setShowFormatDropdown(false);
  };

  /**
   * Font size dropdown logic.
   */
  const handleFontSizeChange = (size: FontSize): void => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (!range.collapsed) {
      // Wrap selected text in span.
      const selectedText = range.toString();
      range.deleteContents();
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      span.textContent = selectedText;
      range.insertNode(span);
    } else {
      // Alter font size for future typing.
      execCommand('fontSize', '7');
      setTimeout(() => {
        const fonts = editorRef.current?.querySelectorAll('font[size="7"]') ?? [];
        fonts.forEach(f => {
          (f as HTMLElement).style.fontSize = `${size}px`;
          f.removeAttribute('size');
        });
      }, 10);
    }

    setFontSize(size);
    setShowFontDropdown(false);
  };

  /**
   * Handles custom list styles beyond execCommand capabilities.
   */
  /**
   * Insert or wrap selection with an anchor tag.
   */

  /**
   * Close any open dropdowns when clicking away.
   */
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowFontDropdown(false);
        setShowFormatDropdown(false);
        // setShowListDropdown(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to show toolbar when image is clicked
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImage(target as HTMLImageElement);
      const rect = target.getBoundingClientRect();
      setToolbarPos({
        top: rect.top + window.scrollY + rect.height + 8,
        left: rect.left + window.scrollX,
      });
    } else {
      setSelectedImage(null);
      setToolbarPos(null);
    }
  }, []);

  // Controls for image toolbar
  const handleImageResize = (percent: number) => {
    if (selectedImage) {
      selectedImage.style.width = percent + '%';
      selectedImage.style.height = 'auto';
      if (onContentChange && editorRef.current) onContentChange(editorRef.current.innerHTML);
    }
  };
  const handleImageAlign = (align: 'left' | 'center' | 'right') => {
    if (selectedImage) {
      if (align === 'left') {
        selectedImage.style.float = 'left';
        selectedImage.style.marginRight = '16px';
        selectedImage.style.marginLeft = '0';
        selectedImage.style.display = '';
        selectedImage.style.marginTop = '0';
        selectedImage.style.marginBottom = '0';
      } else if (align === 'right') {
        selectedImage.style.float = 'right';
        selectedImage.style.marginLeft = '16px';
        selectedImage.style.marginRight = '0';
        selectedImage.style.display = '';
        selectedImage.style.marginTop = '0';
        selectedImage.style.marginBottom = '0';
      } else if (align === 'center') {
        selectedImage.style.float = '';
        selectedImage.style.display = 'block';
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = 'auto';
        selectedImage.style.marginTop = '0';
        selectedImage.style.marginBottom = '0';
      }
      if (onContentChange && editorRef.current) onContentChange(editorRef.current.innerHTML);
    }
  };
  const handleImageDelete = () => {
    if (selectedImage && selectedImage.parentNode) {
      selectedImage.parentNode.removeChild(selectedImage);
      setSelectedImage(null);
      setToolbarPos(null);
      if (onContentChange && editorRef.current) onContentChange(editorRef.current.innerHTML);
    }
  };
  const handleInsertImage = () => {
    fileInputRef.current?.click();
  };
  const handleImageReset = () => {
    if (selectedImage) {
      selectedImage.removeAttribute('style');
      // Do not remove classList, so .profile-image stays
      if (onContentChange && editorRef.current) onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && editorRef.current) {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = 'Inserted Image';
        img.classList.add('profile-image');
        img.style.maxWidth = '100%';
        img.style.display = 'block';
        img.style.margin = '8px 0';
        // Insert at cursor
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.insertNode(img);
          // Move cursor after image
          range.setStartAfter(img);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          editorRef.current.appendChild(img);
        }
        if (onContentChange) onContentChange(editorRef.current.innerHTML);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be uploaded again if needed
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="overflow-hidden h-full">
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Font Size Dropdown */}
            <div className="relative dropdown-container">
              <button
                type="button"
                onClick={() => setShowFontDropdown(prev => !prev)}
                className="flex items-center gap-1 px-3 py-1 text-black border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                <span>{fontSize}</span>
                <ChevronDown size={14} />
              </button>
              {showFontDropdown && (
                <div className="absolute top-full left-0 mt-1 text-black bg-white border border-gray-300 rounded shadow-lg z-10 min-w-16">
                  {(['12', '14', '16', '18', '20', '24', '28', '32'] as FontSize[]).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleFontSizeChange(size)}
                      className="block w-full text-left px-3 py-2 bg-white text-black hover:bg-gray-100"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* <div className="w-px h-6 bg-gray-300" /> */}

            {/* Basic Formatting */}
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.bold ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.italic ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.underline ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand('strikeThrough')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.strikeThrough ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>

            {/* <div className="w-px h-6 bg-gray-300" /> */}

            {/* Lists */}
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.insertUnorderedList ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.insertOrderedList ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>

            {/* <div className="w-px h-6 bg-gray-300" /> */}

            {/* Format Dropdown */}
            <div className="relative dropdown-container">
              <button
                type="button"
                onClick={() => setShowFormatDropdown(prev => !prev)}
                className="flex items-center gap-1 text-black px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                <Wand2 size={20} className="mr-1" />
                <span>Format</span>
                <ChevronDown size={18} />
              </button>
              {showFormatDropdown && (
                <div className="absolute top-full left-0 mt-1 text-black bg-white border border-gray-300 shadow-sm z-10 min-w-48">
                  {(['p', 'blockquote', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as FormatTag[]).map(tag => (
                    <button
                      // eslint-disable-next-line react/no-array-index-key
                      key={tag}
                      type="button"
                      onClick={() => handleFormatSelect(tag)}
                      className="block w-full text-left px-3 py-2 bg-transparent text-black border-none hover:bg-gray-100"
                    >
                      {tag === 'p' && 'Normal'}
                      {tag === 'blockquote' && 'Quote'}
                      {tag === 'code' && 'Code'}
                      {tag.startsWith('h') && (
                        <span
                          className={
                            {
                              p: 'text-gray-700',
                              blockquote: 'text-gray-600 italic',
                              code: 'text-gray-700 font-mono',
                              h1: 'text-blue-500 text-2xl font-bold',
                              h2: 'text-gray-700 text-xl font-bold',
                              h3: 'text-blue-500 text-lg font-semibold',
                              h4: 'text-blue-500 text-base font-semibold',
                              h5: 'text-gray-700 text-sm font-semibold',
                              h6: 'text-blue-500 text-sm font-medium'
                            }[tag]
                          }
                        >
                          Header {tag.slice(1)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            

        

            {/* <div className="w-px h-6 bg-gray-300" /> */}

            {/* Alignment */}
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.justifyLeft ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.justifyCenter ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              className={`p-2 rounded bg-white text-black border border-gray-300 ${activeButtons.justifyRight ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>

            <div className="flex-1" />

            {/* List Style Dropdown */}
            {/* <div className="relative dropdown-container">
              <button
                type="button"
                onClick={() => setShowListDropdown(prev => !prev)}
                className="flex items-center gap-1 px-3 py-1 text-black border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-600 rounded-full" />
                    <div className="w-3 h-0.5 bg-gray-600" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-600 rounded-full" />
                    <div className="w-3 h-0.5 bg-gray-600" />
                  </div>
                </div>
                <ChevronDown size={14} />
              </button>
              {showListDropdown && (
                <div className="absolute top-full right-0 mt-1 text-black bg-white border border-gray-300 rounded shadow-lg z-10 min-w-64 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {(['none', 'bullet', 'number', 'check', 'arrow', 'dash'] as ListStyle[]).map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleListStyle(style)}
                        className="flex flex-col items-center p-3 hover:bg-gray-100 rounded"
                        title={style}
                      >
                        <span className="text-xs capitalize text-gray-700">{style}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div> */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handleInsertImage}
              className="p-2 rounded bg-white text-black border border-gray-300 hover:bg-gray-200"
              title="Insert Image"
            >
              <ImageIcon size={18} />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex">
          <div className="w-full">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onKeyUp={updateActiveButtons}
              onMouseUp={updateActiveButtons}
              onClick={handleEditorClick}
              className="min-h-96 p-4 outline-none"
              style={{ fontSize: `${fontSize}px` }}
              suppressContentEditableWarning
            />
            {/* Floating Image Toolbar */}
            {selectedImage && toolbarPos && (
              <div
                style={{
                  position: 'absolute',
                  top: toolbarPos.top,
                  left: toolbarPos.left,
                  zIndex: 1000,
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: '10px 16px',
                  display: 'flex',
                  gap: 18,
                  alignItems: 'center',
                }}
              >
                <button onClick={() => handleImageResize(100)} title="100%" style={{fontSize:14}}>100%</button>
                <button onClick={() => handleImageResize(50)} title="50%" style={{fontSize:14}}>50%</button>
                <button onClick={() => handleImageResize(25)} title="25%" style={{fontSize:14}}>25%</button>
                <button onClick={() => handleImageAlign('left')} title="Float Left"><AlignLeft size={20} /></button>
                <button onClick={() => handleImageAlign('center')} title="Center Image"><AlignCenter size={20} /></button>
                <button onClick={() => handleImageAlign('right')} title="Float Right"><AlignRight size={20} /></button>
                <button onClick={handleImageReset} title="Reset Image" style={{color: '#555'}}><RotateCcw size={20} /></button>
                <button onClick={handleImageDelete} title="Delete" style={{color: 'red'}}><Trash2 size={20} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
