# GPTutor - VS Code Extension

GPTutor is a Visual Studio Code extension that uses OpenAI's GPT (Generative Pre-trained Transformer) models to provide users with code explanations and audits for a better understanding of their code. It supports Move programming languages, enabling users to get insights into code blocks and improve their coding skills.

## Features

- Get code tutor and audits using OpenAI's GPT models.
- Supports Move language for now.
- Hover over code blocks to display GPTutor suggestions.
- Set OpenAI API key for GPTutor (100% Free and we don't own your key).
- Set the GPT model to be used (supported GPT-3.5, GPT-4).

## Getting Started

1. Install the GPTutor extension in your Visual Studio Code editor.
2. Activate the extension by running the "GPTutor: init" command.
3. Set your OpenAI API key by running the "GPTutor: setKey" command.
4. (Optional) Set the GPT model to be used by running the "GPTutor: setModel" command.
5. Hover over a code block to display GPTutor suggestions.
6. Choose the tutor or audit help.

## Usage

GPTutor provides three main features: Explain, Comment, and Audit on the code you selected.


### Code Explain

1. Hover over a code block in a supported language (Move).
2. Click on the "Explain" option to get a thoughtful explanation of the selected code.

### Code Comment

1. Hover over a code block in a supported language (Move).
2. Click on the "Comment" option to get a commented and refactored version of the selected code.
### Code Audit

1. Hover over a code block in a supported language (Move).
1. Click on the "Audit" option to get an audit of the selected code.



## Extension Settings

This extension contributes the following settings:

- `gptutor.openaiApiKey`: Set your OpenAI API key.
- `gptutor.model`: Set the GPT model to be used.

## Requirements

- Visual Studio Code
- OpenAI API key

## License

This project is licensed under the MIT License. See the [License.txt](https://github.com/RayHuang880301/gptutor-extension/blob/main/LICENSE.md) file for more information.
