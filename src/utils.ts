import { commands, window } from "vscode";

export type reqType = {
  role: string;
  content: string;
};

export const sleep = (second: number) => {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
};

export const getDefinitionContext = async () => {
  let channel = window.createOutputChannel("getDefinitionContext");
  let editor: any = window.activeTextEditor;
  let activeFsPath = editor.document.uri.fsPath;
  channel.appendLine("activeFsPath" + activeFsPath);
  const activePosition = editor.selection.active;
  await commands.executeCommand("editor.action.revealDefinition");
  editor = window.activeTextEditor;
  if (
    activeFsPath === editor.document.uri.fsPath &&
    activePosition === editor.selection.active
  ) {
    channel.appendLine("return NaN;");
    return NaN;
  }

  const position = editor.selection.active;
  console.log("position", position);
  let document = editor.document;
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

export const getTutorRequestMsg = (
  languageId: string,
  definitionContextPrompt: string,
  codeContext: string,
  question: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `You are a helpful coding tutor master in ${languageId}.`,
    },
    {
      role: "user",
      content: `${definitionContextPrompt}\n\nThe following is the ${languageId} code:\n${codeContext}\n\n${question}`,
    },
  ];
};

//! Eason plz content
export const getAuditRequestMsg = (
  languageId: string,
  definitionContextPrompt: string,
  codeContext: string,
  question: string
): reqType[] => {
  return [
    {
      role: "system",
      content: `You are a helpful coding tutor master in ${languageId}.`,
    },
    {
      role: "user",
      content: `${definitionContextPrompt}\n\nThe following is the ${languageId} code:\n${codeContext}\n\n${question}`,
    },
  ];
};
