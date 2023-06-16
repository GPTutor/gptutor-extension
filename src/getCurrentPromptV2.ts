import { window } from "vscode";
import { CursorContext } from "./context/cursor.context";

export async function getCurrentPromptV2(
  extensionContext: any,
  cursorContext: CursorContext
) {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage("No active editor");
    throw new Error("No active editor");
  }

  const document = editor.document;
  const languageId = document.languageId;

  const currentTextLines = document.getText().split("\n");
  const anchorPosition: any = cursorContext.anchorPosition;

  const explainContext = currentTextLines
    .slice(anchorPosition.c - 300, anchorPosition.c + 300)
    .join("\n");

  const auditContext = currentTextLines
    .slice(0, currentTextLines.length)
    .join("\n");
  let codeContext = explainContext;
  let selectedCode = cursorContext.currentText;

  // const definitionContext = await cursorContext.getDefinitionContext();
  // const definitionContextPrompt = `The following is the source code of the line ${currentTextLines[anchorPosition.c]}:\n${definitionContext}`;
  return {
    languageId,
    auditContext,
    explainContext,
    codeContext,
    selectedCode,
  };
}
