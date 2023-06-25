import * as vscode from "vscode";

export function process_prompt(
  prompt: any,
  gptutor: any,
  outputLanguage: string,
  config: any = undefined,
  user_input: string = ""
) {
  prompt.map((item: any, index: any) => {
    let content: string = item.content;
    content = content.replaceAll(
      "${languageId}",
      gptutor.currentPrompt.languageId || ""
    );
    content = content.replaceAll(
      "${entireDocument}",
      gptutor.currentPrompt.entireDocument || ""
    );
    content = content.replaceAll(
      "${codeContext}",
      gptutor.currentPrompt.codeContext || ""
    );
    content = content.replaceAll(
      "${selectedCode}",
      gptutor.currentPrompt.selectedCode
    );
    content = content.replaceAll(
      "${definitionContext}",
      gptutor.currentPrompt.selectedCode
    );
    content = content.replaceAll(
      "${codeBefore}",
      gptutor.currentPrompt.codeBefore
    );
    content = content.replaceAll(
      "${codeAfter}",
      gptutor.currentPrompt.codeAfter
    );
    content = content.replaceAll(
      "${codeContextBefore}",
      gptutor.currentPrompt.codeContextBefore
    );
    content = content.replaceAll(
      "${codeContextAfter}",
      gptutor.currentPrompt.codeContextAfter
    );
    let instructionForSpecificLanguage: any = vscode.workspace
      .getConfiguration("")
      .get("GPTutor.instructionForSpecificLanguage");
    prompt[prompt.length - 1].content +=
      instructionForSpecificLanguage[outputLanguage] || "";
    content = content.replaceAll(
      "${outputLanguage}",
      outputLanguage + instructionForSpecificLanguage
    );

    content = content.replaceAll("${user_input}", user_input);
    prompt[index].content = content;
  });

  return prompt;
}
