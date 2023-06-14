import {
  window,
  TextEditor,
  TextDocument,
  ExtensionContext,
  languages,
  Hover,
  Position,
  commands,
} from "vscode";

export class CursorContext {
  isInited = false;
  context!: ExtensionContext;
  window!: any;
  document?: TextDocument;
  // anchorPosition?: Position;
  lastText = "";
  lastAnchorPosition: any;
  constructor(_context: ExtensionContext) {
    this.window = window;
    this.context = _context;
  }

  get currentText() {
    if (this.selectedText && this.selectedText.includes(this.hoverText)) {
      this.lastText = this.selectedText;
      return this.lastText;
    }
    this.lastText = this.hoverText || this.selectedText;
    return this.lastText.trim();
  }
  get anchorPosition() {
    return this.editor.selection.active;
  }

  get editor() {
    return this.window.activeTextEditor;
  }
  get selectedText() {
    return this.editor.document.getText(this.editor.selection);
  }

  get hoverText() {
    if (!this.document || !this.anchorPosition) {
      return "";
    }
    return this.document?.getText(
      this.document?.getWordRangeAtPosition(this.anchorPosition)
    );
  }

  getDefinitionContext = async () => {
    let channel = window.createOutputChannel("getDefinitionContext");
    const editor = this.editor;
    let activeFsPath = editor.document.uri.fsPath;
    channel.appendLine("activeFsPath" + activeFsPath);
    const activePosition = this.anchorPosition;
    await commands.executeCommand("editor.action.revealDefinition");
    // editor
    if (
      activeFsPath === editor.document.uri.fsPath &&
      activePosition === editor.selection.active
    ) {
      channel.appendLine("return NaN;");
      return NaN;
    }

    const position: any = this.anchorPosition || editor.selection.active;
    let document = this.document || editor.document;
    let currentTextLines: any = document
      .getText()
      // .replaceAll("  ", "")
      .split("\n");
    let definitionContext = currentTextLines
      .slice(position.c - 50, position.c + 50)
      .join("\n");
    channel.appendLine(
      "window.activeTextEditor?.document.uri.fsPath" +
        window.activeTextEditor?.document.uri.fsPath
    );
    if (window.activeTextEditor?.document.uri.fsPath !== activeFsPath) {
      await commands.executeCommand("workbench.action.closeActiveEditor");
    }
    return definitionContext;
  };
}
