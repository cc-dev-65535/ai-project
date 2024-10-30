from transformers import GPTNeoForCausalLM, GPT2Tokenizer

tokenizer = GPT2Tokenizer.from_pretrained("Tincando/fiction_story_generator")
model = GPTNeoForCausalLM.from_pretrained("Tincando/fiction_story_generator")


def get_model_response():
    input_prompt = "a story about a dragon"
    input_ids = tokenizer(
        input_prompt, add_special_tokens=False, return_tensors="pt"
    ).input_ids

    output = model.generate(
        input_ids,
        max_length=300,
        temperature=0.9,
        top_k=2,
        top_p=0.9,
        repetition_penalty=1.2,
        do_sample=True,
        num_return_sequences=2,
    )

    generated_story = tokenizer.batch_decode(output, clean_up_tokenization_spaces=True)[
        0
    ]
    return generated_story
