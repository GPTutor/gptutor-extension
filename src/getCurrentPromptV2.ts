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

  const codeContext = currentTextLines
    .slice(anchorPosition.c - 300, anchorPosition.c + 300)
    .join("\n");

  const codeBefore = currentTextLines.slice(0, anchorPosition.c).join("\n");
  const codeAfter = currentTextLines
    .slice(anchorPosition.c, currentTextLines.length)
    .join("\n");
  const codeContextBefore = currentTextLines
    .slice(anchorPosition.c - 100, anchorPosition.c)
    .join("\n");
  const codeContextAfter = currentTextLines
    .slice(anchorPosition.c, anchorPosition.c + 100)
    .join("\n");

  const entireDocument = currentTextLines
    .slice(0, currentTextLines.length)
    .join("\n");
  let selectedCode = cursorContext.currentText;

  // const definitionContext = await cursorContext.getDefinitionContext();
  let definitionContext = "";
  // const definitionContextPrompt = `The following is the source code of the line ${currentTextLines[anchorPosition.c]}:\n${definitionContext}`;
  return {
    languageId,
    entireDocument,
    codeContext,
    definitionContext,
    selectedCode,
    codeBefore,
    codeAfter,
    codeContextBefore,
    codeContextAfter,
  };
}
