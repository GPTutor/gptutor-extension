import { window, TextEditor, TextDocument, ExtensionContext, languages, Hover, Position } from "vscode";

export class CursorContext {
  isInited = false;
  context!: ExtensionContext;
  editor!: TextEditor;
  document?: TextDocument;
  anchorPosition?: Position;
  lastText = '';
  lastAnchorPosition: any;
  constructor(_context: ExtensionContext) {
    if(!window?.activeTextEditor) {
      throw new Error("No active editor");
    }
    this.editor = window.activeTextEditor;
    this.context = _context;
  }

  init() {
    if(this.isInited) {
      throw new Error("CursorContext is already inited");
    }
    this.context.subscriptions.push(
      languages.registerHoverProvider(["solidity", "javascript", "python"], {
        provideHover: (document, position, token) => {
          this.document = document;
          this.anchorPosition = position;
          return new Hover('');
        }
      })
    );

    this.isInited = true;
  }

  get currentText() {
    if(this.selectedText && this.selectedText.includes(this.hoverText)) {
      this.lastText = this.selectedText;
      return this.lastText;  
    }
    this.lastText = this.hoverText || this.selectedText;
    return this.lastText;
  }

  get selectedText() {
    return this.editor.document.getText(this.editor.selection);
  }

  get hoverText() {
    if(!this.document || !this.anchorPosition) {
      return '';
    }
    return this.document?.getText(
      this.document?.getWordRangeAtPosition(this.anchorPosition)
    );
  }
}
