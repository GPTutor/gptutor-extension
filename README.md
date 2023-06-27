# GPTutor(🤖,🤖) - VS Code Extension

GPTutor(🤖,🤖) is a Visual Studio Code extension that uses OpenAI's GPT (Generative Pre-trained Transformer) models to provide users with code explanations and audits for a better understanding of their code and enabling users to get insights into code blocks and improve their coding skills. (Supported Move programming languages now)

https://marketplace.visualstudio.com/items?itemName=gptutor.gptutor

## GPTutor x Move Workshop:
Come and participate in the workshop on June 28th, from 11:00 AM to 12:30 PM GMT+9, featuring Sam Blackshear, the creator of Move, and Eason Chen, the creator of GPTutor. Join us to delve into the world of GPTutor and Move development.

Register at https://lu.ma/gptutor

## Donation
GPTutor is an open-source, free tool. Donations are welcome:

Sui: gptutor.sui<br>
Ethereum: 0xCD1Ef67405DC7B2516298dcfc9De8A325d29635C<br>
BTC: 1AoMLkWvi3MGvCpeqq5YYRERKX3cZQx8U1<br>

## Features

- Code tutor using OpenAI's GPT models.
- Code audit (review) using OpenAI's GPT models.
- Code comment using OpenAI's GPT models.
- Supports Move language for now.
- Non-custodial API key (100% Free and we don't own your key).
- Supported GPT-4 model (default GPT-3.5)

## Getting Started

### 1. Install the GPTutor(🤖,🤖) in your Visual Studio Code editor from Extensions
  <img width="274" alt="截圖 2023-06-11 下午4 00 56" src="https://github.com/GPTutor/gptutor-extension/assets/84802160/94fe1248-5308-42a8-b836-2f1694a9c5c9">
<br/>
<br/>

### 2. Activate the GPTutor by clicking 🤖 at the left side panel. You might find GPTutor in the "Additional Views" button.




<img width="1210" alt="image" src="https://github.com/GPTutor/gptutor-extension/assets/43432631/e3e99bd4-502b-4bda-8439-788d957c2ec1">


<br/>
<br/>

### 3. Set OpenAI API key by pasting the key in the input box. You may follow the instruction to get an API key from [OpenAI's Webiste](https://platform.openai.com/account/api-keys)

<img width="790" alt="截圖 2023-06-11 下午4 03 46" src="https://github.com/GPTutor/gptutor-extension/assets/43432631/afc028b6-a783-4f60-b598-12e97a2900c2">

<br/>
<br/>

### 4. (Optional) Set the GPT model to be used by running the `GPTutor: setModel` Command
```
> GPTutor: setModel
```
<br/>

### 5. Hover over a code block to display GPTutor suggestions
<img width="737" alt="截圖 2023-06-11 下午4 11 02" src="https://github.com/GPTutor/gptutor-extension/assets/84802160/08586281-04fb-489c-bbf7-eba6085abdd7">
<br/>
<br/>

### 6. Choose the explain, audit or comment to help you
<img width="880" alt="截圖 2023-06-11 下午4 13 03" src="https://github.com/GPTutor/gptutor-extension/assets/84802160/9990a600-e573-4590-809d-c9f060d7caf3">
<br/>
<br/>

### 7. Click on the "Settings" button located at the top left corner to access additional configuration options. From there, you can customize settings such as Prompt, Model, or Output Language.
<img width="552" alt="image" src="https://github.com/GPTutor/gptutor-extension/assets/43432631/dfb8559a-cad8-463f-96eb-e12c435c0ece">

<br/>
<br/>

## Usage

GPTutor provides three main features: `Explain`, `Comment`, and `Audit` whhen you hover on the code you selected. Moreover, you can interact with GPTutor directly on the input box.


### Code Explain

1. Hover over a code block in a supported language.
2. Click on the `Explain` option to get a thoughtful explanation of the selected code.

### Code Comment

1. Hover over a code block in a supported language.
2. Click on the `Comment` option to get a commented and refactored version of the selected code.
### Code Audit

1. Hover over a code block in a supported language.
1. Click on the `Audit` option to get an audit of the selected code.

### Interact by Input Box

1. Input the instruction
2. Selected the mode, such as `Code Generate` and `Rewrite`
3. Execute by `Ask GPTutor`.

## Customize Prompt
Follow the instructions [in this document](docs/Prompt.md) to customize the prompt. The default prompts is in set the [package.json](package.json), you are welcome to send pull requests for your awesome prompts.

<!-- 
## Extension Settings

This extension contributes the following settings:

- `> GPTutor: setKey`: Set your OpenAI API key.
- `> GPTutor: setModel`: Set the GPT model (GPT3.5 or GPT4) to be used.
- `> GPTutor: edit prompts`: Edit your prompt to customized your needs. -->

## Requirements

- Visual Studio Code
- OpenAI API key

## License

This project is licensed under the MIT License. See the [License.txt](https://github.com/GPTutor/gptutor-extension/blob/main/LICENSE.md) file for more information.

## Paper Reference

https://arxiv.org/abs/2305.01863

```
@article{chen2023gptutor,
  title={GPTutor: a ChatGPT-powered programming tool for code explanation},
  author={Chen, Eason and Huang, Ray and Chen, Han-Shin and Tseng, Yuen-Hsien and Li, Liang-Yi},
  journal={arXiv preprint arXiv:2305.01863},
  year={2023}
}
```
