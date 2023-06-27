# Prompt Engineering with GPTutor

### What is GPTutor? How it work?

GPTutor is an AI tool that enhances your programming and code-reading efficiency. Check out this video first:

https://www.youtube.com/watch?v=uTNXQuKrnKI

### How to prompt engineering with GPTutor?

You can design prompts in GPTutor by clicking settings → edit prompt (or search `GPTutor.prompt` in VS Code’s setting), then click `Edit in setting.json`.

Then, you will see the value of `GPTutor.prompts` and `GPTutor.promptInputBox` arrange in the following format:

```json
"GPTutor.prompts": {
    "global": {
      "explain": {
        "display_name": "🧑‍🏫 Explain",
        "type": "chatgpt-prompt",
        "prompt": [
          {
            "role": "system",
            "content": "You are a Senior ${languageId} Developer..."
          },
          {
            "role": "user",
            "content": "...The ${languageId} code I selected is in the following triple quotes \"\"\"${selectedCode}\"\"\". You don't need to repeat the selected code again. Please focus on explain target ${languageId} code. Output in ${outputLanguage}."
          }
        ]
      },
      "comment": {...},
      "audit": {...},
    }
    "specificLanguage": {
      "move": {
        "explain": {
          "display_name": "🧑‍🏫 Explain",
          "type": "chatgpt-prompt",
          "prompt": [
            {
              "role": "system",
              "content": "Move is an open source language for writing safe smart contracts. It's format is similar to Rust. You are a Senior ${languageId} Developer..."
            },
            {
              "role": "user",
              "content": "..."
            }
          ]
        },
        "comment": {...},
        "audit": {...}
      }
    }
  }
"GPTutor.promptsForInputBox": {
    "global": {
        "default": {
        "display_name": "🤖 Code Generate",
        "type": "chatgpt-prompt",
        "prompt": [
            {
            "role": "system",
            "content": "You are a helpful assistant that generate the ${languageId} code according to user's instruction..."
            },
            {
            "role": "user",
            "content": "Instruction: ${user_input}"
            }
        ]
    }
}
```

(`…` is the part omitted for a clearer view (otherwise, it is too long).)

The following is the explanation of the `GPTutor.prompts` and `GPTutor.promptsForInputBox`:

1. `GPTutor.prompts` is the prompt configs when you hover the selected code.
2. `GPTutor.promptsForInputBox` is the prompt configs when you interact with the input box.
3. Global: These prompts will take effect in all languages.
4. Specific Language: These prompts will only affect the key in the specified language. For instance, the prompt labeled "move" will only show up when the document's language is Move.
5. Keys: `explain`, `comment`, and `audit` are the function's keys. If a key in the specific language duplicates a key in the global section, the specific language key will be prioritized.
6. `display_name`: This is the name that will be displayed in GPTutor's pop-up or dropdown menu.
7. `type`: This indicates the type of prompt. Currently, only `chatgpt-prompt` is supported, but we plan to support others such as Google-Bard, Azure, and 3rd party Service Proxy APIs in the future.
8. `prompt`: This is the specific prompt that will be used for ChatGPT.

### Lists of Prompts

| Key | Description |
| --- | --- |
| languageId | The language identifier of the current document in Visual Studio Code. (For example, when you open a Python file, it will be "python") |
| entireDocument | The entire content of the current document as a single string. |
| codeContext | The code surrounding with the current cursor position, including 300 lines before and after. |
| definitionContext | The code related to the definition of the selected function. It is obtained by calling the getDefinition command in VS Code. |
| selectedCode | The currently selected code by the user. |
| codeBefore | All code before the current cursor position. |
| codeAfter | All code after the current cursor position. |
| codeContextBefore | The code before the current cursor position, limited to 100 lines. |
| codeContextAfter | The code after the current cursor position, limited to 100 lines. |
| outputLanguage | the output language user selected. For example, English. |

### Examine Prompt Value:

To see the current prompt sent to the OpenAI, you may click the `Show Prompt` button on top of the output. You can edit it directly and run again. Yet to use it permainately, you should go to VSCode's Setting.json by click Settings → Edit Prompt.