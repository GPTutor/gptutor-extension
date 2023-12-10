import { window } from "vscode";
import * as vscode from "vscode";
import { CursorContext } from "./context/cursor.context";

// let commands = require("./sui_move_analyzer_commands");

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
  if (languageId == "move") {
    const move_analyzer_context_1 = await import("./move_analyzer_context.js");
    const configuration = {
      server: { path: "/Users/eason/.cargo/bin/move-analyzer" },
      serverPath: "/Users/eason/.cargo/bin/move-analyzer",
      inlay: {
        hints: {
          parameter: true,
          field: { type: true },
          declare: { var: true },
        },
      },
      trace: { server: "off" },
    };
    const move_analyzer_context: any = move_analyzer_context_1.Context.create(
      extensionContext,
      configuration
    );
    await move_analyzer_context.startClient();
    const client = move_analyzer_context.getClient();

    if (client === undefined) {
      return undefined;
    }
    const hints = await client.sendRequest("textDocument/inlayHint", {
      range: [
        { line: 0, character: 0 },
        { line: document.lineCount, character: 0 },
      ],
      textDocument: { uri: document.uri.toString() },
    });
    console.log(hints);
  }

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
