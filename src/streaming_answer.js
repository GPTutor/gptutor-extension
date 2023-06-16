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
  const res = await openai.createChatCompletion(
    {
      model: model_name,
      messages: chatMessages,
      stream: true,
      temperature: options.temperature || 1,
    },
    { responseType: "stream" }
  );
  // console.log(typeof res.data.on);

  res.data.on("data", (data) => {
    data = data.toString();
    data = data.split('\n\ndata: {"id');
    if (data.length > 1) {
      data = `{"id${data[1]}`;
    } else {
      data = data[0];
    }
    data = data.replace("data: ", "");
    if (data.includes(`"finish_reason":"stop"}]}`)) {
      finish = true;
      return;
    }

    data = JSON.parse(data);
    outMessages.push(data.choices[0].delta.content);
    on_update(data.choices[0].delta.content, outMessages.join(""), options);
  });
  while (finish === false) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return outMessages.join("");
}
