# GPTutor(🤖,🤖) - VS Code Extension

GPTutor(🤖,🤖) is a Visual Studio Code extension that uses OpenAI's GPT (Generative Pre-trained Transformer) models to provide users with code explanations and audits for a better understanding of their code and enabling users to get insights into code blocks and improve their coding skills. (Supported Move programming languages now)

https://marketplace.visualstudio.com/items?itemName=gptutor.gptutor

## Features

- Code tutor using OpenAI's GPT models.
- Code audit (review) using OpenAI's GPT models.
- Code comment using OpenAI's GPT models.
- Supports Move language for now.
- Non-custodial API key (100% Free and we don't own your key).
- Supported GPT-4 model (default GPT-3.5)

## Getting Started

1. Install the GPTutor(🤖,🤖) in your Visual Studio Code editor from extensions
  <img width="274" alt="截圖 2023-06-11 下午4 00 56" src="https://github.com/RayHuang880301/gptutor-extension/assets/84802160/94fe1248-5308-42a8-b836-2f1694a9c5c9">
<br/>
<br/>

2. Activate the GPTutor(🤖,🤖) by running the `GPTutor: init`
```
> GPTutor: init
```
<img width="869" alt="截圖 2023-06-11 下午3 59 34" src="https://github.com/RayHuang880301/gptutor-extension/assets/84802160/d3e376b4-4d2b-447a-8aa1-20a5216dfe95">
<br/>
<br/>

3. Set your OpenAI API key by running the `GPTutor: setKey`
```
> GPTutor: setKey
```
<img width="790" alt="截圖 2023-06-11 下午4 03 46" src="https://github.com/RayHuang880301/gptutor-extension/assets/84802160/4d6f40a2-8060-47ba-bd5b-7ccef08384d7">
<br/>
<br/>

4. (Optional) Set the GPT model to be used by running the `GPTutor: setModel`
```
> GPTutor: setModel
```
<br/>

5. Hover over a code block to display GPTutor suggestions
<img width="737" alt="截圖 2023-06-11 下午4 11 02" src="https://github.com/RayHuang880301/gptutor-extension/assets/84802160/08586281-04fb-489c-bbf7-eba6085abdd7">
<br/>
<br/>

6. Choose the explain, audit or comment to help you
<img width="880" alt="截圖 2023-06-11 下午4 13 03" src="https://github.com/RayHuang880301/gptutor-extension/assets/84802160/9990a600-e573-4590-809d-c9f060d7caf3">
<br/>
<br/>

## Usage

GPTutor provides three main features: `Explain`, `Comment`, and `Audit` on the code you selected.


### Code Explain

1. Hover over a code block in a supported language.
2. Click on the `Explain` option to get a thoughtful explanation of the selected code.

### Code Comment

1. Hover over a code block in a supported language.
2. Click on the `Comment` option to get a commented and refactored version of the selected code.
### Code Audit

1. Hover over a code block in a supported language.
1. Click on the `Audit` option to get an audit of the selected code.



## Extension Settings

This extension contributes the following settings:

- `> GPTutor: setKey`: Set your OpenAI API key.
- `> GPTutor: setModel`: Set the GPT model (GPT3.5 or GPT4) to be used.
- `> GPTutor: edit Prompts`: Edit your prompt to customized your needs.

## Requirements

- Visual Studio Code
- OpenAI API key

## License

This project is licensed under the MIT License. See the [License.txt](https://github.com/RayHuang880301/gptutor-extension/blob/main/LICENSE.md) file for more information.
