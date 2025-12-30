
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

const theme = {
  // Theme styling goes here
  //...
  
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

function OnChangePlugin({onChange}: {onChange: (text: string) => void}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerTextContentListener((text) => {
      onChange(text)
    })
  }, [editor, onChange]);

  return null;
}

export type TextEditorProps = {
  ref?: React.Ref<HTMLDivElement | null>
  className?: string
  style?: React.CSSProperties
  onChange?: (text: string) => void
  onScroll?: React.UIEventHandler<HTMLDivElement> 
}

export default function TextEditor(props: TextEditorProps) {
  const {ref, className, style, onChange, onScroll} = props
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
            contentEditable={
            <ContentEditable
                ref={ref}
                className={`${className ?? ""}`}
                style={(style)}
                onScroll={onScroll}
            />
            }
            ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={onChange ?? (() => {})}/>
    </LexicalComposer>
  );
}