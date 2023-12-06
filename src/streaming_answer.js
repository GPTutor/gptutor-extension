export async function streaming_response(
  openai,
  chatMessages,
  model_name = "gpt-3.5-turbo",
  on_update = (new_text, total_text_so_far, options = {}) => {
    console.log("default on_update");
  },
  options = {}
) {
  let finish = false;
  let outMessages = [];
  const stream = await openai.chat.completions.create(
    {
      model: model_name,
      messages: chatMessages,
      stream: true,
      temperature: options.temperature || 1,
    },
    { responseType: "stream" }
  );
  // console.log(typeof res.data.on);

  for await (const chunk of stream) {
    outMessages.push(chunk.choices[0]?.delta?.content);
    on_update(chunk.choices[0]?.delta?.content, outMessages.join(""), options);
  }

  return outMessages.join("");
}
